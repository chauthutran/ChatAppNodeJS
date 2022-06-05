const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-history');
const roomName = document.getElementById('room-name');
let userList =  $('#users');

let socket;
let isConnectServer = true;
let queueMsgList = [];

// Get username and room from URL
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

		socket = io("http://localhost:3000", {
			reconnectionDelayMax: 1000,
			withCredentials: true,
			extraHeaders: {
				"Access-Control-Allow-Origin": "origin-list"
			}
		});

		socket.on('connect_error', function() {
			console.log('Failed to connect to server');
			isConnectServer = false;
		});

		socket.on('connect', function () {
			console.log('Socket is connected.');
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


		// Join chatroom
		socket.emit('joinRoom', { username, room });

		// Get room and users
		socket.on('roomUsers', ({ room, users }) => {
			console.log("joined in room ");
			// outputRoomName(room);
			outputUsers(users);
		});


		// Message from server
		socket.on('message', (message) => {
			console.log(message);

			let messageTag = $('.chat-messages').find("div#" + message.id);
			if( messageTag.length > 0 )
			{
				messageTag.removeClass("offline");
				removeFromArray( queueMsgList, "id", message.id );
			}
			else
			{
				outputMessage(message);
			}
			

			// Scroll down
			chatMessages.scrollTop = chatMessages.scrollHeight;
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

		if( isConnectServer )
		{
			// Emit message to server
			socket.emit('chatMessage', formatMessage(username, msg) );
		}
		else
		{
			const data = formatMessage( username, msg );
			queueMsgList.push( data );
			outputMessage( data );
		}

		// Clear input
		$("#msg").val("");
		$("#msg").focus();
	}

	// Output message to DOM
	function outputMessage(message) {

		var messageTag = $(`<li class="clearfix">
			<div class="message-data align-right">
			<span class="message-data-time" >${message.time}</span> &nbsp; &nbsp;
			<span class="message-data-name" >${message.username}</span> <i class="fa fa-circle me"></i>
			
			</div>
			<div class="message other-message float-right">
				${message.text}
			</div>
		</li>`)
		$('.chat-history').find("ul").append( messageTag );
	}

	// Add room name to DOM
	function outputRoomName(room) {
		// roomName.innerText = room;
	}

	// Add users to DOM
	function outputUsers(users) {
		// userList.html("");
		
		// Add the proper list here
		users.forEach((user) => {

			if( user.username != username )
			{
				const firstChar = user.username.charAt(0);
				var userTag = $(`<li class="clearfix">
						<div class="user-icon">${firstChar}</div>
						<div class="about">
						<div class="name">${user.username}</div>
						<div class="status">
							<i class="fa fa-circle online"></i> online
						</div>
						</div>
					</li>`);

				userList.prepend( userTag );
			}
			
		});

		
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
console.log("$(document).");
		$(".emoji-dashboard").slideUp('fast');
	});
	
	// $(".chat-header .menu ul.list,.chat-inp .emoji").click(function(e){
	// 	e.stopPropagation();
	// });

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
