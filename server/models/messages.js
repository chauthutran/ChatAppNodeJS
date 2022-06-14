const mongoose = require('mongoose');
const msgSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: true
    },
	receiver: {
        type: String,
        required: true
    },
	msg: {
		type: String,
		required: true
	},
	msgid: {
		type: String,
		required: true
	},
	filetype: {
		type: String,
		required: false
	}
})

const MessagesCollection = mongoose.model('messages', msgSchema);
module.exports = MessagesCollection;