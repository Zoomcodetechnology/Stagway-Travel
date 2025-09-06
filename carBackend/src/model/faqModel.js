const mongoose = require("mongoose");
const FaqModel = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  answer: {
    type: String,
    required: true,
    trim: true,
  },
  type: [
   { type: String,
    required: true,
    enum: ["Local", "Intercity", "Airport Transfer"],}
  ],
  isDeleted: {
    type: Boolean,
    default: false, 
  },
});
module.exports = mongoose.model("faqs", FaqModel);
