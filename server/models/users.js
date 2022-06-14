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
	}
})

const UsersCollection = mongoose.model('users', userSchema);
module.exports = UsersCollection;