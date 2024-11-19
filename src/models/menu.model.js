const mongoose = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Menu";
const COLLECTION_NAME = "menus";

// Declare the Schema of the Mongo model
var menuSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
    },
    foods: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, menuSchema);
