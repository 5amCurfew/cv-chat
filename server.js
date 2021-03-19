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
    let intro = {
      sender: `${String.fromCodePoint(0x1F4BB)}`,
      text: `--- ${socket.id} joined ${String.fromCodePoint(0x1F37B)} ---`,
      type: `connectionUpdate`,
      timestamp: new Date()
    };
    io.emit('chat message', intro);

    // Show disconnect
    socket.on('disconnect', () => {
      console.log(`${socket.id} :: disconnected`);
      let outro = {
        sender: `${String.fromCodePoint(0x1F4BB)}`,
        text: `--- ${socket.id} left ${String.fromCodePoint(0x1F695)} ---`,
        type: `connectionUpdate`,
        timestamp: new Date()
      };  
      io.emit('chat message', outro);
    });

    // RECEIVE chat message from CLIENT THEN ...
    socket.on('chat message', (msg) => {
      
      toxicity.load(0.8).then(model => {
      
        model.classify(msg.text).then(predictions => {
          let matches = predictions.filter( (p) => p.results[0].match === true );
          console.log(matches);

          if(matches.length > 0){
            msg.text = String.fromCodePoint(0x1F6AB).repeat(3);
            io.emit('chat message', msg);
          } else{
            console.log(msg);
            io.emit('chat message', msg);
          }

        });
      });

    });
});

http.listen(PORT, () => {
  console.log(`cv-chat socket.io server running at http://localhost:${PORT}/`);
});