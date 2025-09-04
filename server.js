import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("new client", socket.id);

  socket.on("signal", ({ to, data }) => {
    io.to(to).emit("signal", { from: socket.id, data });
  });

  socket.on("register", (number) => {
    socket.join(number);
    socket.number = number;
    console.log(`${number} registered`);
  });

  socket.on("disconnect", () => {
    console.log("client disconnected", socket.number);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("signaling server listening on", PORT);
});

