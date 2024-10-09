const mongoose = require("mongoose");
const _SECONDS = 5000;

// Count the number of connections
const countConnections = () => {
  const numConnections = mongoose.connections.length;
  console.log(`Number of connections: ${numConnections}`);
};

// Check over load connections
const checkOverLoadConnections = () => {
  setInterval(() => {
    const numConnections = mongoose.connections.length;
    const numCore = require("os").cpus().length;
    if (numConnections > numCore) {
      console.log("Overload connections");
    }

    const memoryUsage = process.memoryUsage().rss / 1024 / 1024;
    if (memoryUsage > 100) {
      console.log("Memory usage is over 100MB");
    }
  }, _SECONDS);
};

module.exports = {
  countConnections,
  checkOverLoadConnections,
};
