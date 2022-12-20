const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const fetch = require('node-fetch');

const cors = require("cors");
const helmet = require('helmet');
const path = require('path');

const Schema = mongoose.Schema;

const app = express();
const httpServer = http.createServer(app);
const option = { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false };

require('dotenv').config();

let port = process.env.PORT || 4000;

mongoose.connect(process.env.URI, option, (err) => {
  if (err) {
    console.log(err);
  }
});

let RoomSchema = new Schema({
  code: String,
  users: Number,
  color: [String],
  position: String,
  turn: String
})

let Rooms = mongoose.model("Rooms", RoomSchema);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(express.static(path.resolve(__dirname, '../client/build/')));

app.get('*', function (_, response) {
  response.header("Content-Security-Policy", "connect-src");
  response.sendFile(path.resolve(__dirname, '../client/build/index.html'));
});

app.post('/api/active', async (req, res) => {
  const { code, created } = req.body;
  const query = { code: code };
  let response = "Room has closed / incorrect code.";
  let color = "";

  let user = await Rooms.findOne(query).exec();

  if (user) {
    Rooms.findOne(query, (err, room) => {
      if (err) return console.log(err);
      if (room.users < 2) {
        room.users += 1;
        response = "Joined the room!";
        if (!created) {
          color = room.color.includes("White") ? "Black" : "White";
        }
        room.color.push(color);
      }
      else {
        response = "Room is already full.";
      }
  
      room.save(err => {
        if (err) return console.log(err);
      })

      res.send({ response: response, color: color, turn: room.turn, position: JSON.parse(room.position) });
    })
  }
  else {
    res.send({ response: response });
  }
})

app.post('/api/delete', async (req, _) => {
  const { code, users, color } = req.body;
  const query = { code: code };

  let user = await Rooms.findOne(query).exec();

  if (user && users === 0) {
    Rooms.findOneAndRemove(query, (err, _) => {
      if (err) return console.log(err);
    })
  }

  else if (users === 1) {
    Rooms.findOne(query, (err, room) => {
      if (err) return console.log(err);
      room.users = 1;
      room.color = color === "White" ? ["Black"] : ["White"];

      room.save(err => {
        if (err) return console.log(err);
      })
    })
  }
})

app.post('/api/move', async (req, _) => {
  const { code, position, turn } = req.body;
  const query = { code: code };
  const data = { position: JSON.stringify(position), turn: turn };
  Rooms.findOneAndUpdate(query, data, (err) => {
    if (err) return console.error(err);
  })
})

app.post('/api/create', async (req, res) => {
  const { code, position } = req.body;
  const color = Math.random() > 0.5 ? "White" : "Black";
  const query = { code: code };
  const data = { code: code, users: 0, color: [color], position: JSON.stringify(position), turn: "white" };
  let response = "";
  let user = await Rooms.findOne(query).exec();

  if (!user) {
    Rooms.create(data, (err, _) => {
      if (err) return console.log(err);
      response = "Room has been created.";
      res.send({ response: response, color: color, position: position });
    })
  }
  else {
    res.send({ response: response });
  }
})

const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', socket => {
  socket.on('joinRoom', (info) => {
    socket.join(JSON.parse(info).room);
    socket.room = JSON.parse(info).room.toString();
    socket.color = JSON.parse(info).color;
  });

  socket.on('pieces', (pieces) => {
    let temp = JSON.parse(pieces);
    fetch(`http://localhost:${port}/api/move`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code: socket.room, position: temp.pieces, turn: temp.turn })
    }).catch(err => console.error(err))
    
    socket.to(socket.room).emit('pieces', (pieces));
  })

  socket.on('start', () => {
    socket.to(socket.room).emit('start');
  })

  socket.on('game', (winner) => {
    socket.to(socket.room).emit('game', (winner));
  })

  socket.on('disconnect', async () => {
    if (socket.room) {
      let users = await io.in(socket.room).allSockets();

      if (users.size === 1) {
        socket.to(socket.room).emit('delete');
      }
            
      fetch(`http://localhost:${port}/api/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code: socket.room, users: users.size, color: socket.color })
      }).catch(err => console.error(err))

      socket.leave(socket.room);
      socket.room = null;
      socket.color = null;
    }
  })
})

httpServer.listen(port, () => {
  console.log(`listening on port: ${port}`);
})