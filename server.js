const PORT = process.env.PORT || 3000;
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
    // Show connect
    console.log(`a user connected on :: ${socket.id}`);
    io.emit('chat message', `--- New chatter joined ${socket.id} ---`);

    // Show disconnect
    socket.on('disconnect', () => {
      console.log(`${socket.id} :: user disconnected`);
    });

    // RECEIVE chat message from CLIENT THEN ...
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
});

http.listen(PORT, () => {
  console.log(`Socket.IO server running at http://localhost:${PORT}/`);
});