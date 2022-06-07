

function getParamValueFromURL ( paramName ) {
    return (new URLSearchParams(window.location.search)).get( paramName );
}

const checkInternetStatusOnline = () => {
    return (navigator.onLine);
    
    // if (navigator.onLine) {
    //     return 
        // alert("Hi! You're online!!!");
    // } else {
        // alert("Oops! You're offline. Please check your network connection...");
    // }
}

const formatMessage = (username, text) => {
    return {
      username,
      text,
      time: moment().format('h:mm a'),
      id: (new Date()).getTime()
    };
}


const removeFromArray = function( list, propertyName, value )
{
	var index;

	for( let i = 0; i < list.length; i++ )
	{
		var item = list[i];
		if ( item[ propertyName ] == value ) 
		{
			index = i;
			break;
		}
	}

	if ( index != undefined ) 
	{
		list.splice( index, 1 );
	}

	return list;
};

const findItemFromList = ( list, value, propertyName ) =>
{
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

function invertColor(hex) {
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
    return '#' + padZero(r) + padZero(g) + padZero(b);
}


function padZero(str, len) {
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}



function insertText( inputField, insertedValue ) {
    var cursorPos = inputField.prop('selectionStart');
    var v = inputField.val();
    var textBefore = v.substring( 0, cursorPos );
    var textAfter  = v.substring( cursorPos, v.length );
    inputField.val( textBefore + insertedValue + textAfter );
}