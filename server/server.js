
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


const users = [];

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

	console.log("------ Connected to server : " + socket.id );

	

	socket.on('username', (username) => {
	
		UsersCollection.findOne({username: username}).then(( curUser ) => {
			UsersCollection.find(
				{ username: { $in: curUser.contacts } }
			).then(( contactList ) => {
				console.log(contactList);
				socket.emit('contactList', { curUser: curUser, contacts: contactList });
			})
		});

	});
	
	socket.on('loadMessageList', ( users ) => {
		MessagesCollection.find().or([
			{ sender: users.username1, receiver: users.username2 },
			{ sender: users.username2, receiver: users.username1 }
		]).then(( result ) => {
			socket.emit('messageList', result );
		})
	});
	
	socket.on('getMsg', (data) => {
		const message = new MessagesCollection( data );
		message.save().then(() => {
			console.log("data saved in mongodb");
			socket.broadcast.emit('sendMsg', data );
		})
	});

	socket.on('disconnect',()=> {
		for(let i=0; i < users.length; i++) {
			if(users[i].id === socket.id){
				  users.splice(i,1); 
			}
		}

		io.emit('exit',users); 
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
