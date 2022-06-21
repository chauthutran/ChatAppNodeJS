'use strict';

const express = require('express');
const socketIO = require('socket.io');

const PORT = process.env.PORT || 3111;


const clientURL = "https://client-dev.psi-connect.org";
const INDEX = '/index.html';



// =======================================================================================================
// Mongo Connection
// ====================

const mongoose = require("mongoose");
const MessagesCollection = require("./models/messages");
const UsersCollection = require("./models/users");

const mongoDB = "mongodb+srv://tranchau:Test1234@cluster0.n0jz7.mongodb.net/chatApp?retryWrites=true&w=majority";

mongoose.connect(mongoDB).then(() => {
	console.log("------------- mongo connected ");
}).catch(err => console.log(err))


// ====================
// Mongo Connection
// =======================================================================================================


const onlineUsers = [];


const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const io = require('socket.io')(server,{
  cors: {
		origin: clientURL,
		methods: ["GET", "POST"],
		credentials: true
	}
});

io.on('connection', (socket) => {

  	console.log("====================================================== Connected to server : " + socket.id );

	
	// -----------------------------------------------------------------------------------------------------
	// Username event

  	socket.on('username', (username) => {

		console.log("====================================================== username : " + username );
		onlineUsers.push( username );

		if( list.length > 0 )
		{
			const curUser = list[0]
			UsersCollection.find(
				{ username: { $in: curUser.contacts } }
			)
			.sort({ fullName: 1 })
			.then(( contactList ) => {
				socket.emit('contactList', { curUser: curUser, contacts: contactList, onlineList: onlineUsers });
			})
		}
		else
		{
			socket.emit('wrongUserName', { msg: `Cannot find the username ${username}`});
		}


	});

	
	// -----------------------------------------------------------------------------------------------------
	// 'login' event

	socket.on('login', function( user ){
		
		onlineUsers.push( user.username );
		socket.emit('userStatusUpdate', {username: user.username, status: "online"} );
		console.log('====================================================== User ' +  user.username + ' logged');
		// saving userId to object with socket ID
		// users[socket.id] = data.userId;
	});
	
	
	// -----------------------------------------------------------------------------------------------------
	// 'logout' event

	socket.on('logout', function( user ){
		
		onlineUsers.splice( onlineUsers.indexOf( user.username), 1 );
		socket.emit('userStatusUpdate', {username: user.username, status: "offline"} );
		console.log('====================================================== User ' +  user.username + ' logout');
	});


	
	// -----------------------------------------------------------------------------------------------------
	// 'loadMessageList' event - load the list of messages of user sender and user received

	socket.on('loadMessageList', ( users ) => {
		MessagesCollection.find().or([
			{ sender: users.username1, receiver: users.username2 },
			{ sender: users.username2, receiver: users.username1 }
		])
		.sort({ datetime: 1 })
		.then(( result ) => {
			socket.emit('messageList', { messages: result, users: users } );
		})
	});
	
	
	// -----------------------------------------------------------------------------------------------------
	// 'getMsg' event - Receive a message with send from client

	socket.on('getMsg', (data) => {
		const message = new MessagesCollection( data );
		// Save message to mongodb
		message.save().then(() => {
			// After saving message to server
			// socket.broadcast.emit('sendMsg', data );
			socket.emit('sendMsg', data );
		})
	});

	
	
	// -----------------------------------------------------------------------------------------------------
	// 'disconnect' event - socket is disconnected

	socket.on('disconnect',()=> {
		for( let i=0; i <onlineUsers.length; i++ ) {
			if( onlineUsers[i].id === socket.id ){
				onlineUsers.splice(i,1); 
			}
		}

		io.emit('exit', onlineUsers ); 
	});

});

// setInterval(() => io.emit('timeTEST', new Date().toTimeString()), 1000);
