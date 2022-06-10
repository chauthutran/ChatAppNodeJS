const express = require('express');
var SocketIOFileUpload = require("socketio-file-upload")
const fs = require('fs')

const formatMessage = require('./utils/messages');
const {
	userJoin,
	getCurrentUser,
	userLeave,
	getRoomUsers
} = require('./utils/users');


const botName = 'ChatApp Bot';


// =======================================================================================================
// Create APP
// ====================

const app = express();
app.use(SocketIOFileUpload.router);
app.use(express.static(__dirname + '/uploads'))
app.get('/', (req, res) => {
	console.log(req.query.path);
	res.sendFile(__dirname + "/uploads/" + req.query.path);
})
app.get('/deleteimage', (req, res) => {
	console.log(req.query);
	res.json(req.query.path);
	fs.unlinkSync(__dirname + "/uploads/" + req.query.path, () => {
		
	})
})

// ====================
// END - Create APP
// =======================================================================================================


// =======================================================================================================
// Create server
// ====================

const server = require('http').Server(app);


// =======================================================================================================
// INIT Socket IO
// ====================
const io = require("socket.io")(server, {
	cors: {
		origin: "http://localhost:8080",
		methods: ["GET", "POST"],
		credentials: true
	}
});

// ====================
// END - INIT Socket IO
// =======================================================================================================


// =======================================================================================================
// Create connection
// ====================
io.on('connection', socket => {

	console.log("------ Connected to server : " + socket.id);

	// ------------------------------------------------------------------------------
	// Upload files
	// ---------------------

	// Make an instance of SocketIOFileUpload and listen on this socket:
	var uploader = new SocketIOFileUpload();
	uploader.dir = "uploads";
	uploader.listen(socket);

	// Do something when a file is saved:
	uploader.on("saved", function (event) {
		event.file.clientDetail.name = event.file.name; 
	});

	// Error handler:
	uploader.on("error", function (event) {
		console.log("Error from uploader", event);
	});

	// ------------------------------------------------------------------------------
	// END - Upload files
	// ---------------------
	

	// ------------------------------------------------------------------------------
	// END - Upload files
	// ---------------------	

	socket.on('joinRoom', ({ username, room }) => {
	const user = userJoin(socket.id, username, room);

	socket.join(user.room);

	// Welcome current user
	socket.emit('message', formatMessage(botName, user.username, 'Welcome to ChatApp!'));

	// Broadcast when a user connects
	socket.broadcast
	.to(user.room)
	.emit(
		'message',
		formatMessage(botName, user.username, `${user.username} has joined the chat`)
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
	if( user != undefined )
	{
	// const message = "server reveived your message : " + msg + " " + moment().format('h:mm a');
	// io.to(user.room).emit('message', formatMessage(user.username, msg));
	io.to(user.room).emit('message', data );
	// io.to(data.receiver).to(data.sender).emit('message', data );
	}


	
});

// Runs when client disconnects
socket.on('disconnect', () => {
	const user = userLeave(socket.id);

	if (user) {
	io.to(user.room).emit(
		'message',
		formatMessage(botName, user.username, `${user.username} has left the chat`)
	);

	// Send users and room info
	io.to(user.room).emit('roomUsers', {
		room: user.room,
		users: getRoomUsers(user.room)
	});
	}
});
});

server.listen(3111, () => console.log(`Server running on port 3111`));
