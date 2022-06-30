
const UsersCollection = require("../models/users");

const UserManagement = class {
	constructor( username1, username2 ) {
		this.username1 = username1;
		this.username2 = username2;
		this.status = [];
	}

	createIfNotExist( exeFunc ) {
		UsersCollection.find().or([
			{ username: this.username1 },
			{ username: this.username2 }
		]).then(( list ) => {
			console.log("----- createIfNotExist : ");
			var me = this;
			if( list.length == 1 )
			{
				if( list[0].username == this.username1 )
				{
					this.create( me.username2, me.username1, function(){
						me.updateContact( list[0], me.username2, function( newUserData ) {
							exeFunc( newUserData );
						} );
					} );
					
				}
				else if( list[0].username == this.username2 )
				{
					this.create( me.username1, me.username2, function(){
						me.updateContact( list[0], me.username1, function( newUserData ) {
							exeFunc( newUserData );
						} );
					} );

					// this.create( this.username1, this.username2 );
					// this.updateContact( list[0], this.username1 );
				}
			}
			else if( list.length == 0 )
			{
				this.create(me.username1, me.username2, function( ){
					me.create(me.username2, me.username1, function(){
						exeFunc();
					});
				});
				
			}
		});
	};

	 create( username, contact, exeFunc ) {
		const data = {
			username: username,
			fullName: username,
			contacts: [{contactName: contact, hasNewMessages: false}]
		}

		// Save message to mongodb
		const user = new UsersCollection( data );
		// user.save().then(() => {
		// 	if( exeFunc ) exeFunc();
		// 	// this.status.push({ "msg": `User "${username}" is saved.`, "status": "SUCCESS"});
		// })

		user.save(function(err){
			console.log("saved .");
			if( exeFunc ) exeFunc();
		})
	}

	 updateContact( userData, contact, exeFunc ) {
		userData.contacts.push({ contactName: contact, hasNewMessages: true } );
		// userData.fullName="fasdfasdfads";
		// userData.save().then(() => {
		// 	console.log("updated");
		// 	this.status.push({ "msg": `Add "${contact}" to contacts of user '${userData.username}'.`, "status": "SUCCESS"});
		// })

		userData.save(function(err){
			console.log("--saved");
			console.log(userData);
			if( exeFunc ) exeFunc( userData );
					// console.log("err");
					// console.log(err);
					// this.status.push({ "msg": `Add "${contact}" to contacts of user '${userData.username}'.`, "status": "SUCCESS"});
				
			});

		// UsersCollection.findByIdAndUpdate( 
		// 	userData._id
		// 	,{ $push: { contacts: { contactName: contact, hasNewMessages: true }  } }
		// 	,function( error, result){
		// 		console.log(error)
		// 		console.log(result)
		// 	}).exec();

		// userData.contacts.push({ contactName: contact, hasNewMessages: true } );
		// // userData.fullName="fasdfasdfads";
		// userData.save(function(err){
		
		// 		console.log("err");
		// 		console.log(err);
		// 		// this.status.push({ "msg": `Add "${contact}" to contacts of user '${userData.username}'.`, "status": "SUCCESS"});
			
		// })

		// userData.contacts.push({ contactName: contact, hasNewMessages: true } );

		// UsersCollection.updateOne({username: userData.username}, { contacts: [userData.contacts] }).then((res) => {
		// 	console.log("updated");
		// 	this.status.push({ "msg": `Add "${contact}" to contacts of user '${userData.username}'.`, "status": "SUCCESS"});
		// })


		// UsersCollection.updateOne(
		// 	{username: userData.username}
		// 	// , { contacts: [userData.contacts] }
		// 	,{ $push: { contacts: { contactName: contact, hasNewMessages: true }  } }
		// 	// , function(err, result) {
		// 	// 	if (err) {
		// 	// 	console.log(err);
		// 	// 	} else {
		// 	// 		console.log(result);
		// 	// 	}
		//  	//  }
		//   ).exec();

		
		// let contacts = userData.contacts;
		// contacts.push({ contactName: contact, hasNewMessages: true } );
		// const lst = JSON.parse( JSON.stringify( contacts ) );
		// console.log(lst);
		// UsersCollection.updateOne(
		// 	{ username: userData.username },
		// 	{ contacts: lst}
		// 	// {
		// 	// 	$push: {
		// 	// 		contacts: {
		// 	// 		 $each: [ { contactName: contact, hasNewMessages: true } ]
		// 	// 	  }
		// 	// 	}
		// 	// }
		// 	// {
		// 	// 	fullName: "fasdfasd"
		// 	// }
		// 	// , {safe: true, upsert: false, new: true},
		// 	,function(err, result) {
		// 		if (err) {
		// 		 console.log(err);
		// 		} else {
		// 			console.log(result);
		// 		}

		// 	})

		// const newContact = { contactName: contact, hasNewMessages: true };
		// UsersCollection.findOneAndUpdate(
		// 	{ username: userData.username },
		// 	{ $push: { contacts: newContact } }
		// 	// {
		// 	// 			$push: {
		// 	// 				contacts: {
		// 	// 				 $each: [ newContact, newContact ]
		// 	// 			  }
		// 	// 			}
		// 	// 		}
		//    , function (error, success) {
		// 	   console.log("updated contact");
		// 		 if (error) {
		// 			console.log("ERROR");
		// 			 console.log(error);
		// 		 } else {
		// 			console.log("success");
		// 			 console.log(success);
		// 		 }
		// 	 }
		// );


		// UsersCollection.findOneAndUpdate(
		// 	{ username: userData.username },
		// 	{$push: {"contacts": { contactName: contact, hasNewMessages: true }}},
		// 	{safe: true, upsert: true, new: true},
		//    function (error, success) {
		// 	   console.log("============ updated contact =============");
		// 		 if (error) {
		// 			console.log("ERROR");
		// 			 console.log(error);
		// 		 } else {
		// 			console.log("success");
		// 			 console.log(success);
		// 		 }
		// 	 })

		// UsersCollection.updateOne(
		// 	{ username: userData.username },
		// 	{ $push: { 
		// 				contacts: { contactName: contact, hasNewMessages: true }   
		// 			} 
		// 	},
		// 	{new: true, upsert: true }
		// )
		// .then((res) => {
		// 	console.log("updated contact");
		// 	this.status.push({ "msg": `Add "${contact}" to contacts of user '${userData.username}'.`, "status": "SUCCESS"});
		// })

	}
};

module.exports = UserManagement;