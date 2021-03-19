const socket = io();
        
let messages = document.getElementById('messages');
let form = document.getElementById('form');
let displayName = document.getElementById('name');
let input = document.getElementById('input');

// CLIENT EMIT chat message ON SUBMIT to SERVER
form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
        const msg = {
            sender: displayName.value === undefined || displayName.value === '' ? socket.id : displayName.value,
            text: input.value,
            type: 'message',
            timestamp: new Date()
        };
        socket.emit('chat message', msg);
        input.value = '';
    }
});

// CLIENT RECEIVE chat message FROM SERVER
socket.on('chat message', function(msg) {
    var item = document.createElement('li');
    item.textContent = `(${msg.timestamp}) ${msg.sender}${msg.type == 'message' ? ':' : ''} ${msg.text}`;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});

