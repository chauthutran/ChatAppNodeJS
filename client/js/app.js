function ChatApp()
{
    var me = this;

    me.socketIOObj;
    me.socket;
    me.username;
    me.curUser = {};

    me.chatFormObj;

    // ------------------------------------------------------------------------
	// INIT method

    me.init = function() {
        username = Utils.getParamValueFromURL("username");

        if( username != undefined )
        {
            me.initSocketIO();

            new UploadFile( me.socket, me.chatFormObj );
        }
    }

    me.initSocketIO = function() {
        
        me.socketIOObj = new SocketIO();
        me.socket = me.socketIOObj.socket;
        me.chatFormObj = me.socketIOObj.chatFormObj;
        
        // me.socket = io("http://localhost:3111", {
        //     reconnectionDelayMax: 1000,
        //     withCredentials: true,
        //     extraHeaders: {
        //         "Access-Control-Allow-Origin": "origin-list"
        //     }
        // });

        // me.chatFormObj = new ChatForm( me.username, me.socket );

		// me.socket.emit('username', username);

		// me.socket.on('userList', (_users,_socketId) => {
		// 	// if( socketId === null ){
		// 	// 	socketId = _socketId;
		// 	// }
		// 	var users = _users;

		// 	// get current user infor
		// 	users.forEach((user) => {
		// 		if( user.username == username )
		// 		{
		// 			curUser = user;
		// 		}
		// 	});
		// 	me.chatFormObj.outputUsers( users );
		// }); 	


		// // me.socket.on('exit', (_userList) => {
		// // 	userList = _userList;
		// // });


		// me.socket.on('sendMsg', (data) => {
			
		// 	let messageTag = $('.chat-history').find("li#" + data.id);
		// 	if( messageTag.length > 0 )
		// 	{
		// 		messageTag.removeClass("offline");
		// 		removeOfflineMessage( data );
		// 	}
		// 	else
		// 	{
		// 		me.chatFormObj.outputMessage(data);
		// 	}
		// });

		
	  	// // ---------------------------------------------------------------------------

        // me.socket.on('connect_error', function() {
		// 	console.log('Failed to connect to server');
		// 	// $("#chatView").hide();
		// 	// $("#initChatMsg").html('Failed to connect to server').show();
		// });

		// me.socket.on('connect', function () {
		// 	console.log('Socket is connected.');

		// 	$("#chatView").hide();
		// 	$("#initChatMsg").html(`Wellcome, ${username}`).show();

		// 	// Send the queue message if there is any message unsent
		// 	var offlineMessages = getOfflineMessages();
		// 	for( i=offlineMessages.length - 1; i>=0; i-- )
		// 	{
		// 		// Emit message to server
		// 		me.socket.emit('getMsg', offlineMessages[i]);
		// 	}

		// });

		
		// me.socket.on('reconnect', function() {
		// 	console.log('reconnect fired!');
		// });
		
		// me.socket.on('disconnect', function () {
		// 	console.log('Socket is disconnected.');
		// });


    }


    // ------------------------------------------------------------------------
	// RUN init method

    me.init();
}