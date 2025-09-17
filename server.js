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
  const clients = io.sockets.adapter.rooms.get(room) || new Set();
  if (clients.size >= 2) {
    console.log(`❌ Room ${room} already has 2 clients. Rejecting ${socket.id}`);
    socket.emit("room-full", room);
    return;
  }
  socket.join(room);
  console.log(`✅ Client ${socket.id} joined room ${room} (${clients.size + 1}/2)`);
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
