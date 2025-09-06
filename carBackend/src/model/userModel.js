const mongoose = require('mongoose');
const UserModel =  new mongoose.Schema({
    fullName: {
      type: String,
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
      default: "",
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      default: ""
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    isDeleted: { type: Boolean, default: false },
  }, { timestamps: true });
module.exports = mongoose.model('users', UserModel)
