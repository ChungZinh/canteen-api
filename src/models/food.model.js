const mongoose = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Food";
const COLLECTION_NAME = "foods";

// Declare the Schema of the Mongo model
var foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    isSoldOut: {
      type: Boolean,
      default: false,
    },
      category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, foodSchema);
