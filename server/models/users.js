const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true
	},
	fullName: {
			type: String,
			required: true
	},
	contacts: {
		type: Array,
		required: true
	},
	hasNewMessages: {
		type: Boolean,
		required: false
	}
})

const UsersCollection = mongoose.model('users', userSchema);
module.exports = UsersCollection;