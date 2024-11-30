const { Server } = require("socket.io");
let io;

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*", // Cấu hình cho phép truy cập từ các client
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Chef connected with ID:", socket.id);

    socket.on("disconnect", () => {
      console.log("Chef disconnected:", socket.id);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.IO is not initialized!");
  }
  return io;
}

module.exports = { initializeSocket, getIO };
