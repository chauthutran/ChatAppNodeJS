const path = require('path');
const http = require('http');
const express = require('express');
const cors = require("cors");
const Server = require('socket.io');
const moment = require('moment');

const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');


// Require the libraries:
var SocketIOFileUpload = require("socketio-file-upload")
const fs = require('fs')


const botName = 'ChatApp Bot';
const app = express();


app.use(SocketIOFileUpload.router);






const server = require('http').Server(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
    credentials: true
  }
});


app.use(express.static(__dirname + '/uploads'))
app.get('/', (req, res) => {
    // res.sendFile(__dirname + "/index.html")
    console.log(req.query.path);
    res.sendFile(__dirname + "/uploads/" + req.query.path);
})
app.get('/deleteimage', (req, res) => {
    console.log(req.query);
    res.json(req.query.path);
    fs.unlinkSync(__dirname + "/uploads/" + req.query.path, () => {
        
    })
})



io.on('connection', socket => {

  // Make an instance of SocketIOFileUpload and listen on this socket:
  var uploader = new SocketIOFileUpload();
  uploader.dir = "uploads";
  uploader.listen(socket);

  // Do something when a file is saved:
  uploader.on("saved", function (event) {
      event.file.clientDetail.name = event.file.name; 
      // event.file.clientDetail.fullPath = `http://localhost:3000/${event.file.name}`; 
      // socket.emit('message', formatMessage(username, `http://localhost:3000/${event.file.name}` ) );

  });

  // Error handler:
  uploader.on("error", function (event) {
    console.log("Error from uploader", event);
  });




  console.log("------ Connected to server : " + socket.id);
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
  socket.on('chatMessage', data => {
    const user = getCurrentUser(socket.id);
    console.log("---- User : ")
    console.log(user);
    console.log(data);


    if( user != undefined )
    {
      // const message = "server reveived your message : " + msg + " " + moment().format('h:mm a');
      // io.to(user.room).emit('message', formatMessage(user.username, msg));
      io.to(user.room).emit('message', data );
    }
   

    
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

server.listen(3000, () => console.log(`Server running on port 3000`));
