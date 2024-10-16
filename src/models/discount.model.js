const mongoose = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Discount";
const COLLECTION_NAME = "discounts";

// Declare the Schema of the Mongo model
var discountSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    minOrderValue: {
      type: Number,
      default: 0,
    },
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food", // Giảm giá có thể áp dụng cho những sản phẩm cụ thể
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, discountSchema);
