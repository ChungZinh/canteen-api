const mongoose = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Wallet";
const COLLECTION_NAME = "wallets";

// Declare the Schema of the Mongo model
var walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, walletSchema);
