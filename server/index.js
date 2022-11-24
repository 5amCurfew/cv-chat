const PORT = process.env.PORT || 3000;
const fs = require('fs');
const path = require('path');
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const dayjs = require('dayjs')

console.log(__dirname);

///////////////////////////////
// Tensorflow Toxicity & Sentiment models
///////////////////////////////
const tf = require('@tensorflow/tfjs-node');
const toxicity = require('@tensorflow-models/toxicity');

//const sentimentMetadata = JSON.parse(fs.readFileSync(path.join(__dirname, '/server/lib/sentimentMetadata.json')))
//const sentimentModel = tf.loadLayersModel(JSON.parse(fs.readFileSync(path.join(__dirname, '/server/lib/sentimentModel.json'))))

const fetchSentimentMetadata = async () => {
  try{
    const m = await fetch(`https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/metadata.json`)
    return m.json()
  } catch(err){
    console.log(err)
  }
}

const fetchSentimentModel = async () => {
  try{
    const model = await tf.loadLayersModel(`https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/model.json`);
    return model;
  } catch(err){
    console.log(err)
  }
};

const padSequences = (sequences, metadata) => {
  return sequences.map(seq => {
    if (seq.length > metadata.max_len) {
      seq.splice(0, seq.length - metadata.max_len);
    }
    if (seq.length < metadata.max_len) {
      const pad = [];
      for (let i = 0; i < metadata.max_len - seq.length; ++i) {
        pad.push(0);
      }
      seq = pad.concat(seq);
    }
    return seq;
  });
}

const predictSentiment = async (text) => {

  const model = await fetchSentimentModel(); 
  const metadata = await fetchSentimentMetadata();

  const trimmed = text.trim().toLowerCase().replace(/(\.|\,|\!)/g, '').split(' ');
  const sequence = trimmed.map(word => {
    const wordIndex = metadata.word_index[word];
    if (typeof wordIndex === 'undefined') {
      return  2; //oov_index
    }
    return wordIndex + metadata.index_from;
  });

  const paddedSequence = padSequences([sequence], metadata);
  const input = tf.tensor2d(paddedSequence, [1, metadata.max_len]);
  const predictOut = model.predict(input);
  const score = predictOut.dataSync()[0];
  predictOut.dispose();
  return score;
}

///////////////////////////////
// SERVER
///////////////////////////////
app.use(express.static('client'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/index.html'));
});

io.on('connection', (socket) => {

  ///////////////////////////////
  // Show CONNECTION
  ///////////////////////////////
  io.emit('chatMessage', 
    {
      sender: `${String.fromCodePoint(0x1F916)}`,
      text: `${socket.id} joined ${String.fromCodePoint(0x1F37B)}`,
      type: `connect`,
      socketId: socket.id,
      isServerMessage: true,
      timestamp: new Date()
    }
  );

  ///////////////////////////////
  // Show DISCONNECT
  ///////////////////////////////
  socket.on('disconnect', () => {
    let outro = {
      sender: `${String.fromCodePoint(0x1F916)}`,
      text: ` ${socket.id} left ${String.fromCodePoint(0x1F695)}`,
      type: `disconnect`,
      context: socket.id,
      isServerMessage: true,
      timestamp: new Date()
    }; 
    io.emit('chatMessage', outro);
  });

  ///////////////////////////////
  // RECEIVE chatMessage from CLIENT THEN ...
  ///////////////////////////////
  socket.on('chatMessage', (msg) => {

    msg.timeFormatted = dayjs().format('ddd, D MMMM (HH:mm)')

    ///////////////////////////////
    // Toxicity
    ///////////////////////////////
    toxicity
      .load(0.8)
      .then(model => {
        model.classify(msg.text).then(predictions => {

          let matches = predictions.filter( (p) => p.results[0].match === true );

          if(matches.length > 0){
            msg.text = String.fromCodePoint(0x1F6AB).repeat(3);
            io.emit('chatMessage', msg);
          } else{
            io.emit('chatMessage', msg);
          }
        });
    })
    ///////////////////////////////
    // Sentiment
    ///////////////////////////////
    .then( () => {
      predictSentiment(msg.text).then((sentimentScore) => {
        let sentimentMsg = {
          sender: `${String.fromCodePoint(0x1F916)}`,
          text: `Sentiment score: ${Math.round(sentimentScore*100)/100}`,
          type: 'sentiment',
          timestamp: new Date(),
          socketId: 'server',
          isServerMessage: true,
          timeFormatted: dayjs().format('ddd, D MMMM (HH:mm)')
        }
        io.emit('chatMessage', sentimentMsg)
      });
    });

  });

});

http.listen(PORT, () => {
  console.log(`CV-Chat server running on http://localhost:${PORT}/`);
});