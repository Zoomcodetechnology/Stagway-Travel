const mongoose = require("mongoose");
const BookingModel = new mongoose.Schema(
  {
    pnr: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "users",
      required: true,
    },
    rentalCarId: {
      type: mongoose.Schema.ObjectId,
      ref: "rentalcars",
    },
    bookingType: {
      type: String,
      enum: ["Local", "Intercity", "Airport Transfer"],
      required: true,
    },
    bookingInfoId: {
      type: mongoose.Schema.ObjectId,
      ref: "bookingInfo",
    },
    city: {
      type: String,
      required: function () {
        return this.bookingType === "Local";
      },
    },
    pickUpLocation: {
      type: String,
      required: function () {
        return this.bookingType === "Airport Transfer"
          
      },
    },
    dropOffLocation: {
      type: String,
      required: function () {
        return (
          this.bookingType === "Airport Transfer"
        );
      },
    },
    pickUpCoordinates: {
      type: { lat: Number, lng: Number },
      required: true,
    },
    dropOffCoordinates: {
      type: { lat: Number, lng: Number },
      required: function () {
        return (
          this.bookingType === "Airport Transfer"
        );
      },
    },
    distance: {
      type: Number,
      required: function () {
        return this.bookingType === "Intercity";
      },
    },
    flightNumber: {
      type: String,
      required: function () {
        return this.bookingType === "Airport Transfer";
      },
    },
    discountAmount: {
      type: Number,
    },
    price: {
      type: Number,
      required: true,
    },
    tollTax: {
      type: Number,
      default: 1000,
    },
    gstAmount: {
      type: Number,
      default: 0,
    },
    totalPrice:{
      type:Number,
      default:0
    },
    promoCode: {
      type: mongoose.Schema.ObjectId,
      ref: "promocodes",
      required: false,
    },
    isPromoApplied:{
      type:Boolean,
      default:false
    },
    pickUpDate: {
      type: Date,
      required: true,
    },
    pickUpTime: {
      type: String,
      required: true,
    },
    dropOffDate: {
      type: Date,
      required: function () {
        return this.bookingType === "Local";
      },
    },
    dropOffTime: {
      type: String,
      required: function () {
        return this.bookingType === "Local";
      },
    },
    bookingStatus: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled", "Completed"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
    notes: {
      type: String,
    },
    addons: [
      { addonId: { type: mongoose.Schema.Types.ObjectId, ref: "addons" } },
    ],
    driverDetails: {
      name: { type: String },
      mobileNumber: { type: String },
      image: { type: String },
      carImage: { type: String },
      carNumber: { type: String },
      carName: { type: String },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    multiCityLegs: [{
      pickUpLocation: String,
      dropOffLocation: String,
      pickUpCoordinates: {
        type: { lat: Number, lng: Number },
        required: true,
      },
      dropOffCoordinates: {
        type: { lat: Number, lng: Number },
      },
  }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("bookings", BookingModel);
