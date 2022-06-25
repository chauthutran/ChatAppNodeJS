
const express = require('express');
var cors = require('cors')
const bodyParser = require("body-parser");

const crypto = require("crypto");
const randomId = () => crypto.randomBytes(8).toString("hex");

const { InMemorySessionStore } = require("./clazz/sessionStore");
const sessionStore = new InMemorySessionStore();

const {ServerUtils} = require("./utils/utils");
const serverUtils = new ServerUtils();


const mongoose = require("mongoose");
const MessagesCollection = require("./models/messages");
const UsersCollection = require("./models/users");


// =======================================================================================================
// Mongo Connection
// ====================

const mongoDB = "mongodb+srv://tranchau:Test1234@cluster0.n0jz7.mongodb.net/chatApp?retryWrites=true&w=majority";
mongoose.connect(mongoDB).then(() => {
	console.log("------------- mongo connected ");
}).catch(err => console.log(err))

// ====================
// Mongo Connection
// =======================================================================================================



let socketList = {};
const onlineUsers = [];

// =======================================================================================================
// Create APP
// ====================

const app = express();

app.use(cors())
// app.use(express.static(__dirname + '/uploads'))
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get('/', (req, res) => {
	res.send('Chat server started !!!');
})


app.get("/user", (req, res) => {
	UsersCollection.find({username: req.query.username}).then(( list ) => {
		if( list.length > 0 )
		{
			const curUser = list[0];
			UsersCollection.find(
				{ username: { $in: curUser.contacts } }
			)
			.sort({ fullName: 1 })
			.then(( contactList ) => {
				res.send({ curUser: curUser, contacts: contactList, onlineList: onlineUsers });
			})
		}
		else
		{
			res.send({ status: "ERROR", msg: `Cannot find the username ${username}`});
		}
	});
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
		})
	}
})

app.post('/data', function(req, res){
	// res(res.body);

	const data = req.body;
	const message = new MessagesCollection( data );
	// Save message to mongodb
	message.save().then(() => {
		// After saving message to server
		// socket.broadcast.emit('sendMsg', data );

		// const to = serverUtils.findItemFromList( users, data.receiver, "username");
		// if( to != undefined )
		// {
		// 	socketList[to].emit( 'sendMsg', data );
		// }
		const to = data.receiver;
		if(socketList.hasOwnProperty(to)){
			socketList[to].emit( 'sendMsg', data );
		}
		res.send({msg:"Data is sent.", "status": "SUCCESS"});
	})
});

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


io.use((socket, next) => {

	try {
		/** Create two random values:
				1. a session ID, private, which will be used to authenticate the user upon reconnection
				2. a user ID, public, which will be used as an identifier to exchange messages
		*/
		const sessionID = socket.handshake.auth.sessionID;
		if (sessionID) {
			// find existing session
			const session = sessionStore.findSession(sessionID);
			if (session) {
				socket.sessionID = sessionID;
				socket.userID = session.userID;
				socket.username = session.username;
				return next();
			}
		}
		
		const username = socket.handshake.auth.username;
		if (!username) {
			return next(new Error("invalid username"));
		}

		// create new session
		socket.sessionID = randomId();
		socket.userID = randomId();
		socket.username = username;

	}
	catch( e)
	{
		console.log(e);
	}

	next();
})



// =======================================================================================================
// Create connection
// ====================

io.on('connection', socket => {

	// persist session
	sessionStore.saveSession(socket.sessionID, {
		userID: socket.userID,
		username: socket.username,
		connected: true,
	});

  	// emit session details
	socket.emit("session", {
		sessionID: socket.sessionID,
		userID: socket.userID,
		username: socket.username,
	});

	// join the "userID" room
	socket.join(socket.userID);

	console.log( "--- connect to  sessionID : " + socket.sessionID + " ------ userID : " + socket.userID + " ------- username: " + socket.username );
	socketList[socket.username] = socket;

	// fetch existing users
	const users = sessionStore.getAllUsers();
	socket.emit("users", users);
	
	
	// notify existing users
	socket.broadcast.emit("user_connected", {
		userID: socket.userID,
		username: socket.username,
		connected: true,
	});
	
	
	// forward the private message to the right recipient (and to other tabs of the sender)
	socket.on("private_message", (data) => {
		const message = new MessagesCollection( data );
		// Save message to mongodb
		message.save().then(() => {
			const users = sessionStore.getAllUsers();
			console.log( "======= data is sending .... " );
			console.log( users );
			const to = serverUtils.findItemFromList( users, data.receiver, "username");
			if( to != undefined )
			{
				console.log("-- data sent to " + to.userID + " and " + socket.userID );
				socket.to(to.userID).to(socket.userID).emit("sendMsg", data );
			}
			else
			{
				console.log("-- data sent to " + socket.userID );
				socket.to(socket.userID).emit("sendMsg", data );
			}
		})

	});

	socket.on("disconnect", async () => {
		const matchingSockets = await io.in(socket.userID).allSockets();
		const isDisconnected = matchingSockets.size === 0;
		if (isDisconnected) {
			// notify other users
			socket.broadcast.emit("user_disconnected", socket.username);
			// update the connection status of the session
			sessionStore.saveSession(socket.sessionID, {
				userID: socket.userID,
				username: socket.username,
				connected: false,
			});
		}
	});

	
	socket.on('get_message_list', ( users ) => {
		MessagesCollection.find().or([
			{ sender: users.username1, receiver: users.username2 },
			{ sender: users.username2, receiver: users.username1 }
		])
		.sort({ datetime: 1 })
		.then(( result ) => {
			socket.emit('message-list', { messages: result, users: users } );
		})
	});

});


server.listen(3111, () => console.log(`Server running on port 3111`));
