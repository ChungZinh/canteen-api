const mongoose = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Permission";
const COLLECTION_NAME = "permissions";

// Declare the Schema of the Mongo model
var permissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    apiKey: {
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
module.exports = mongoose.model(DOCUMENT_NAME, permissionSchema);
