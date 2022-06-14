
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
    
	
	me.chatWithTag = $(".chat-with");
	me.chatViewTag = $("#chatView");
	me.initChatMsgTag = $("#initChatMsg");
	
    me.chatHistoryTag = $('.chat-history');
    me.chatHistoryMsgNoTag = $(".chat-num-messages")

    
    // ------------------------------------------------------------------------
    // INIT method

    me.init = function() {
        me.setCurrentUserInfo();

        // Add Emoji in Emoji Dashboard
        for( var i=0; i<emojiCodes.length; i++ )
        {
            var liTag = $("<li></li>");
            liTag.val("&#" + emojiCodes[i]+ ";")
            liTag.append("&#" + emojiCodes[i]+ ";");

            $("#emojiDashboard").find("ul").append(liTag);
        }

        me.setUp_Events();
    }

    me.setCurrentUserInfo = function()
    {
	    me.curUsernameTag.html( me.username );

        // For curUser icon background-color
        me.curUserIconTag.html( me.username.substring(0, 2).toUpperCase() );
        // me.curUserIconTag.css("backgroundColor", "#" + randomColor);
        me.curUserIconTag.css("color", "#" + Utils.stringToDarkColour( me.username ));
        me.curUserIconTag.css("backgroundColor", Utils.stringToLightColour( me.username ));
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
    }


    // ------------------------------------------------------------------------
    // Supportive methods

    // Output user list
    me.outputUsers = function( users ) {
		me.userListTag.html("");
		
		// Add the proper list here
		users.forEach((user) => {
			
			if( user.username != me.username )
			{
				const firstChar = user.username.substring(0,2).toUpperCase();
                const bgColorIcon = Utils.stringToLightColour( user.username );
				var userTag = $(`<li class="clearfix" style="cursor:pointer;" user=${JSON.stringify( user )}>
						<div class="user-icon" style="background-color: ${bgColorIcon}">${firstChar}</div>
						<div class="about">
						<div class="name">${user.username}</div>
						<div class="status">
							<i class="fa fa-circle online"></i> online
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

    // Message submit
	me.submitChatMessage = function(e) {
		e.preventDefault();

		// Get message.msg
		let msg = me.msgTag.val();
		msg = msg.trim();
		if (!msg) {
			return false;
		}

		const data = Utils.formatMessage( curUser.username, me.selectedUser.username, msg );
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

    
    // Output user list
    me.outputMessageList = function( list ) {
		me.chatWithTag.html( `Chat with ${me.selectedUser}`);
        me.chatHistoryTag.find("ul").html("");

        for( let i=0; i<list.length; i++ )
        {
            me.outputMessage( list[i] );
        }

		me.chatHistoryMsgNoTag.html( list.length );
		me.chatViewTag.show();
		me.initChatMsgTag.hide();
	}


    // Output messages sent
    me.outputMessage = function(message) {

        const displayed = me.chatHistoryTag.find(`ul li#${message.msgid}`).length;
        if( displayed ) return;
        

		var messageTag = "";
		var messageDivTag;
		if( message.filetype != undefined )
		{
			if( message.filetype == "IMAGE" )
			{
				messageDivTag = `<img style="width: 300px;" src="${message.msg}">`;
			}
			else
			{
				messageDivTag = `<a href="${message.msg}" target="_blank">${message.msg}</a>`;
			}
		} 
		else {
			messageDivTag = `<span>${message.msg}</span>`;
		}


		const offlineClazz = ( me.socket.connected ) ? "" : "offline";
		messageTag = $(`<li id='${message.msgid}' class="clearfix ${offlineClazz}">
					<div class="message-data align-right">
					<span class="message-data-time" >${message.time}</span> &nbsp; &nbsp;
					<span class="message-data-name" >${message.sender}</span> <i class="fa fa-circle me"></i>
					
					</div>
					<div class="message other-message float-right">
						${messageDivTag}
					</div>
				</li>`)
              
        me.chatHistoryTag.find("ul").append( messageTag );
		me.chatHistoryMsgNoTag.html( me.chatHistoryTag.find("ul li").length );
	}


    // ------------------------------------------------------------------------
    // Run INIT

    me.init();
}