const mongoose = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Role";
const COLLECTION_NAME = "roles";

// Declare the Schema of the Mongo model
var roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, roleSchema);
