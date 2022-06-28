
const express = require('express');
const bodyParser = require("body-parser");
const fetch = require('node-fetch');

const mongoose = require("mongoose");
const MessagesCollection = require("./models/messages");
const UsersCollection = require("./models/users");
const UserManagement = require('./utils/userManagement');

const mongoDB = "mongodb+srv://tranchau:Test1234@cluster0.n0jz7.mongodb.net/chatApp?retryWrites=true&w=majority";

mongoose.connect(mongoDB).then(() => {
	console.log("------------- mongo connected ");
}).catch(err => console.log(err))


let socketList = {};
const onlineUsers = [];

// =======================================================================================================
// Create APP
// ====================

const app = express();
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get('/', (req, res) => {
	res.send('Chat server started !!!');
})

/** 
 * Example URL: retrieveData?username1=test&username2=test3  
 * */
app.get("/data", (req, res) => {
	const username1 = req.query.username1;
	const username2 = req.query.username2;

	if( username1 == undefined || username2 == undefined )
	{
		res.send( {status: "ERROR", msg: "Missing parameters 'username1' and 'username2'"} );
	}
	else
	{
		MessagesCollection.find().or([
			{ sender: username1, receiver: username2 },
			{ sender: username2, receiver: username1 }
		])
		.sort({ datetime: 1 })
		.then(( result ) => {
			res.send( result );
			// socket.emit('messageList', { messages: result, users: users } );
		})
	}
	

	// res.send( res.json() );
})

app.post('/data', function(req, res){
	// res(res.body);

	const data = req.body;

	// Save User to mongodb
	const userManagement = new UserManagement( data.sender, data.receiver );
	userManagement.createIfNotExist();

	// Save message to mongodb
	const message = new MessagesCollection( data );
	message.save().then(() => {
		// After saving message to server
		// socket.broadcast.emit('sendMsg', data );

		const to = data.receiver;
		if(socketList.hasOwnProperty(to)){
			socketList[to].emit( 'sendMsg', data );
		}

		console.log("---------- Data is sent.");
		res.send({msg:"Data is sent.", "status": "SUCCESS"});
	})
});


// app.get('/socket.io/', (req, res) => {
// 	console.log("/socket.io/");
// 	res.json(req.query.path);
// })

// app.post('/process_post', urlencodedParser, function (req, res) {  
// 	// Prepare output in JSON format  
// 	response = {  
// 		first_name:req.body.first_name,  
// 		last_name:req.body.last_name  
// 	};  
// 	console.log(response);  
// 	res.end(JSON.stringify(response));  
//  })  


// // add router in the Express app.
// app.use("/", router);


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
		
	console.log("------ Connected to server : " + socket.id  + " --- username : " + username );

		socketList[username] = socket;
		console.log(" ----------- socketList : ");
// console.log(socketList);
		onlineUsers.push( username );

		UsersCollection.find({username: username}).then(( list ) => {
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
	
	socket.on('getMsg', (data) => {
		const message = new MessagesCollection( data );
		// Save message to mongodb
		message.save().then(() => {
			// After saving message to server
			// socket.broadcast.emit('sendMsg', data );
			
			// console.log(" ==== " + socketList[data.receiver].id);
			// socketList[data.sender].to(socketList[data.receiver].id).emit('sendMsg', data );

			const to = data.receiver;
			if(socketList.hasOwnProperty(to)){
				socketList[to].emit('sendMsg', data);
			}
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

});


server.listen(3111, () => console.log(`Server running on port 3111`));
