const mongoose = require("mongoose");
const { countConnections } = require("../helpers/check.connect");
const {
  db: { host, port, name },
} = require("../configs/config.mongodb");

const mongoURI = `mongodb://${host}:${port}/${name}`;

class Database {
  constructor() {
    this._connect();
  }

  // Connect to the database

  _connect(type = "mongodb") {
    if (1 === 1) {
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
    }

    mongoose
      .connect(mongoURI)
      .then(() => {
        countConnections();
        console.log(`Database connection successful with ${name}`);
      })
      .catch((err) => {
        console.error("Database connection error");
      });
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new Database();
    }
    return this.instance;
  }
}

const instanceMongoDB = Database.getInstance();
module.exports = instanceMongoDB;
