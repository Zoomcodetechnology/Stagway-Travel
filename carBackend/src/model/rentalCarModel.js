const mongoose = require("mongoose");
const RentalCarModel = new mongoose.Schema(
  {
    image: {
      type: String,
    },
    title: {
      type: String,
      required: true,
    },
    fuelType: {
      type: String,
    },
    cities: { type: [String], required: true },
    bookingType: {
      type: [String],
      required: true,
      enum: ["Local", "Intercity", "Airport Transfer"],
    },
    category: {
      type: String,
    },

    capacity: {
      type: Number,
      default: 1,
    },
    luggage: {
      type: Number,
      default: 0,
    },
    priceHour: {
      type: Number,
      default:0,
    },
    pricePerKm: {
      type: Number,
      default:0,
    },
    flatRate: {
      type: Number,
      default:0,
    },
    fareDetailsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "fareDetails",
      default: "67a5cd5379225999df9c19e5",
    },
    averageRating: {
      type: Number,
      default: 0,
    },    
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("rentalcars", RentalCarModel);
