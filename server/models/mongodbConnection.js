
// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://<cthutran@gmail.com>:<Tran@10121984>@cluster0.xmash.mongodb.net/?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });


// ====================================================================================================

// const { Server } = require("socket.io");
// const { createAdapter } = require("@socket.io/mongo-adapter");
// const { MongoClient } = require("mongodb");

// const DB = "chatApp";
// const COLLECTION = "socket.io-adapter-events";

// const io = new Server();

// const mongoClient = new MongoClient("mongodb://localhost:27017/?replicaSet=rs0", {
//   useUnifiedTopology: true,
// });

// const mongodbConnection = async () => {
//   await mongoClient.connect();

//   try {
//     await mongoClient.db(DB).createCollection(COLLECTION, {
//       capped: true,
//       size: 1e6
//     });
//   } catch (e) {
//     // collection already exists
//   }
//   const mongoCollection = mongoClient.db(DB).collection(COLLECTION);

//   io.adapter(createAdapter(mongoCollection));
//   io.listen(3000);
// }

// mongodbConnection();