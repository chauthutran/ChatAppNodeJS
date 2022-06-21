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
        me.username = Utils.getParamValueFromURL("username");

        if( me.username != undefined )
        {
            me.initSocketIO();

            // new UploadFile( me.socket, me.chatFormObj );
        }
    }

    me.initSocketIO = function() {
        me.socketIOObj = new SocketIO( me.username );
        me.socket = me.socketIOObj.socket;
        me.chatFormObj = me.socketIOObj.chatFormObj;
    }


    // ------------------------------------------------------------------------
	// RUN init method

    me.init();
}