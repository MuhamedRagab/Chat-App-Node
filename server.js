const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const users = new Map();

io.on("connection", (socket) => {
  console.log("a user connected: " + socket.id);

  socket.on("joinRoom", ({ name, roomId, from }) => {
    users.set(socket.id, {
      name,
      roomId,
    });

    socket.join(roomId);
    const msg = {
      id: socket.id,
      name: name,
      content: "joined the room",
      from,
      to: "all",
    };
    socket.to(roomId).emit("userJoined", msg);
  });

  socket.on("message", (msg) => {
    socket.to(msg.to).emit("messages", msg);
  });

  socket.on("leaveRoom", ({ name, roomId, from }) => {
    socket.leave(roomId);
    const msg = {
      id: socket.id,
      name: name,
      content: "left the room",
      from: socket.id,
      to: "all",
    };
    socket.to(roomId).emit("userLeft", msg);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected: " + socket.id);
    // const user = users.get(socket.id);
    // socket.to(user.roomId).emit("userLeft", {
    //   id: socket.id,
    //   name: user.name || "unknown",
    //   content: "left the room",
    //   from: socket.id,
    //   to: "all",
    // });

    users.delete(socket.id);
  });
});

server.listen(3000, () => {
  console.log("listening on localhost:3000");
});
