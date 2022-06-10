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
console.log(users);
			outputUsers( users );
		}); 	


		socket.on('exit', (_userList) => {
			// console.log('-------------- exit');
			// console.log(userList);

			userList = _userList;
		});

		// socket.on('sendMsg', (data) => {
		// 	$scope.messages.push(data);
		// });

		socket.on('sendMsg', (data) => {
			// messages.push(data);

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
		//   var img = document.createElement("img");
		//   img.setAttribute("style", "float:left;width:500px;height:300px");
		//   img.src = event.detail.name;
		//   img.addEventListener("click", (e) => {
		// 	$.ajax({
		// 	  method: "GET",
		// 	  url: "/deleteimage",
		// 	  data: {
		// 		path: event.detail.name,
		// 	  },
		// 	  success: function (data) {},
		// 	});
		//   });
		//   var div = document.getElementById("images");

		
{/*  */}
				
			if( event.file.type.indexOf("image/") == 0  )
			{
				var messageTag = $(`<li class="clearfix">
					<div class="message-data align-right">
						<span class="message-data-time" >${moment().format('h:mm a')}</span> &nbsp; &nbsp;
						<span class="message-data-name" >${username}</span> <i class="fa fa-circle me"></i>
					</div>
					<div class="message other-message float-right">
						<img style="width: 300px;" src="http://localhost:3111/${event.detail.name}">
					</div>
				</li>`)
				$('.chat-history').find("ul").append( messageTag );
			}
			else
			{
				var messageTag = $(`<li class="clearfix">
					<div class="message-data align-right">
						<span class="message-data-time" >${moment().format('h:mm a')}</span> &nbsp; &nbsp;
						<span class="message-data-name" >${username}</span> <i class="fa fa-circle me"></i>
					</div>
					<div class="message other-message float-right">
						<a href="http://localhost:3111/${event.detail.name}" target="_blank">${event.detail.name}</a>
					</div>
				</li>`)
				$('.chat-history').find("ul").append( messageTag );
			}
		

		});

	  	// ---------------------------------------------------------------------------

		// socket.on('connect_error', function() {
		// 	console.log('Failed to connect to server');
		// 	isConnectServer = false;
		// });

		// socket.on('connect', function () {
		// 	console.log('Socket is connected.');
		// 	isConnectServer = true;

		// 	// Send the queue message if there is any message unsent
		// 	for( i=queueMsgList.length - 1; i>=0; i-- )
		// 	{
		// 		// Emit message to server
		// 		socket.emit('chatMessage', queueMsgList[i]);
		// 	}

		// });

		// socket.on('disconnect', function () {
		// 	console.log('Socket is disconnected.');
		// });


		// // Join chatroom
		// socket.emit('joinRoom', { username, room });

		// // Get room and users
		// socket.on('roomUsers', ({ room, users }) => {
		// 	console.log("joined in room ");
		// 	// outputRoomName(room);
		// 	outputUsers(users);
		// });


		// // Message from server
		// socket.on('message', (message) => {
		// 	console.log(message);

		// 	let messageTag = $('.chat-messages').find("div#" + message.id);
		// 	if( messageTag.length > 0 )
		// 	{
		// 		messageTag.removeClass("offline");
		// 		removeFromArray( queueMsgList, "id", message.id );
		// 	}
		// 	else
		// 	{
		// 		outputMessage(message);
		// 	}
			
			
		// 	// Scroll down
		// 	chatMessages.scrollTop = chatMessages.scrollHeight;
		// });

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
			
			socket.emit('getMsg', formatMessage(username, selectedUser.id, msg) );
		}
		else
		{
			const data = formatMessage( username, selectedUser.id, msg );
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
			<span class="message-data-name" >${message.sender}</span> <i class="fa fa-circle me"></i>
			
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
