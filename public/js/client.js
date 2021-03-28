const socket = io();
console.log(socket);
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
            timestamp: new Date(),
            socketId: socket.id
        };
        socket.emit('chat message', msg);
        input.value = '';
    }
});

// CLIENT RECEIVE chat message FROM SERVER
socket.on('chat message', function(msg) {
    const align = msg.socketId === socket.id ? 'text-align: left;' : 'text-align: right;'
    let messageMarkup;

    if(msg.type === 'message'){
        messageMarkup = `
            <li class="message">
                <div class="messageSender" style="font-weight: bold; ${align}">${msg.sender}</div>
                <div class="messageSender" style="font-size: 12px; ${align}">${msg.timeFormatted}</div>
                <div class="messageText" style="${align}">${msg.text}</div>  
            </li>
        `
    } else{
        msg.welcomeMessage = msg.type == 'connect' && msg.context == socket.id ? 'Welcome to my little CV-Chat! Toxic messages are blocked!' : msg.text;
        messageMarkup = `
            <li class="message">
                <div class="messageText" font: 5px; text-align: center">${msg.sender} ${msg.welcomeMessage}</div>  
            </li>
        `
    };

    messages.insertAdjacentHTML('beforeEnd', messageMarkup);
    window.scrollTo(0, document.body.scrollHeight);
});

