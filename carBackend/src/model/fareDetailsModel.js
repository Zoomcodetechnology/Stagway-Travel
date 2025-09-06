const mongoose = require("mongoose");

const FareDetailsModel = new mongoose.Schema(
  {
    fareDetails: {
      inclusions: [{ type: String }],
      exclusions: [{ type: String }], 
      termsAndConditions: { type: String }, 
    },
   
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("fareDetails", FareDetailsModel);
