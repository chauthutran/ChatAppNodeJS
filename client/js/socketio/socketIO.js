
function SocketIO( _username ) {
	
	var me = this;
	me.username = _username;

	me.socket;
	me.chatFormObj;

    // ------------------------------------------------------------------------
    // INIT method

    me.init = function() {
		me.socket = io("http://localhost:3111", {
            reconnectionDelayMax: 1000,
            withCredentials: true,
            extraHeaders: {
                "Access-Control-Allow-Origin": "origin-list"
            }
        });

        me.chatFormObj = new ChatForm( me.username, me.socket );

		me.socket.emit('username', me.username);

		me.socket.on('messageList', ( list ) => {
			if( me.chatFormObj.selectedUser != undefined )
			{ 
				me.chatFormObj.outputMessageList( list );
			}
		});


		me.socket.on('userList', (_users,_socketId) => {
			// if( socketId === null ){
			// 	socketId = _socketId;
			// }
			var users = _users;

			// get current user infor
			users.forEach((user) => {
				if( user.username == me.username )
				{
					curUser = user;
				}
			});
			me.chatFormObj.outputUsers( users );
		}); 	


		// me.socket.on('exit', (_userList) => {
		// 	userList = _userList;
		// });

		



	  	// ---------------------------------------------------------------------------

        me.socket.on('connect_error', function() {
			console.log('Failed to connect to server');
			// $("#chatView").hide();
			// $("#initChatMsg").html('Failed to connect to server').show();
		});

		me.socket.on('connect', function () {
			console.log('Socket is connected.');

			if( me.chatFormObj.selectedUser == undefined )
			{
				$("#chatView").hide();
				$("#initChatMsg").html(`Welcome, ${me.username}`).show();
			}

			// Send the queue message if there is any message unsent
			var offlineMessages = getOfflineMessages();
			for( i=offlineMessages.length - 1; i>=0; i-- )
			{
				const data = offlineMessages[i];

				// Emit message to server
				me.socket.emit('getMsg', data );

				// Remove the image because it will be duplicate after UploadFile completed
				if( data.type != undefined )
				{
					me.chatFormObj.chatHistoryTag.find(`ul li#${data.id}`).remove();
				}
			}

		});

		
		me.socket.on('reconnect', function() {
			console.log('reconnect fired!');
		});
		
		me.socket.on('disconnect', function () {
			console.log('Socket is disconnected.');
		});

	}


    // ------------------------------------------------------------------------
    // Run INIT

    me.init();

}