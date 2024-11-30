const mongoose = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Order";
const COLLECTION_NAME = "orders";

// Declare the Schema of the Mongo model
var orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    customerInfo: {
      type: Object,
    },
    foods: [
      {
        type: Object,
        required: true,
      },
    ],
    amount: {
      type: Number,
      required: true,
    },
    note: {
      type: String,
    },
    payMethod: {
      type: String,
      enum: ["Momo", "ZaloPay", "Ví Sinh Viên"],
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Đã đặt",
        "Đã thanh toán",
        "Đang chuẩn bị",
        "Đã chuẩn bị",
        "Đã hoàn tất",
        "Đã hủy",
      ],
      required: true,
    },
    payMethodResponse: {
      type: Object,
    },
    timeline: [
      {
        status: {
          type: String,
          enum: [
            "Đã đặt",
            "Đã thanh toán",
            "Đang chuẩn bị",
            "Đã chuẩn bị",
            "Đã hoàn tất",
            "Đã hủy",
          ],
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now, // Default to the current timestamp
        },
        note: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, orderSchema);
