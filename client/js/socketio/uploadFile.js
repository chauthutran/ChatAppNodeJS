
function UploadFile( _socket, _mainObj )
{
	var me = this;

	me.socket = _socket;
	me.mainObj = _mainObj;

	// ------------------------------------------------------------------------
	// INIT method

	me.init = function() {
		me.setUp_Events();
	}

	// ------------------------------------------------------------------------
	// Events

	me.setUp_Events = function() {
		var siofu = new SocketIOFileUpload(me.socket);

		siofu.listenOnInput(document.getElementById("upload_input"));

		siofu.addEventListener("start", function (event) {
			// If the me.socket is not connected, save the file in local storage
		
			console.log("STart .... ");
			

			// if( !me.socket.connected )
			// {
				const file = event.file;
				const reader = new FileReader();
				reader.addEventListener( "load", () => {
					const type = ( event.file.type.indexOf("image/") == 0 ) ? "IMAGE" : "FILE";
					const data = Utils.formatMessage( me.mainObj.curUser.username, me.mainObj.selectedUser.username, reader.result, type, file.name );
					// 	saveOfflineMessage( data );

					me.mainObj.outputMessage( data );
				})
				reader.readAsDataURL( file );
			// }
		});

		// Do something on upload progress:
		siofu.addEventListener("progress", function (event) {
		  var percent = (event.bytesLoaded / event.file.size) * 100;
		  console.log("File is", percent.toFixed(2), "percent loaded");
		});

		// Do something when a file is uploaded:
		siofu.addEventListener("complete", function (event) {
			console.log("complete .... ");
		  	console.log(event);

			const type = ( event.file.type.indexOf("image/") == 0 ) ? "IMAGE" : "FILE";
		  	const data = Utils.formatMessage( me.mainObj.curUser.username, me.mainObj.selectedUser.username, `http://localhost:3111/${event.detail.name}`, type );
			
			me.socket.emit('getMsg', data );
			// me.mainObj.outputMessage( data );

			// removeOfflineMessage( data );
		});
	}

	// ------------------------------------------------------------------------
	// Run INIT

	me.init();

}