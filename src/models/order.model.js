const mongoose = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Order";
const COLLECTION_NAME = "orders";

// Declare the Schema of the Mongo model
var orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    foods: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DetailFoodForOrder",
        required: true,
      },
    ],
    quantity: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    payMethod: {
      type: String,
      enum: ["Cash", "Credit Card"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Preparing", "Completed", "Cancelled"],
      required: true,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, orderSchema);
