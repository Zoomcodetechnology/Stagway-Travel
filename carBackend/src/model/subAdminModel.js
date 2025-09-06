const mongoose = require("mongoose");

const SubAdminModel = new mongoose.Schema(
  {
    first_Name: {
      type: String,
      default: "",
    },
    last_Name: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
      unique: true,
      lowercase: true,
    },
    image: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    isAccessUser: {
        type: Boolean,
        default: true
    },
    isAccessState: {
        type: Boolean,
        default: true
    },
    isAccessCategories: {
        type: Boolean,
        default: false
    } ,
    isAccessExams: {
        type: Boolean,
        default: false
    },
    isAccessSubExams: {
        type: Boolean,
        default: false
    } ,
    
 },
  { timestamps: true }
);

module.exports = mongoose.model("subAdmins", SubAdminModel);
