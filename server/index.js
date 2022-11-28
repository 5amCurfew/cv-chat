const PORT = process.env.PORT || 3000;
const path = require('path');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const dayjs = require('dayjs')

///////////////////////////////
// Tensorflow Toxicity & Sentiment models
///////////////////////////////
const Toxicity = require('@tensorflow-models/toxicity');
const Sentiment = require("./lib/Sentiment");

const evaluateToxicity = async (msg) => {
  try{
    const model = await Toxicity.load(0.8)
    const predictions = await model.classify(msg.text)
    let matches = predictions.filter( (p) => p.results[0].match === true );
    msg.isToxic = matches.length > 0 ? true : false
    msg.textFinal = msg.isToxic ? String.fromCodePoint(0x1F6AB).repeat(3) : msg.text
  }catch(error){
    console.log('--- ERROR evaluateToxicity() (Skipping) ---')
    msg.isToxic = null
    msg.textFinal = msg.text
    console.error(error)
  }
}

const evaluateSentiment = async (msg) => {
  try{
    const sentimentScore = await Sentiment.predict(msg.text)
    msg.sentimentScore = sentimentScore
    if(msg.sentimentScore > 0.75){
      msg.sentimentIcon = '&#128540;'
    }else if(msg.sentimentScore > 0.35){
      msg.sentimentIcon = '&#128528;'
    }else{
      msg.sentimentIcon = '&#128544;'
    }
  } catch(error){
    console.log('--- ERROR Sentiment.predict() (Skipping) ---')
    msg.sentimentScore = null;
    msg.sentimentIcon = '&#128173;'
    console.error(error)
  }
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
      timestamp: new Date(),
      timeFormatted: dayjs().format('ddd, D MMMM (HH:mm)'),
      sentimentScore: null,
      sentimentIcon: null
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
      timestamp: new Date(),
      timeFormatted: dayjs().format('ddd, D MMMM (HH:mm)'),
      sentimentScore: null,
      sentimentIcon: null
    }; 
    io.emit('chatMessage', outro);
  });

  ///////////////////////////////
  // RECEIVE chatMessage from CLIENT THEN ...
  ///////////////////////////////
  socket.on('chatMessage', async (msg) => {

    msg.timeFormatted = dayjs().format('ddd, D MMMM (HH:mm)');
    msg.isServerMessage = false;

    console.log('--- evaluateToxicity() ---');
    await evaluateToxicity(msg);
    console.log('--- evaluateSentiment() ---');
    await evaluateSentiment(msg);

    console.log(msg);

    io.emit('chatMessage', msg)

  });

});

http.listen(PORT, () => {
  console.log(`CV-Chat server running on http://localhost:${PORT}/`);
});