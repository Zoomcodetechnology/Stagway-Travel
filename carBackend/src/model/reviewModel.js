const mongoose = require('mongoose');

const ReviewModel = new mongoose.Schema(
  {
    rentalCarId: { type: mongoose.Schema.Types.ObjectId, ref: "rentalcars", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    review: { type: String },
    isDeleted:{type:Boolean,default:false}
 },
  { timestamps: true }
);
module.exports = mongoose.model("reviews", ReviewModel);
