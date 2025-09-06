const mongoose = require("mongoose");
const PromoCodeModel = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  discount: {
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
  isActive: { type: Boolean, default: true }, 
  isDeleted: { type: Boolean, default: false },
});
module.exports = mongoose.model('promocodes', PromoCodeModel)

