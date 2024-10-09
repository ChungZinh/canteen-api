const mongoose = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "DetailFoodForOrder";
const COLLECTION_NAME = "detailFoodForOrders";

// Declare the Schema of the Mongo model
var detailFoodForOrderSchema = new mongoose.Schema(
  {
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, detailFoodForOrderSchema);
