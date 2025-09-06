const mongoose = require('mongoose');
const BookingInfoModel =  new mongoose.Schema({
    fullName: {
      type: String,
      required: true,
      default: ""
    },
    number: {
      type: Number,
      required: true,
      default: ""
    },
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    pickUpAddress: {
      type: String,
      required: true,
    },
    dropOffAddress: {
      type: String,
      required: true,
    },
    anyNotes: {
      type: String,
    },
    otp: { type: Number },
    isDeleted: { type: Boolean, default: false },
  }, { timestamps: true });
module.exports = mongoose.model('bookingInfo', BookingInfoModel)
