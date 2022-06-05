const path = require('path');
const http = require('http');
const express = require('express');
const cors = require("cors");
const Server = require('socket.io');


const app = express();
const server = require('http').Server(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"]
  }
});

server.listen(3000, () => console.log(`Server running on port 3000`));
