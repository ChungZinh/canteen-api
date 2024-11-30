const app = require("./src/app");
const { initializeSocket } = require("./src/socket");

const PORT = process.env.PORT || 3000;

// Tạo server HTTP từ Express app
const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Khởi tạo Socket.IO và liên kết với server HTTP
const io = initializeSocket(server);

// Đảm bảo server đóng đúng cách khi có tín hiệu `SIGINT`
process.on("SIGINT", () => {
  server.close(() => {
    console.log("HTTP server closed");

    // Đóng tất cả kết nối WebSocket
    io.close(() => {
      console.log("Socket.IO server closed");
    });
  });
});
