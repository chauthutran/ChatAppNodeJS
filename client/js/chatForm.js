
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
        var randomColor = Math.floor(Math.random()*16777215).toString(16);
        me.curUserIconTag.html( me.username.charAt(0).toUpperCase() );
        me.curUserIconTag.css("backgroundColor", "#" + randomColor);
        me.curUserIconTag.css("color", "#" + Utils.invertColor( randomColor ));
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
			// me.socket.emit('loadMessageList', ( me.username, me.selectedUser.username ) );
		})
	}

    // Message submit
	me.submitChatMessage = function(e) {
		e.preventDefault();

		// Get message text
		let msg = me.msgTag.val();
		msg = msg.trim();
		if (!msg) {
			return false;
		}

		const data = Utils.formatMessage( curUser, me.selectedUser, msg );
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
		me.chatWithTag.html( `Chat with ${me.selectedUser.username}`);
        // me.chatHistoryTag.find("ul").html("");

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

        const displayed = me.chatHistoryTag.find(`ul li#${message.id}`).length;
        if( displayed ) return;
        

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


		const offlineClazz = ( me.socket.connected ) ? "" : "offline";
		messageTag = $(`<li id='${message.id}' class="clearfix ${offlineClazz}">
					<div class="message-data align-right">
					<span class="message-data-time" >${message.time}</span> &nbsp; &nbsp;
					<span class="message-data-name" >${message.sender.username}</span> <i class="fa fa-circle me"></i>
					
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