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

// Map a user's permanent pubKey to their temporary socket.id
const userSockets = {};

// Helper to normalize keys
function normKey(k){ return (typeof k === 'string') ? k.replace(/\s+/g,'') : k; }

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Handle client registration
  socket.on("register", (pubKey) => {
    if (!pubKey) return;
    const key = normKey(pubKey);
    userSockets[key] = socket.id;
    socket.data.pubKey = key; // Store key on socket for later cleanup
    console.log(`🔑 Registered: ${key.slice(0,12)}... -> ${socket.id}`);
  });

  // Handle direct connection requests
  socket.on("request-connection", ({ to, from }) => {
    const targetId = userSockets[normKey(to)];
    if (targetId) {
      io.to(targetId).emit("incoming-request", { from: normKey(from) });
      console.log(`📨 Connection request: ${from.slice(0, 12)}... → ${to.slice(0, 12)}...`);
    } else {
      console.log(`⚠️ Could not deliver request to ${to.slice(0,12)} (not registered/online)`);
    }
  });


  // Room and signaling logic remains the same
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
    // Clean up the user mapping on disconnect
    if (socket.data.pubKey) {
      delete userSockets[socket.data.pubKey];
      console.log(`🗑️ Unregistered: ${socket.data.pubKey.slice(0, 12)}...`);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
