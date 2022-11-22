const PORT = process.env.PORT || 3000;
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const dayjs = require('dayjs')
const tf = require('@tensorflow/tfjs-node');
const toxicity = require('@tensorflow-models/toxicity');

app.use(express.static('client'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/client/index.html');
});

io.on('connection', (socket) => {

  ///////////////////////////////
  // Show CONNECTION
  ///////////////////////////////
  let intro = {
    sender: `${String.fromCodePoint(0x1F916)}`,
    text: `${socket.id} joined ${String.fromCodePoint(0x1F37B)}`,
    type: `connect`,
    context: `${socket.id}`,
    timestamp: new Date()
  };

  io.emit('chatMessage', intro);

  ///////////////////////////////
  // Show DISCONNECT
  ///////////////////////////////
  socket.on('disconnect', () => {
    let outro = {
      sender: `${String.fromCodePoint(0x1F916)}`,
      text: ` ${socket.id} left ${String.fromCodePoint(0x1F695)}`,
      type: `disconnect`,
      context: `${socket.id}`,
      timestamp: new Date()
    }; 
    io.emit('chatMessage', outro);
  });

  ///////////////////////////////
  // RECEIVE chatMessage from CLIENT THEN ...
  ///////////////////////////////
  socket.on('chatMessage', (msg) => {

    msg.timeFormatted = dayjs().format('ddd, D MMMM (HH:mm)')

    toxicity.load(0.8).then(model => {
    
      model.classify(msg.text).then(predictions => {
        console.log(predictions[1].results);

        let matches = predictions.filter( (p) => p.results[0].match === true );

        if(matches.length > 0){
          msg.text = String.fromCodePoint(0x1F6AB).repeat(3);
          io.emit('chatMessage', msg);
        } else{
          io.emit('chatMessage', msg);
        }

      });
    });

  });

});

http.listen(PORT, () => {
  console.log(`CV-Chat server running on http://localhost:${PORT}/`);
});