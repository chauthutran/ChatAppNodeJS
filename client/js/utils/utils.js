

function Utils() {}


Utils.getParamValueFromURL = function ( paramName ) {
    return (new URLSearchParams(window.location.search)).get( paramName );
}

Utils.checkInternetStatusOnline = function() {
    return (navigator.onLine);
    
    // if (navigator.onLine) {
    //     return 
        // alert("Hi! You're online!!!");
    // } else {
        // alert("Oops! You're offline. Please check your network connection...");
    // }
}

Utils.formatMessage = function(sender, receiver, text, type) {
    return {
        sender,
        receiver,
        text,
        type,
        time: moment().format('h:mm a'),
        id: (new Date()).getTime()
    };
}



Utils.findItemFromList = function( list, value, propertyName ) {
	let item;

	if( list )
	{
		// If propertyName being compare to has not been passed, set it as 'id'.
		if ( propertyName === undefined )
		{
			propertyName = "id";
		}

		for( let i = 0; i < list.length; i++ )
		{
			let listItem = list[i];

			if ( listItem[propertyName] == value )
			{
				item = listItem;
				break;
			}
		}
	}

	return item;
}

Utils.invertColor = function( hex ) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    // invert color components
    var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
        g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
        b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
    // pad each with zeros and return
    return '#' + Utils.padZero(r) + Utils.padZero(g) + Utils.padZero(b);
}


Utils.padZero = function(str, len){
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}


Utils.insertText = function( inputField, insertedValue ) {
    var cursorPos = inputField.prop('selectionStart');
    var v = inputField.val();
    var textBefore = v.substring( 0, cursorPos );
    var textAfter  = v.substring( cursorPos, v.length );
    inputField.val( textBefore + insertedValue + textAfter );
}



Utils.getParamValueFromURL = function( paramName ) {
    return (new URLSearchParams(window.location.search)).get( paramName );
}


function removeFromArray( list, value, propertyName )
{
	var index;

	if( list )
	{
		$.each( list, function( i, item )
		{
			if ( item[ propertyName ] == value ) 
			{
				index = i;
				return false;
			}
		});
	
		if ( index !== undefined ) 
		{
			list.splice( index, 1 );
		}
	}
	

	return index;
}


// function outputMessage(message) {

//     var messageTag = "";
//     var messageDivTag;
//     if( message.type != undefined )
//     {
//         if( message.type == "IMAGE" )
//         {
//             messageDivTag = `<img style="width: 300px;" src="${message.text}">`;
//         }
//         else
//         {
//             messageDivTag = `<a href="${message.text}" target="_blank">${message.text}</a>`;
//         }
//     } 
//     else {
//         messageDivTag = `<span>${message.text}</span>`;
//     }


//     const offlineClazz = ( socket.connected ) ? "" : "offline";
//     messageTag = $(`<li id='${message.id}' class="clearfix ${offlineClazz}">
//                 <div class="message-data align-right">
//                 <span class="message-data-time" >${message.time}</span> &nbsp; &nbsp;
//                 <span class="message-data-name" >${message.sender.username}</span> <i class="fa fa-circle me"></i>
                
//                 </div>
//                 <div class="message other-message float-right">
//                     ${messageDivTag}
//                 </div>
//             </li>`)

//     $('.chat-history').find("ul").append( messageTag );
//     $(".chat-num-messages").html( $(".chat-history").find("ul li").length );
// }

