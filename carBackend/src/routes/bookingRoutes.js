const express = require("express");
const router = express.Router();
const { isAuth } = require("../utils/auth");
const bookingController = require("../controller/bookingController");
const upload = require("../utils/upload"); 
/*-------------------------------------------------****Booking Routes****-----------------------------------------*/

/*.............................Admin Side Booking  Routes ....................................*/
router.post("/updateFareDetails/:rentalCarId",isAuth,bookingController.updateFareDetails );
router.post("/updateBookingStatus/:bookingId",isAuth,bookingController.updateBookingStatus );
router.post("/findById/:bookingId",isAuth,bookingController.findBookingById );
router.post("/remove",isAuth,bookingController.removeBooking );
router.post("/findAll",isAuth,bookingController.getAllBookings );
router.post("/filterBooking",isAuth,bookingController.bookingsListing  );
router.post( "/assignDriver",isAuth,bookingController.assignDriver  );
// upload.fields([{ name: "image"},{ name: "carImage"}]),
/*.............................User Side Booking Process Routes ...............................*/
// Create initial booking
router.post("/create", isAuth, bookingController.createInitialBooking);
// Select car and calculate price
router.post("/select-car", isAuth, bookingController.selectCarAndCalculatePrice);
// Add add-ons to booking
router.post("/add-addons", isAuth, bookingController.addAddonsToBooking);
// Apply promo code to booking
router.post("/apply-promo", isAuth, bookingController.applyPromoToBooking);
//for fetching bookings for User
router.post("/findByUserId",isAuth,bookingController.fetchBookingforUser );
//for booking Cancellation
router.post("/cancelBooking/:bookingId",isAuth,bookingController.cancelBooking  );
module.exports = router;
