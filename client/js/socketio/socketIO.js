
function SocketIO( _username ) {
	
	var me = this;
	me.username = _username;

	me.socket;
	me.chatFormObj;
	me.users = {};

    // ------------------------------------------------------------------------
    // INIT method

    me.init = function() {

		me.socket = io( serverURL, {
            reconnectionDelayMax: 1000,
            withCredentials: true,
            extraHeaders: {
                "Access-Control-Allow-Origin": "origin-list"
            },
			autoConnect: false,
			auth: {
				username: me.username
			}
			// , transports: ['websocket', 'polling', 'flashsocket']
        });

		
        me.chatFormObj = new ChatForm( me.username, me.socket, me );

		// ------------------------------------------------------------------------
		// New Code

		// Register a catch-all listener, which is very useful during development:
		me.socket.onAny((event, ...args) => {
			console.log(event, args);
		});
		
		// me.socket.auth = { username: me.username };
		// me.socket.connect();


		const sessionID = localStorage.getItem("sessionID");
		if (sessionID) {
			// me.usernameAlreadySelected = true;
			me.socket.auth = { sessionID, username: me.username };
		}
		else
		{
			me.socket.auth = { username: me.username };
		}

		me.socket.connect();

		me.socket.on("session", ({ sessionID, userID, username }) => {
			// attach the session ID to the next reconnection attempts
			me.socket.auth = { sessionID };
			// store it in the localStorage
			localStorage.setItem("sessionID", sessionID);
			// save the ID of the user
			me.socket.userID = userID;
			me.socket.username = username;
		});

		
		me.socket.on("private message", (data) => {
			for (let i = 0; i < me.users.length; i++) {
			  const user = me.users[i];
			  if (user.userID === me.users[data.sender]) {
				if( user.messages == undefined )
				{
					user.messages = [];
				}

				user.messages.push( data );
				if (user.username !== me.chatFormObj.selectedUser.username ) {
				  	user.hasNewMessages = true;
				}
				break;
			  }
			}
		  });

		
		me.socket.on("users", (_users) => {
		

			_users.forEach((user) => {
				var keys = Object.keys(me.users);
				for (let i = 0; i < keys.length; i++) {
				  const existingUser = me.users[keys[i]];
				  if (existingUser.userID === user.userID) {
					existingUser.connected = user.connected;
					return;
				  }
				}
				user.self = ( user.userID === me.socket.userID );
				me.initReactiveProperties(user);
				me.users[user.username] = user;
			  });
		});

		me.socket.on("user connected", (user) => {
			console.log("user connected");
			console.log(user);
			me.users[user.username] = user;
		});



		me.socket.on("connect", () => {
			var usernameList = Object.keys( me.users );
			for( var i=0; i<usernameList.length;i++ )
			{
				var user = me.users[usernameList[i]]
				if (user.self) {
					user.connected = true;
				}
			} 
		  });
		  
		me.socket.on("disconnect", () => {

			
			var usernameList = Object.keys( me.users );
			for( var i=0; i<usernameList.length;i++ )
			{
				var user = me.users[usernameList[i]]
				if (user.self) {
					user.connected = false;
				  }
			} 

		});



	  	// ---------------------------------------------------------------------------
		// SocketIO Connection handler


		me.socket.on('connect_error', function(err) {
			if (err.message === "invalid username") {
				console.log( err.message );
			}
			else
			{
				console.log('Failed to connect to server');
			}

			console.log(err);
			// $("#chatView").hide();
			// $("#initChatMsg").html('Failed to connect to server').show();
		});

		// me.socket.on('connect', function () {
		// 	console.log('Socket is connected.');

		// 	if( me.chatFormObj.selectedUser == undefined )
		// 	{
		// 		$("#chatView").hide();
		// 		$("#initChatMsg").html(`Welcome, ${me.username}`).show();
		// 	}

		// 	// Send the queue message if there is any message unsent
		// 	var offlineMessages = getOfflineMessages();
		// 	for( i=offlineMessages.length - 1; i>=0; i-- )
		// 	{
		// 		const data = offlineMessages[i];
		// 		me.socket.emit('getMsg', data );
		// 	}

		// });

		
		me.socket.on('reconnect', function() {
			console.log('reconnect fired!');
		});
		
		// me.socket.on('disconnect', function () {
		// 	console.log('Socket is disconnected.');
		// 	me.socket.emit('logout', { username: me.username } );
		// });


	  	// ---------------------------------------------------------------------------
		// Event Listeners 

		// USER IS ONLINE
		me.socket.emit('login', { username: me.username } );
		
		me.socket.on('userStatusUpdate', ( statusData ) => {
			me.chatFormObj.updateUserStatus( statusData );
		});
		


		// me.socket.emit('username', me.username);

		// me.socket.on('contactList', (data) => {
		// 	me.chatFormObj.outputUsers( data );
		// });

		// me.socket.on('wrongUserName', (data) => {
		// 	alert( data.msg );
		// });


		

		me.socket.on('messageList', ( data ) => {
			const messages = Utils.mergeWithOfflineMessages( data.messages, data.users.username1, data.users.username2 );
			me.chatFormObj.outputMessageList( messages );
		});

		
		me.socket.on('sendMsg', data => {
			// if( data.sender == me.username || data.receiver == me.username )
			// {
			// 	me.chatFormObj.outputMessage( data );
			// }

			me.chatFormObj.outputMessage( data );
		})




		// me.socket.on('exit', (_userList) => {
		// 	userList = _userList;
		// });



		me.initReactiveProperties = (user) => {
			user.messages = [];
			user.hasNewMessages = false;
		  };

	}


    // ------------------------------------------------------------------------
    // Run INIT

    me.init();

}