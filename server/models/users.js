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
	// contacts: {
	// 	type: Array,
	// 	required: true
	// },
	contacts: [
		{
			contactName: String,
			hasNewMessages: Boolean,
		}
	]
})

// const UsersCollection = mongoose.model('users', userSchema);
const UsersCollection = mongoose.model('users1', userSchema);
module.exports = UsersCollection;