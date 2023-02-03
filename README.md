```                                                         
       ██████╗██╗   ██╗     ██████╗██╗  ██╗ █████╗ ████████╗
      ██╔════╝██║   ██║    ██╔════╝██║  ██║██╔══██╗╚══██╔══╝
      ██║     ██║   ██║    ██║     ███████║███████║   ██║ 
      ██║     ╚██╗ ██╔╝    ██║     ██╔══██║██╔══██║   ██║
      ╚██████╗ ╚████╔╝     ╚██████╗██║  ██║██║  ██║   ██║
       ╚═════╝  ╚═══╝       ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝                                                                              
```

`cv-chat` is a chat-room built in Node.js that blocks toxic messages and evaluates sentiment using Tensorflow.js models

## Build

This was built using Node.js V14.0.0. No other versions have been tested. I recommend using `nvm` to set the Node.js version

```bash
Now using node v14.0.0 (npm v6.14.4)
npm install
npm start
```

The server defaults to exposure on port `3000` (visit localhost:3000 to see it in action!)