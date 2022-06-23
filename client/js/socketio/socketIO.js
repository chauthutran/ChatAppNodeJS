
function SocketIO( _username ) {
	
	var me = this;
	me.username = _username;

	me.socket;
	me.chatFormObj;

    // ------------------------------------------------------------------------
    // INIT method

    me.init = function() {

		me.socket = io( serverURL, {
            reconnectionDelayMax: 1000,
            withCredentials: true,
            extraHeaders: {
                "Access-Control-Allow-Origin": "origin-list"
            }
			// , transports: ['websocket', 'polling', 'flashsocket']
        });

        me.chatFormObj = new ChatForm( me.username, me.socket );

	  	// ---------------------------------------------------------------------------
		// SocketIO Connection handler

		me.socket.on('connect_error', function(err) {
			console.log('Failed to connect to server');

			console.log(err);
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
				me.socket.emit('getMsg', data );
			}

		});

		
		me.socket.on('reconnect', function() {
			console.log('reconnect fired!');
		});
		
		me.socket.on('disconnect', function () {
			console.log('Socket is disconnected.');
			me.socket.emit('logout', { username: me.username } );
		});


	  	// ---------------------------------------------------------------------------
		// Event Listeners 

		// USER IS ONLINE
		me.socket.emit('login', { username: me.username } );
		
		me.socket.on('userStatusUpdate', ( statusData ) => {
			me.chatFormObj.updateUserStatus( statusData );
		});
		


		me.socket.emit('username', me.username);

		me.socket.on('contactList', (data) => {
			me.chatFormObj.outputUsers( data );
		});

		me.socket.on('wrongUserName', (data) => {
			alert( data.msg );
		});


		

		me.socket.on('messageList', ( data ) => {
			const messages = Utils.mergeWithOfflineMessages( data.messages, data.users.username1, data.users.username2 );
			me.chatFormObj.outputMessageList( messages );
		});

		
		me.socket.on('sendMsg', data => {
			if( data.sender == me.username || data.receiver == me.username )
			{
				me.chatFormObj.outputMessage( data );
			}
		})




		// me.socket.on('exit', (_userList) => {
		// 	userList = _userList;
		// });




	}


    // ------------------------------------------------------------------------
    // Run INIT

    me.init();

}