const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-history');
const roomName = document.getElementById('room-name');
let userListTag =  $('#users');

let socket;
let isConnectServer = true;
let queueMsgList = [];
let socketId = null;
let selectedUser = null;
let messages = [];
let msgData = null;
let users = [];


// Get username and room from URL
let curUser = {};
const { username, room } = Qs.parse(location.search, {
	ignoreQueryPrefix: true,
});


// Add Emoji in Emoji Dashboard
for( var i=0; i<emojiCodes.length; i++ )
{
	var liTag = $("<li></li>");
	liTag.val("&#" + emojiCodes[i]+ ";")
	liTag.append("&#" + emojiCodes[i]+ ";");

	$("#emojiDashboard").find("ul").append(liTag);
}

if( username != undefined )
{
	$("#curUsername").html( username );

	// For curUser icon background-color
	var randomColor = Math.floor(Math.random()*16777215).toString(16);
	$("#curUserIcon").html( username.charAt(0).toUpperCase() );
	$("#curUserIcon").css("backgroundColor", "#" + randomColor);
	$("#curUserIcon").css("color", "#" + invertColor( randomColor ));

	
	try
	{
		console.log("username: " + username );
		console.log("room: " + room );

		socket = io("http://localhost:3111", {
			reconnectionDelayMax: 1000,
			withCredentials: true,
			extraHeaders: {
				"Access-Control-Allow-Origin": "origin-list"
			}
		});

		socket.emit('username', username);

		socket.on('userList', (_users,_socketId) => {
			if( socketId === null){
				socketId = _socketId;
			}
			users = _users;
			// get current user infor
			users.forEach((user) => {
				if( user.username == username )
				{
					curUser = user;
				}
			});
			outputUsers( users );
		}); 	


		socket.on('exit', (_userList) => {
			userList = _userList;
		});


		socket.on('sendMsg', (data) => {
			
			console.log("---- sendMsg");
			console.log(data);

			let messageTag = $('.chat-messages').find("div#" + data.id);
			if( messageTag.length > 0 )
			{
				messageTag.removeClass("offline");
				removeFromArray( queueMsgList, "id", data.id );
			}
			else
			{
				outputMessage(data);
			}
		});

		// -----------------------------------------------------------------------
		// Upload file'
		
		var siofu = new SocketIOFileUpload(socket);

		siofu.listenOnInput(document.getElementById("upload_input"));

		// Do something on upload progress:
		siofu.addEventListener("progress", function (event) {
		  var percent = (event.bytesLoaded / event.file.size) * 100;
		  console.log("File is", percent.toFixed(2), "percent loaded");
		});

		// Do something when a file is uploaded:
		siofu.addEventListener("complete", function (event) {
		  	console.log(event);

			const type = ( event.file.type.indexOf("image/") == 0 ) ? "IMAGE" : "FILE";
		  	const data = formatMessage( curUser, selectedUser, `http://localhost:3111/${event.detail.name}`, type );
			if( isConnectServer )
			{
				socket.emit('getMsg', data );
				outputMessage( data );
			}
		});

	  	// ---------------------------------------------------------------------------

		socket.on('connect_error', function() {
			// console.log('Failed to connect to server');
			$("#chatView").hide();
			$("#initChatMsg").html('Failed to connect to server').show();

			isConnectServer = false;
		});

		socket.on('connect', function () {
			console.log('Socket is connected.');

			$("#chatView").hide();
			$("#initChatMsg").html('Wellcome to Chat App').show();

			isConnectServer = true;

			// Send the queue message if there is any message unsent
			for( i=queueMsgList.length - 1; i>=0; i-- )
			{
				// Emit message to server
				socket.emit('chatMessage', queueMsgList[i]);
			}

		});

		socket.on('disconnect', function () {
			console.log('Socket is disconnected.');
		});
	}
	catch( ex )
	{
		console.log(ex);
	}


	$("#sendBtn").click( function(e){
		submitChatMessage( e )
	});


	$("#msg").keypress( function(e){
		if (e.key === "Enter") {
			submitChatMessage( e )
		}
	});

	// Message submit
	const submitChatMessage = (e) => {
		e.preventDefault();

		// Get message text
		let msg = $("#msg").val();
		msg = msg.trim();
		if (!msg) {
			return false;
		}

		const data = formatMessage( curUser, selectedUser, msg );
		if( isConnectServer )
		{
			// Emit message to server
			socket.emit('getMsg', data );
		}
		else
		{
			const data = formatMessage( curUser, selectedUser, msg );
			queueMsgList.push( data );
		}

		outputMessage( data );

		// Clear input
		$("#msg").val("");
		$("#msg").focus();
	}

	// Output message to DOM
	function outputMessage(message) {

		var messageTag = "";
		var messageDivTag;
		if( message.type != undefined )
		{
			if( message.type == "IMAGE" )
			{
				messageDivTag = `<img style="width: 300px;" src="${message.text}">`;
			}
			else
			{
				messageDivTag = `<a href="${message.text}" target="_blank">${message.text}</a>`;
			}
		} 
		else {
			messageDivTag = `<span>${message.text}</span>`;
		}

		messageTag = $(`<li class="clearfix">
					<div class="message-data align-right">
					<span class="message-data-time" >${message.time}</span> &nbsp; &nbsp;
					<span class="message-data-name" >${message.sender.username}</span> <i class="fa fa-circle me"></i>
					
					</div>
					<div class="message other-message float-right">
						${messageDivTag}
					</div>
				</li>`)

		$('.chat-history').find("ul").append( messageTag );
		$(".chat-num-messages").html( $(".chat-history").find("ul li").length );
	}

	// Add users to DOM
	function outputUsers(users) {
		userListTag.html("");
		
		// Add the proper list here
		users.forEach((user) => {
			
			if( user.username != username )
			{
				const firstChar = user.username.charAt(0);
				var userTag = $(`<li class="clearfix" style="cursor:pointer;" user=${JSON.stringify( user )}>
						<div class="user-icon">${firstChar}</div>
						<div class="about">
						<div class="name">${user.username}</div>
						<div class="status">
							<i class="fa fa-circle online"></i> online
						</div>
						</div>
					</li>`);

				setupEvent_UserItemOnClick( userTag );
				userListTag.append( userTag );
			}
		});
		
	}

	let selectedUser;
	function setupEvent_UserItemOnClick( userTag ) {
		userTag.click( function(e){
			selectedUser = JSON.parse( userTag.attr("user") ); 
			$(".chat-with").html( `Chat with ${selectedUser.username}`);
			$(".chat-num-messages").html( $(".chat-history").find("ul li").length );

			$("#chatView").show();
			$("#initChatMsg").hide();
		})
	}

	//Prompt the user before leave chat room
	$('.leave-btn').click(function() {
		const leaveRoom = confirm('Are you sure you want to log-out ?');
		if (leaveRoom) {
			window.location = 'index.html';
		} 
		else {
		}
	});

	$(document).click(function(e){
		$(".emoji-dashboard").slideUp('fast');
	});
	

	// Show Emoji Dashboard
	$("#showEmojiDashboard").click( function(e){
		$('.emoji-dashboard').slideToggle('fast');
		e.stopPropagation();
	});

	$("#emojiDashboard").find("ul").find("li").click( function() {
		insertText( $("#msg"), $(this).html() );
		$(".emoji-dashboard").slideUp('fast');
	});
	

}
