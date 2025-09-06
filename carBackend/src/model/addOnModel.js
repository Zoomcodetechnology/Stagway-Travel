const mongoose = require("mongoose");
const AddOnModel = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
},
{ timestamps: true },
);
module.exports = mongoose.model("addons", AddOnModel);
