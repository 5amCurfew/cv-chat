const PORT = process.env.PORT || 3000;
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
require('@tensorflow/tfjs-node');
const toxicity = require('@tensorflow-models/toxicity');

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
    // Show connect
    console.log(`connected :: ${socket.id}`);
    io.emit('chat message', `--- ${socket.id} joined ${String.fromCodePoint(0x1F37B)} ---`);

    // Show disconnect
    socket.on('disconnect', () => {
      console.log(`${socket.id} :: disconnected`);
      io.emit('chat message', `--- ${socket.id} left ${String.fromCodePoint(0x1F695)} ---`);
    });

    // RECEIVE chat message from CLIENT THEN ...
    socket.on('chat message', (msg) => {
      console.log(msg);
      
      toxicity.load(0.8).then(model => {
      
        model.classify(msg.text).then(predictions => {
          let matches = predictions.filter( (p) => p.results[0].match === true);
          console.log(matches);

          if(matches.length > 0){
            io.emit('chat message', `${msg.sender}: ${String.fromCodePoint(0x1F6AB).repeat(3)}`);
          } else{
            io.emit('chat message', `${msg.sender}: ${msg.text}`);
          }

        });
      });

    });
});

http.listen(PORT, () => {
  console.log(`cv-chat socket.io server running at http://localhost:${PORT}/`);
});