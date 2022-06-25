
const express = require('express');
var SocketIOFileUpload = require("socketio-file-upload")
const fs = require('fs')


const mongoose = require("mongoose");
const MessagesCollection = require("./models/messages");
const UsersCollection = require("./models/users");

const mongoDB = "mongodb+srv://tranchau:Test1234@cluster0.n0jz7.mongodb.net/chatApp?retryWrites=true&w=majority";

mongoose.connect(mongoDB).then(() => {
	console.log("------------- mongo connected ");
}).catch(err => console.log(err))


const onlineUsers = [];

// =======================================================================================================
// Create APP
// ====================

const app = express();
app.use(SocketIOFileUpload.router);
app.use(express.static(__dirname + '/uploads'))
app.get('/', (req, res) => {
	res.sendFile(__dirname + "/uploads/" + req.query.path);
})
app.get('/deleteimage', (req, res) => {
	res.json(req.query.path);
	fs.unlinkSync(__dirname + "/uploads/" + req.query.path, () => {
		
	})
})

app.get('/socket.io/', (req, res) => {
	console.log("/socket.io/");
	res.json(req.query.path);
	// fs.unlinkSync(__dirname + "/uploads/" + req.query.path, () => {
		
	// })
})
// ====================
// END - Create APP
// =======================================================================================================


// =======================================================================================================
// Create server
// ====================

const server = require('http').Server(app);
const clientURL = "http://localhost:8080";
// const clientURL = "https://client-dev.psi-connect.org";

// =======================================================================================================
// INIT Socket IO
// ====================
const io = require("socket.io")(server, {
	cors: {
		origin: clientURL,
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

	console.log("------ Connected to server : " + socket.id );
	
	socket.on('username', (username) => {

		onlineUsers.push( username );

		UsersCollection.findOne({username: username}).then(( curUser ) => {
			UsersCollection.find(
				{ username: { $in: curUser.contacts } }
			)
			.sort({ fullName: 1 })
			.then(( contactList ) => {
				socket.emit('contactList', { curUser: curUser, contacts: contactList, onlineList: onlineUsers });
			})
		});

	});

	socket.on('login', function( user ){
		
		onlineUsers.push( user.username );
console.log('a user ' +  user.username + ' logged');
		socket.emit('userStatusUpdate', {username: user.username, status: "online"} );
		// saving userId to object with socket ID
		// users[socket.id] = data.userId;
	});
	
	socket.on('logout', function( user ){
		
		onlineUsers.splice( onlineUsers.indexOf( user.username), 1 );
console.log('a user ' +  user.username + ' logout');
		socket.emit('userStatusUpdate', {username: user.username, status: "offline"} );

		// saving userId to object with socket ID
		// users[socket.id] = data.userId;
	});

	socket.on('get_message_list', ( users ) => {
		MessagesCollection.find().or([
			{ sender: users.username1, receiver: users.username2 },
			{ sender: users.username2, receiver: users.username1 }
		])
		.sort({ datetime: 1 })
		.then(( result ) => {
			socket.emit('messageList', { messages: result, users: users } );
		})
	});
	
	socket.on('getMsg', (data) => {
		const message = new MessagesCollection( data );
		// Save message to mongodb
		message.save().then(() => {
			// After saving message to server
			socket.broadcast.emit('sendMsg', data );
		})
	});

	socket.on('disconnect',()=> {
		for( let i=0; i <onlineUsers.length; i++ ) {
			if( onlineUsers[i].id === socket.id ){
				onlineUsers.splice(i,1); 
			}
		}

		io.emit('exit', onlineUsers ); 
	});

	// socket.on('reconnect', function() {
	// 	console.log('reconnect fired!');
	// });

	
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
	
});


server.listen(3111, () => console.log(`Server running on port 3111`));
