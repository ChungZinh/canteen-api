const e = require("express");
const mongoose = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Transaction";
const COLLECTION_NAME = "transactions";

// Declare the Schema of the Mongo model
var transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    transactionType: {
      type: String,
      enum: ['deposit', 'withdraw', 'transfer', 'payment'],
      required: true,
    },
    transactionStatus: {
      type: String,
      enum: ["Dang xu ly", "Thanh cong", "That bai"],
      default: "Dang xu ly",
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, transactionSchema);
