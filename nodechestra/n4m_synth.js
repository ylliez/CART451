// import Express module & make instance
const express = require("express");
let app = express();
// import HTTP module, set port number & create server
const http = require('http')
const port = 4200;
let server = http.createServer(app);
server.listen(port, () => { Max.post('server listening on port ' + port); })
const io = require('socket.io')(server);
const sockets = io.sockets.sockets;
// const nsp = io.of('/delay');

// const fs = require('fs');
// const path = require("path");
// const static = require('node-static');

// // import WebSocket library & make instance
// const WebSocket = require("ws");
// const wss = new WebSocket.Server({ server });

// import Max/MSP library
const Max = require('max-api');
Max.post("Max/MSP API loaded");

// const readline = require("readline")
// const rl = readline.createInterface({
//   input: process.stdin,
//   terminal: false
// })
// rl.on("line", async line => {
//   // This will be posted to the Max console
//   await console.log(line)
// })

// const cookieParser = require("cookie-parser");
// const bodyParser = require("body-parser");



// serve pages from public dir
app.use(express.static(__dirname + '/public'));
// app.use("/", defaultRoute);
app.use("/ws", wsRoute);
// app.use("/client", clientRoute);
app.use("/attr", attributionRoute);
app.use("/delay", delayRoute);
app.use("/reverb", reverbRoute);

app.use("/passVal", handleVal)
app.use("/passClientInput", handleClientVal)
app.use("/passInputStr", handleInputStr)
app.use("/passInputNum", handleInputNum)

// function defaultRoute(req, res, next) { res.sendFile(__dirname + '/public/client.html'); }
// function clientRoute(req, res, next) { res.sendFile(__dirname + '/public/client.html'); }
function wsRoute(req, res, next) { res.sendFile(__dirname + '/public/ws.html'); }

function attributionRoute(req, res, next) {
  let routes = [`client`, `client_delay`, `client_reverb`];
  let route = routes[Math.floor(Math.random() * routes.length)];
  res.sendFile(__dirname + `/public/${route}.html`);
}
function delayRoute(req, res, next) { res.sendFile(__dirname + '/public/delay.html'); }
// function delayRoute(req, res, next) { res.sendFile(__dirname + '/public/synth_delay.html'); }
function reverbRoute(req, res, next) { res.sendFile(__dirname + '/public/client_reverb.html'); }

function handleClientVal(req, res, next) {
  // res.send(req.query);
  // res.send(req.query.val);
  res.send(typeof req.query.val);
  if (typeof req.query.val == "number") {
    Max.outlet(req.query.id, parseFloat(req.query.val));
  }
  else {
    Max.outlet(req.query.id, req.query.val);
  }
}

function handleVal(req, res, next) {
  res.send(req.query);
  Max.outlet(req.query.id, parseFloat(req.query.val));
}

function handleInputStr(req, res, next) {
  res.send(req.query);
  Max.outlet(req.query.cat, req.query.id, req.query.val);
}

function handleInputNum(req, res, next) {
  res.send(req.query);
  Max.outlet(req.query.cat, req.query.id, parseFloat(req.query.val));
}

// IO & HMTL separation: https://stackoverflow.com/questions/64767505/socket-io-show-the-users-in-the-correct-div 
io.of("/").adapter.on("create-room", (room) => {
  console.log(`room ${room} was created`);
});

io.on('connection', (socket) => {
  Max.post(`${socket.id} joined. ${io.engine.clientsCount} users connected`);
  // // Max.post(`${socket.id} joined ${socket.room}. ${io.engine.clientsCount} users connected`);
  // // Max.post(Array.from(sockets));
  // Max.post(Array.from(sockets.keys()));
  // Max.post(Array.from(io.sockets.sockets.values()));
  // Max.post("values" + sockets.values());
  // logSockets();
  // // Object.keys deprecated in 4.x

  // ALT
  // Max.post("/ of(/).sockets.size: " + io.of("/").sockets.size);
  // Max.post(io.of("/").sockets);

  // Max.post("/ sockets.sockets.size: " + sockets.size);

  // Max.post('io.sockets.sockets', io.sockets.sockets.keys());
  // Max.post('io.sockets.sockets', io.sockets.sockets.keys().length);

  // // NAMESPACES
  // // MAINSPACE : io.sockets alias for io.of('/')
  // io.sockets.emit("hi", "everyone");
  // io.of("/").emit("hi", "y'all");
  // // .SOCKETS : MAP of socket instances (Map<SocketId, Socket>)
  // Max.post(io.of("/").sockets);
  // Max.post(io.sockets.sockets);
  // // SIZE : Map.size equiv of Array.length
  // Max.post(io.sockets.sockets.size);
  // KEYS : iterator
  // Max.post(io.sockets.sockets.keys()); // empty object
  // Max.post(Array.from(io.sockets.sockets.keys())); // array of IDs
  // Max.post(io.sockets.sockets.values()); // empty object
  // Max.post(Array.from(io.sockets.sockets.values())); // CRASH (circular ref) array of socket instances
  // // CRASH
  //   io.sockets.sockets.forEach(logMapElements);
  //   function logMapElements(value, key, map) {
  //     // Max.post(`m[${key}] = ${value}`);
  //     Max.post(value);
  //   }

  // Max.post(sockets.allSockets())

  // async function logSockets() {
  //   // const AsyncSockets = await io.fetchSockets();
  //   // Max.post("fetchSockets: " + AsyncSockets.length);
  //   const AsyncSockets = await io.allSockets();
  //   Max.post("fetchSockets: " + AsyncSockets.length);
  // }


  socket.onAny((event, args) => {
    // Max.post(event, args);
    // Max.post(event);
    Max.post(args);
    Max.outlet(args);
  });
  // socket.on("inputNum", (args) => {
  //   Max.post(args);
  // });
  socket.on("disconnecting", (reason) => {
    // for (const room of socket.rooms) {
    //   Max.post(room)
    //   //   if (room !== socket.id) {
    //   //     socket.to(room).emit("user has left", socket.id);
    //   //   }
    // }
    Max.post(`${socket.id} left. ${io.engine.clientsCount} users connected`);
  });
});

io.of("/delay").on('connection', (socket) => {
  Max.post(`${socket.id} joined ${socket.room}. ${io.engine.clientsCount} users connected`);
});

// // COPILOT
// create unique ID for client
// let clientID = Date.now();
// // create array to store client IDs
// let clientIDs = [];
// // create array to store client sockets
// let clientSockets = [];
// // create array to store client data
// let clientData = [];
// // create array to store client data
// let clientDataObj = {};




// // IMPLEMENT THE BROADCAST FUNCTION TO ALL --> outside of wss
// wss.broadcast = function broadcast(data) {
//   //get all clients (note that the Socket server instance maintains a list of clients)
//   wss.clients.forEach(function each(client) {
//     //if client is there
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(data);
//     }
//   });
// };

// wss.on('connection', function connection(ws, req) {
//   const in_ip = req.connection.remoteAddress;
//   Max.post(`C2S: new client at ${in_ip}`);
//   ws.send("Connected");


//   // ws.on("close", function stop() {
//   //   Max.removeHandlers("send");
//   //   console.log("Connection closed");

//   //   ws.terminate();
//   // });
// });