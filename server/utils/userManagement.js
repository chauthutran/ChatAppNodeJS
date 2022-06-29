
const UsersCollection = require("../models/users");

const UserManagement = class {
	constructor( username1, username2 ) {
		this.username1 = username1;
		this.username2 = username2;
		this.status = {};
	}

	createIfNotExist() {
		UsersCollection.find().or([
			{ username: this.username1 },
			{ username: this.username2 }
		]).then(( list ) => {
			if( list.length == 1 )
			{
				if( list[0].username = this.username1 )
				{
					this.create( this.username2, this.username1 );
				}
				else if( list[0].username = this.username1 )
				{
					this.create( this.username1, this.username2 );
				}
			}
			else if( list.length == 0 )
			{
				this.create(this.username1, this.username2);
				this.create(this.username2, this.username1);
			}
		});
	};

	create( username, contact ) {
		const data = {
			username: username,
			fullName: username,
			contacts: [contact]
		}
		
		// Save message to mongodb
		const user = new UsersCollection( data );
		user.save().then(() => {
			this.status = { "msg": `User "${username}" is saved.`, "status": "SUCCESS"};
		})
	}
};

module.exports = UserManagement;