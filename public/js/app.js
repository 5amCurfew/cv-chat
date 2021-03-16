var socket = io();
        
var messages = document.getElementById('messages');
var form = document.getElementById('form');
var displayName = document.getElementById('name');
var input = document.getElementById('input');

// CLIENT EMIT chat message ON SUBMIT to SERVER
form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
        const msg = {
            sender: displayName.value === undefined || displayName.value === '' ? socket.id : displayName.value,
            text: input.value
        };
        socket.emit('chat message', msg);
        input.value = '';
    }
});

// CLIENT RECEIVE chat message FROM SERVER
socket.on('chat message', function(msg) {
    var item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});

