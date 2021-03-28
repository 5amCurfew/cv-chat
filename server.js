const PORT = process.env.PORT || 3000;
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const dayjs = require('dayjs')
require('@tensorflow/tfjs-node');
const toxicity = require('@tensorflow-models/toxicity');

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
    // Show connect
    let intro = {
      sender: `${String.fromCodePoint(0x1F916)}`,
      text: `${socket.id} joined ${String.fromCodePoint(0x1F37B)}`,
      type: `connect`,
      context: `${socket.id}`,
      timestamp: new Date()
    };
    io.emit('chat message', intro);

    // Show disconnect
    socket.on('disconnect', () => {
      let outro = {
        sender: `${String.fromCodePoint(0x1F916)}`,
        text: ` ${socket.id} left ${String.fromCodePoint(0x1F695)}`,
        type: `disconnect`,
        context: `${socket.id}`,
        timestamp: new Date()
      }; 
      io.emit('chat message', outro);
    });

    // RECEIVE chat message from CLIENT THEN ...
    socket.on('chat message', (msg) => {
      msg.timeFormatted = dayjs().format('HH:mm')

      toxicity.load(0.8).then(model => {
      
        model.classify(msg.text).then(predictions => {
          let matches = predictions.filter( (p) => p.results[0].match === true );

          if(matches.length > 0){
            msg.text = String.fromCodePoint(0x1F6AB).repeat(3);
            io.emit('chat message', msg);
          } else{
            io.emit('chat message', msg);
          }

        });
      });

    });
});

http.listen(PORT, () => {
  console.log(`CV-Chat server running on http://localhost:${PORT}/`);
});