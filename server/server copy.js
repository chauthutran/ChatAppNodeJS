const path = require('path');
const http = require('http');
const express = require('express');
const cors = require("cors");
const Server = require('socket.io');
// const { Server } = require("socket.io");

// var io = require('socket.io')(http, { cors: { origin: "*" } });


// const io = require("socket.io")(http, {
//   cors: {
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST"],
//     allowedHeaders: ["my-custom-header"],
//     credentials: true
//   }
// });

// const socketio = require('socket.io')("http://localhost:3000", {
//   cors: {
//     origin: '*',
//   }
// });

const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

const app = express();
// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", 'http://localhost:4200'); //<--
//   res.header("Access-Control-Allow-Credentials", true);
//   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
//   res.header("Access-Control-Allow-Headers",
// 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json,Authorization');
//   next();
// });

// app.use( cors() );


// app.use(function(req, res, next){
//   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
//   res.header ("Access-Control-Allow-Headers: Content-Type, Authorization, Accept, Accept-Language, X-Authorization");
//   // res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Origin,*');
//   res.header('Access-Control-Allow-Credentials', true);
//   res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
//  console.log(res);
//   // if (req.method === 'OPTIONS') {
//     res.status(200);
// // } 

//   next(); 
// })


// app.use(function(req, res, next) {
//   req.header("Access-Control-Allow-Origin", "http://localhost:8080");
//   req.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

// const server = http.createServer(app);

const server = require('http').Server(app);


// var server = http.createServer( app);
// var io = require('socket.io')(server);


// Server IO
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:8080/",
//     methods: ["GET", "POST"],
//     allowedHeaders: ["Access-Control-Allow-Origin"],
//     credentials: true
//   },
// });

// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:8080",
//     methods: ["GET", "POST"],
//     // allowedHeaders: ["Access-Control-Allow-Origin"],
//     // credentials: true,
//   },
// });

const io = require("socket.io")(server, {
  allowRequest: (req, callback) => {
    const noOriginHeader = req.headers.origin === undefined;
    callback(null, noOriginHeader);
  }
});

// io.attach(app, {
//   // includes local domain to avoid CORS error locally
//   // configure it accordingly for production
//   cors: {
//     origin: 'http://localhost:8080',
//     methods: ['GET', 'POST'],
//     credentials: true,
//     transports: ['websocket', 'polling'],
//   },
//   allowEIO3: true,
// })

// io.origins(['http://localhost:8080']);

// function onRequest(req,res){
//   res.writeHead(200, {
//   'Access-Control-Allow-Origin' : '*'
//   });
//   };

// var io = require('socket.io')(server, {origins:'domain.com:* http://domain.com:* http://www.domain.com:*'});
// var io = require('socket.io')(server, {origins:'http://localhost:8080:*'});



// const io = new Server(server, {
//     cors: {
//       origin: "http://localhost:8080",
//       // origin: "*",
//       methods: ["GET", "POST"],
//     },
//   });



// const io = socketio(server);

// Set static folder
// app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatApp Bot';

// Run when client connects
io.on('connection', socket => {
  console.log("Connected to server : " + socket.id);
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to ChatApp!'));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);
console.log("--------- user : ");
console.log(user);
    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

// const PORT = process.env.PORT || 3000;
// Client
server.listen(3000, () => console.log(`Server running on port 3000`));

// server.listen(3000, {log:false, origins:'*:*'});
