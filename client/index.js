const socket = io();
console.log(socket);
let messages = document.getElementById('messages');
let form = document.getElementById('form');
let displayName = document.getElementById('name');
let input = document.getElementById('input');

///////////////////////////////
// CLIENT EMIT
///////////////////////////////
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
        socket.emit('chatMessage', msg);
        input.value = '';
    }
});

///////////////////////////////
// CLIENT RECEIVE
///////////////////////////////
socket.on('chatMessage', function(msg) {
    
    let messageMarkup;
    let align = msg.isServerMessage ? 'text-align: center;' : msg.socketId === socket.id ? 'text-align: left;' : 'text-align: right;'

    switch(msg.type) {
        case 'connect':
            messageMarkup = `
                <li class="message">
                    <div class="messageSender" style="font-weight: bold; ${align}">${msg.sender} ${msg.sentimentIcon === null ? '' : msg.sentimentIcon}</div>
                    <div class="messageSender" style="font-size: 12px; ${align}">${msg.timeFormatted}</div>
                    <div class="messageText" style="${align}">${msg.socketId === socket.id ? `Welcome! ${String.fromCodePoint(0x1F37A)}` : msg.text}</div>  
                </li>
            `
          break;
        default:
            messageMarkup = `
                <li class="message">
                    <div class="messageSender" style="font-weight: bold; ${align}">${msg.sender} ${msg.sentimentIcon === null ? '' : msg.sentimentIcon}</div>
                    <div class="messageSender" style="font-size: 12px; ${align}">${msg.timeFormatted}</div>
                    <div class="messageText" style="${align}">${msg.textFinal}</div>  
                </li>
            `
      }

    messages.insertAdjacentHTML('beforeEnd', messageMarkup);
    window.scrollTo(0, document.body.scrollHeight);
});

