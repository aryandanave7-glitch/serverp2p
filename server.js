const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// just to confirm server is alive
app.get("/", (req, res) => {
  res.send("✅ Signaling server is running");
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join", (room) => {
    socket.join(room);
    console.log(`Client ${socket.id} joined ${room}`);
  });

  socket.on("signal", ({ room, payload }) => {
    socket.to(room).emit("signal", payload);
  });

  socket.on("auth", ({ room, payload }) => {
  socket.to(room).emit("auth", payload);
});

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});
  socket.on("conn-request", ({ from, to }) => {
  let target = [...io.sockets.sockets.values()].find(s => s.handshake.query.fp === to);
  if (target) {
    target.emit("conn-request", { from });
  } else {
    socket.emit("offline", { to });
  }
});

socket.on("conn-accept", ({ from, to }) => {
  let target = [...io.sockets.sockets.values()].find(s => s.handshake.query.fp === to);
  if (target) {
    target.emit("conn-accept", { from });
  }
});

socket.on("conn-reject", ({ from, to }) => {
  let target = [...io.sockets.sockets.values()].find(s => s.handshake.query.fp === to);
  if (target) {
    target.emit("conn-reject", { from });
  }
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
