
function ChatForm( _username, _socket )
{
    var me = this;

    me.curUser = {};
    me.username = _username;
    me.socket = _socket;
    me.selectedUser;


    // ------------------------------------------------------------------------
    // HTML Tags

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
        // me.setCurrentUserInfo();

        // Add Emoji in Emoji Dashboard
        for( var i=0; i<emojiCodes.length; i++ )
        {
            var liTag = $("<li></li>");
            liTag.val("&#" + emojiCodes[i]+ ";")
            liTag.append("&#" + emojiCodes[i]+ ";");

            me.emojjiDashboardTag.find("ul").append(liTag);
        }

        me.setUp_Events();
    }

    me.setCurrentUserInfo = function()
    {
	    me.curUsernameTag.html( me.curUser.fullName );

        // For curUser icon background-color
        me.curUserIconTag.html( me.curUser.fullName.substring(0, 2).toUpperCase() );
        // me.curUserIconTag.css("backgroundColor", "#" + randomColor);
        me.curUserIconTag.css("color", "#" + Utils.stringToDarkColour( me.curUser.username ));
        me.curUserIconTag.css("backgroundColor", Utils.stringToLightColour( me.curUser.username ));
    }


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
                        me.socket.emit('getMsg', data );
                    }

					me.outputMessage( data );
				});
				reader.readAsDataURL( file );
            }
        })
    }


    // ------------------------------------------------------------------------
    // Supportive methods - For Users
    

    // Output user list
    me.outputUsers = function( data ) {

        me.curUser = data.curUser;
        me.setCurrentUserInfo();

		me.userListTag.html("");
		
		// Add the proper list here
		data.contacts.forEach((user) => {
			
			if( user.username != me.username )
			{
				const firstChar = user.username.substring(0,2).toUpperCase();
                const bgColorIcon = Utils.stringToLightColour( user.username );
                const colorIcon = Utils.stringToDarkColour( user.username );
                const userInfo = JSON.stringify( user );
                const status = (  data.onlineList.indexOf( user.username ) >= 0 ) ? "online" : "offline";
				var userTag = $(`<li class="clearfix" style="cursor:pointer;" username='${user.username}' user='${userInfo}'>
                                    <div class="user-icon" style="background-color: ${bgColorIcon}; color: ${colorIcon}">${firstChar}</div>
                                    <div class="about">
                                        <div class="name">${user.fullName}</div>
                                        <div class="status">
                                            <i class="fa fa-circle ${status}"></i> ${status}
                                        </div>
                                    </div>
                                </li>`);

				me.setupEvent_UserItemOnClick( userTag );
				me.userListTag.append( userTag );
			}
		});
		
	}

	// Select an user
    me.setupEvent_UserItemOnClick = function( userTag ) {
		userTag.click( function(e){
			me.selectedUser = JSON.parse( userTag.attr("user") ); 

			
			me.chatViewTag.show();
			me.initChatMsgTag.hide();
			me.socket.emit('loadMessageList', { username1: me.username, username2: me.selectedUser.username } );
		})
	}
   
    me.updateUserStatus = function( statusData )
    {
        me.userListTag.find(`li#${statusData.username}`).find("div.status > i")
            .removeClass("online")
            .removeClass("offline")
            .addClass( statusData.status );
    }


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
		if( me.socket.connected )
		{
			// Emit message to server
			me.socket.emit('getMsg', data );
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
		me.chatWithUserTag.html( `Chat with ${me.selectedUser.fullName}` );
        me.chatWithIconTag.html( me.selectedUser.fullName.substring(0,2).toUpperCase() )
        me.chatWithIconTag.css( "color", "#" + Utils.stringToDarkColour( me.selectedUser.username ) );
        me.chatWithIconTag.css( "backgroundColor", Utils.stringToLightColour( me.selectedUser.username ) );

        me.chatHistoryTag.find("ul").html("");

        for( let i=0; i<list.length; i++ )
        {
            me.outputMessage( list[i] );
        }

		me.chatViewTag.show();
		me.initChatMsgTag.hide();
	}


    // Output a message
    me.outputMessage = function(message) {
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
        }

		
	}


    // ------------------------------------------------------------------------
    // Run INIT

    me.init();
}