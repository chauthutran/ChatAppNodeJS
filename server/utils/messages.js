const moment = require('moment');

let messages = [];
// {
//   sender,
//   receiver,
//   text,
//   type,
//   time: moment().format('h:mm a'),
//   id: (new Date()).getTime()
// };

function getMessages( username1, username2 ) {
	let list = [];

	for( var i=0; i<messages.length; i++ )
	{
		const message = messages[i];
		if( messages.sender.username == username1 || messages.receiver.username == username1
			|| messages.sender.username == username2 || messages.receiver.username == username2  )
		{
			list.push( result );
		}
	}

	return list;
}

module.exports = {
	getMessages
};
