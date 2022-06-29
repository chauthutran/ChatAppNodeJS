// const { find } = require("../../server/models/messages");

function ChatApp()
{
    var me = this;

    me.curUser = {};
    // me.sockeObj = _sockeObj;
    me.socket;
    me.selectedUser;
	me.users = [];


    // ------------------------------------------------------------------------
    // HTML Tags

    me.curUserDivTag = $("#curUserDiv");
    me.curUsernameTag = $("#curUsername");
    me.curUserIconTag = $("#curUserIcon");
    me.sendBtnTag = $("#sendBtn");
    me.msgTag = $("#msg");

    me.userListTag = $("#users");

    
    me.logoutBtnTag = $('.leave-btn');
    me.emojjiDashboardTag = $(".emoji-dashboard");
    me.showEmojiDashboardTag = $("#showEmojiDashboard");
    
	
	me.chatWithUserTag = $(".chat-with");
    me.chatWithIconTag = $(".chat-with-icon");
	me.chatViewTag = $("#chatView");
	me.initChatMsgTag = $("#initChatMsg");
	
    me.chatHistoryTag = $('.chat-history');
    me.chatHistoryMsgNoTag = $(".chat-num-messages")

    
    // ------------------------------------------------------------------------
    // INIT method

    me.init = function() {
        me.username = Utils.getParamValueFromURL("username");
		// me.initSocket();

        // Add Emoji in Emoji Dashboard
        for( var i=0; i<emojiCodes.length; i++ )
        {
            var liTag = $("<li></li>");
            liTag.val("&#" + emojiCodes[i]+ ";")
            liTag.append("&#" + emojiCodes[i]+ ";");

            me.emojjiDashboardTag.find("ul").append(liTag);
        }

        // Get contact list of username
        $.get( serverURL + "/users?username=" + me.username,{}, function( userProfile ){
			me.initSocket();

            me.curUser = userProfile.curUser;

            // Render contact list
            me.outputUsers( userProfile );

            // Update the contact list status
            me.users.forEach((user) => {
				me.setUserStatus(user);
			});

        });

        me.setUp_Events();
    }


    // =====================================================================
    // For Socket

    me.initSocket = function()
    {
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
        });

        // Register a catch-all listener, which is very useful during development:
		me.socket.onAny((event, ...args) => {
			console.log(event, args);
		});
        
		const sessionID = localStorage.getItem("sessionID");
		if (sessionID) {
			me.socket.auth = { sessionID, username: me.username };
		}
		else
		{
			me.socket.auth = { username: me.username };
		}

		me.socket.connect();

        me.socketEventListener();
    }

    me.socketEventListener = function()
    {
	  	// ---------------------------------------------------------------------------
		// SocketIO Connection Event Listener

		me.socket.on("connect", () => {
		
			console.log('Socket is connected.');

			const user = {username: me.username, connected: true};
			me.setUserStatus( user );

            
            var offlineMessages = getOfflineMessages();
            for( i=offlineMessages.length - 1; i>=0; i-- )
            {
                const data = offlineMessages[i];
                me.socket.emit('private_message', data );
            }
			
		});
		  
		me.socket.on("disconnect", () => {

			// var usernameList = Object.keys( me.users );
			// for( var i=0; i<usernameList.length;i++ )
			// {
			// 	var user = me.users[usernameList[i]]
			// 	if (user.self) {
			// 		user.connected = false;
			// 	}
			// } 

		});

		me.socket.on('connect_error', function(err) {
			if (err.message === "invalid username") {
                console.log( err.message );

                const sessionID = localStorage.getItem("sessionID");
                if (sessionID) {
                    me.socket.auth = { sessionID, username: me.username };
                }
                else
                {
                    me.socket.auth = { username: me.username };
                }

                me.socket.connect();
			}
			else
			{
				console.log('Failed to connect to server');
			}
		});

		// END - SocketIO Connection Event Listener
		// ---------------------------------------------------------------------------
		

		me.socket.on("session", ({ sessionID, userID, username }) => {
			// attach the session ID to the next reconnection attempts
			me.socket.auth = { sessionID };
			// store it in the localStorage
			localStorage.setItem("sessionID", sessionID);
			// save the ID of the user
			me.socket.userID = userID;
			me.socket.username = username;
		});

		
		// me.socket.on("private_message", (data) => {
		// 	for (let i = 0; i < me.users.length; i++) {
		// 	  const user = me.users[i];
		// 	  if (user.userID === me.users[data.sender]) {
		// 		if( user.messages == undefined )
		// 		{
		// 			user.messages = [];
		// 		}

		// 		user.messages.push( data );
		// 		if (user.username !== me.selectedUser.username ) {
		// 		  	user.hasNewMessages = true;
		// 		}
		// 		break;
		// 	  }
		// 	}
		// });

		// ---------------------------------------------------------------------------
		// For "User" Event Listener

		me.socket.on("users", (_users) => {
			_users.forEach((user) => {
				// var keys = Object.keys(me.users);
				// for (let i = 0; i < keys.length; i++) {
				// 	const existingUser = me.users[keys[i]];
				// 	if (existingUser.userID === user.userID) {
				// 		existingUser.connected = user.connected;
				// 		return;
				// 	}
				// }

				// user.self = ( user.userID === me.socket.userID );
				// me.initReactiveProperties(user);
				// me.users[user.username] = user;

				me.setUserStatus(user);
			});
		});

		me.socket.on("user_connected", (user) => {
			me.setUserStatus(user);
		});

		// END - For "User" Event Listener
		// ---------------------------------------------------------------------------


		
	  	// ---------------------------------------------------------------------------
		// For "Message" Event Listeners 

		me.socket.on('message_list', ( data ) => {
			const messages = Utils.mergeWithOfflineMessages( data.messages, data.users.username1, data.users.username2 );
			me.outputMessageList( messages );
			me.userListTag.find(`[username='${me.selectedUser.username}']`).find("span").removeClass("has-new-message");

			me.socket.emit("has_new_message", { userData: me.curUser, contactName: me.selectedUser.username, hasNewMessages: false });

		});
		
		me.socket.on("receive_message", (userData) => {
			const contacts = userData.contacts;
			if( me.curUser.username == userData.username )
			{
				me.curUser = userData;
			}

			for( var i=0; i< contacts.length; i++ )
			{
				const contactInfo = contacts[i];
				const userTag = me.userListTag.find(`[username='${contactInfo.contactName}']`);
				if( userTag.length > 0 )
				{
					if( contactInfo.hasNewMessages )
					{
						userTag.find("span").addClass("has-new-message");
					}
					else
					{
						userTag.find("span").removeClass("has-new-message");
					}
				}
			}
		});

		me.socket.on('sendMsg', data => {
			me.outputMessage( data );

			if( this.selectedUser == undefined || data.receiver != this.selectedUser.username )
			{
				me.socket.emit("has_new_message", { userData: me.curUser, contactName: data.sender, hasNewMessages: true });
			}
			
		})

		me.socket.on('user_disconnected', ( username ) => {
			const user = {username, connected: false }
			me.setUserStatus( user );
		});

    }

	// For Socket - END
	// =====================================================================



    // ------------------------------------------------------------------------
    // HTML Tags's events

    me.setUp_Events = function()
    {
        me.sendBtnTag.click( function(e){
            me.submitChatMessage( e )
        });
    
        me.msgTag.keypress( function(e){
            if( e.key === "Enter") {
                me.submitChatMessage( e )
            }
        });


        // Log-out button
        me.logoutBtnTag.click(function() {
            const leaveRoom = confirm('Are you sure you want to log-out ?');
            if (leaveRoom) {
                me.socket.off("connect_error");
                window.location = 'index.html';
            } 
            else {
            }
        });

        $(document).click(function(e){
            me.emojjiDashboardTag.slideUp('fast');
        });
        

        // Show Emoji Dashboard
        me.showEmojiDashboardTag.click( function(e){
            me.emojjiDashboardTag.slideToggle('fast');
            e.stopPropagation();
        });

        me.emojjiDashboardTag.find("ul").find("li").click( function() {
            Utils.insertText( me.msgTag, $(this).html() );
            me.emojjiDashboardTagslideUp('fast');
        });


        me.uploadInputTag = $("#upload_input");
        me.uploadInputTag.change( function(event){
            var files = event.target.files;
            if( ( files != undefined || files != null ) && files.length > 0 )
            {
                const file = files[0];
				const reader = new FileReader();
				reader.addEventListener( "load", () => {
					const type = ( file.type.indexOf("image/") == 0 ) ? "IMAGE" : "FILE";
                    const data = Utils.formatMessage( me.curUser.username, me.selectedUser.username, reader.result, type, file.name );

                    if( !me.socket.connected )
                    {
                        saveOfflineMessage( data );
                    }
                    else
                    {
                        me.socket.emit("private_message", data );

                        if( me.selectedUser.messages == undefined )
                        {
                            me.selectedUser.messages = [];
                        }
                        me.selectedUser.messages.push(data);
                    }

					me.outputMessage( data );
				});
				reader.readAsDataURL( file );
            }
        })

    }


    // ------------------------------------------------------------------------
    // Supportive methods - For Users
    

    me.setCurrentUserInfo = function()
    {
        me.curUserDivTag.attr(`username="${me.curUser.username}"`);
	    me.curUsernameTag.html( me.curUser.fullName );

        // For curUser icon background-color
        me.curUserIconTag.html( me.curUser.fullName.substring(0, 2).toUpperCase() );
        // me.curUserIconTag.css("backgroundColor", "#" + randomColor);
        me.curUserIconTag.css("color", "#" + Utils.stringToDarkColour( me.curUser.username ));
        me.curUserIconTag.css("backgroundColor", Utils.stringToLightColour( me.curUser.username ));
    }


    // Output user list
    me.outputUsers = function( data ) {

        me.curUser = data.curUser;
        me.setCurrentUserInfo();

		me.userListTag.html("");
		
		// Add the proper list here
		data.contacts.forEach((user) => {
			
			const contactName = user.username;
			if( contactName != me.username )
			{
				const found = Utils.findItemFromList( me.curUser.contacts, contactName,"contactName" );
				const hasNewMessages = ( found && found.hasNewMessages ) ? true : false;

				const firstChar = user.username.substring(0,2).toUpperCase();
                const bgColorIcon = Utils.stringToLightColour( contactName );
                const colorIcon = Utils.stringToDarkColour( contactName );
                const userInfo = JSON.stringify( user );
                // Set status "offline" for all users in contact list. Will update after getting online user list / OR when an user is online
				var userTag = $(`<li class="clearfix" style="cursor:pointer;" username='${contactName}' user='${userInfo}'>
                                    <div class="user-icon" style="background-color: ${bgColorIcon}; color: ${colorIcon}">${firstChar}</div>
                                    <div class="about">
                                        <div class="name">${user.fullName}</div>
                                        <div class="status">
                                            <i class="fa fa-circle offline"></i> <span>offline</span>
                                        </div>
                                    </div>
                                </li>`);

				if( hasNewMessages )
				{
					userTag.find(".status > span").addClass("has-new-message");
				}

				me.setupEvent_UserItemOnClick( userTag );
				me.userListTag.append( userTag );
			}
		});
		
	}

	// Select an user
    me.setupEvent_UserItemOnClick = function( userTag ) {
		userTag.click( function(e){
            // me.socket.auth = { username: me.username };
     		// me.socket.connect();

			
            me.selectedUser = JSON.parse( userTag.attr("user") ); 
			me.chatWithUserTag.html( `Chat with ${me.selectedUser.fullName}` );
			me.chatWithIconTag.html( me.selectedUser.fullName.substring(0,2).toUpperCase() )
			me.chatWithIconTag.css( "color", "#" + Utils.stringToDarkColour( me.selectedUser.username ) );
			me.chatWithIconTag.css( "backgroundColor", Utils.stringToLightColour( me.selectedUser.username ) );
			me.chatHistoryTag.find("ul").html("");

            
            me.chatViewTag.show();
            me.initChatMsgTag.hide();

			me.socket.emit('get_message_list', { username1: me.username, username2: me.selectedUser.username } );
		})
	}
   
    me.setUserStatus = function(user) {
        let userTag = $(`[username="${user.username}"]`);
        if( userTag.length > 0 )
        {
            var statusTag = userTag.find("div.status");
            const status = user.connected ? "online" : "offline";
            statusTag.find("i").removeClass("offline").removeClass("online").addClass(status);
            statusTag.find("span").html(status);
        }
        
    }

	me.initReactiveProperties = (user) => {
		user.messages = [];
		user.hasNewMessages = false;
	};

    // ------------------------------------------------------------------------
    // Supportive methods - For messages

    // Message submit
	me.submitChatMessage = function(e) {
		e.preventDefault();

		// Get message.msg
		let msg = me.msgTag.val();
		msg = msg.trim();
		if (!msg) {
			return false;
		}

        const data = Utils.formatMessage( me.curUser.username, me.selectedUser.username, msg );
        console.log(data);
		if( me.socket.connected )
		{
			// Emit message to server
            me.socket.emit("private_message", data);
			// me.socket.emit("has_new_message", { userData: me.selectedUser, contactName: me.curUser.username, hasNewMessages: true });
            // me.selectedUser.messages.push(data);
		}
		else
		{
			saveOfflineMessage( data );
		}

		me.outputMessage( data );

		// Clear input
		me.msgTag.val("");
	}

    
    // Output message list
    me.outputMessageList = function( list ) {

        for( let i=0; i<list.length; i++ )
        {
            me.outputMessage( list[i] );
        }

	}


    // Output a message
    me.outputMessage = function(message) {

		if( me.selectedUser != undefined )
		{
			if( ( me.username == message.sender && me.selectedUser.username == message.receiver ) ||
				( me.username == message.receiver && me.selectedUser.username == message.sender ) )
			{
				// Only remove message from localStorage if the socket is online and this message existed 
				if( me.socket.connected )
				{ 
					removeOfflineMessage( message ); 
				}
	
				var messageTag = me.chatHistoryTag.find(`ul li[id="${message.datetime}"]`);
				if( messageTag.length > 0 ) 
				{
					if( messageTag.hasClass("offline") )
					{
						messageTag.removeClass("offline");
					}
				}
				else
				{
					var messageTextDivTag;
					if( message.filetype != undefined )
					{
						if( message.filetype == "IMAGE" )
						{
							messageTextDivTag = `<img style="width: 300px;" src="${message.msg}">`;
						}
						else
						{
							messageTextDivTag = `<a href="${message.msg}" target="_blank">${message.name}</a>`;
						}
					} 
					else {
						messageTextDivTag = `<span>${message.msg}</span>`;
					}
			
			
					const offlineClazz = ( me.socket.connected ) ? "" : "offline";
	
					if( message.sender == me.username )
					{
						messageTag = $(`<li id='${message.datetime}' class="${offlineClazz}">
											<div class="message-data">
												<span class="message-data-time" >${DateUtils.formatDisplayDateTime(message.datetime)}</span> &nbsp; &nbsp;
												<span class="message-data-name" >${message.sender}</span> <i class="fa fa-circle me"></i>
												
												</div>
												<div class="message my-message">
													${messageTextDivTag}
												</div>
										</li>`)
					}
					else
					{
						messageTag = $(`<li id='${message.datetime}' class="clearfix ${offlineClazz}">
								<div class="message-data align-right">
									<span class="message-data-time" >${DateUtils.formatDisplayDateTime(message.datetime)}</span> &nbsp; &nbsp;
									<span class="message-data-name" >${message.sender}</span> <i class="fa fa-circle me"></i>
								</div>
								<div class="message other-message float-right">
									${messageTextDivTag}
								</div>
							</li>`)
					}
	
					me.chatHistoryTag.find("ul").append( messageTag );
					me.chatHistoryMsgNoTag.html( "already " + NumberUtils.formatDisplayNumber( me.chatHistoryTag.find("ul li").length ) + " messages" );
					me.chatHistoryTag.scrollTop(me.chatHistoryTag[0].scrollHeight);
				}
			}
		}
	}


    // ------------------------------------------------------------------------
    // Run INIT

    me.init();
}