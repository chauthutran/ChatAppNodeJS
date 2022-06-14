

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

Utils.formatMessage = function(sender, receiver, msg, filetype ) {
    return {
        sender,
        receiver,
        msg,
        filetype,
        time: moment().format('h:mm a'),
        msgid: (new Date()).getTime()
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

Utils.stringToLightColour = function(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = '#';
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xFF;
        colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
}

Utils.stringToDarkColour = function(str) {
    const col = Utils.stringToLightColour( str );
    const amt = -50;
    return (((col & 0x0000FF) + amt) | ((((col >> 8) & 0x00FF) + amt) << 8) | (((col >> 16) + amt) << 16)).toString(16); 
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


Utils.removeFromArray = function( list, value, propertyName )
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

