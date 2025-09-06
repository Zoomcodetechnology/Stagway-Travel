const BookingModel = require("../model/bookingModel");
const RentalCarModel = require("../model/rentalCarModel");
const AddOnModel = require("../model/addOnModel");
const PromoCodeModel = require("../model/promoCodeModel");
const Helper = require("../utils/helper");
const axios = require("axios");
const crypto = require("crypto");
const moment = require("moment");
const { sendEmail } = require("./mailController");
require("dotenv").config();
//........................................ Helper Functions ..........................................//
// Function to calculate distance and price
  const calculateDistanceAndPrice = async (
    pickUpCoordinates,
    dropOffCoordinates
  ) => {
    try {
      const { lat: pickupLat, lng: pickupLng } = pickUpCoordinates;
      const { lat: dropoffLat, lng: dropoffLng } = dropOffCoordinates;
      // const url = `http://router.project-osrm.org/route/v1/driving/${pickupLng},${pickupLat};${dropoffLng},${dropoffLat}?overview=false`;
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${pickupLat},${pickupLng}&destinations=${dropoffLat},${dropoffLng}&key=${process.env.GOOGLE_API_KEY}`;
      const response = await axios.get(url);
      const distanceInMeters =
        response.data.rows[0]?.elements[0]?.distance?.value;
      if (!distanceInMeters) {
        throw new Error("Unable to calculate distance, no valid route found.");
      }
      if (response.data.status !== "OK") {
        throw new Error("Google API error: " + response.data.error_message);
      }
   
      const distanceInKm = distanceInMeters / 10000;

      return { distance: distanceInKm * 2 }; //for return price
    } catch (error) {
      console.error(
        "Error calculating distance and price:",
        error.message || error
      );
      throw new Error("Distance calculation failed using Distance Matrix API.");
    }
  };
// Helper function for Local bookings
const calculateLocalPrice = (pickUpDateTime, dropOffDateTime, pricePerHour) => {
  if (!moment(pickUpDateTime).isValid() || !moment(dropOffDateTime).isValid()) {
    throw new Error("Invalid date format");
  }
  if (moment(dropOffDateTime).isSameOrBefore(moment(pickUpDateTime))) {
    throw new Error("Drop-off time must be later than pick-up time");
  }
  const diffMinutes = moment(dropOffDateTime).diff(
    moment(pickUpDateTime),
    "minutes"
  );
  let totalHours = Math.floor(diffMinutes / 60);
  const extraMinutes = diffMinutes % 60;

  if (extraMinutes > 20) {
    totalHours += 1;
  }

  let totalPrice = 0;
  let remainingHours = totalHours;
  const maxHourlyCharge = 13;

  while (remainingHours > 0) {
    if (remainingHours >= 24) {
      totalPrice += maxHourlyCharge * pricePerHour;
      remainingHours -= 24;
    } else if (remainingHours > maxHourlyCharge) {
      totalPrice += maxHourlyCharge * pricePerHour;
      remainingHours = 0;
    } else {
      totalPrice += remainingHours * pricePerHour;
      remainingHours = 0;
    }
  }

  return totalPrice;
};
//Helper function for generating unique PNR number
const generateCustomPNR = async (userId, bookingType) => {
  const typeCode =
    {
      Local: "LOC",
      Intercity: "INT",
      "Airport Transfer": "AIR",
    }[bookingType] || "UNK";
  let isUnique = false;
  let pnr = "";

  while (!isUnique) {
    const randomCode = crypto.randomBytes(2).toString("hex").toUpperCase();
    const shortenedUserId = userId.slice(-6);
    pnr = `${typeCode}${shortenedUserId}-${randomCode}`;

    // Check uniqueness in the database
    const existingBooking = await BookingModel.findOne({ pnr });
    if (!existingBooking) {
      isUnique = true; // Ensure PNR is unique
    }
  }

  return pnr;
};
//helper Function  Applying Promo Code
async function applyPromoCode(price, promoCode) {
  const discountAmount = (price * promoCode.discount) / 100;
  const discountedPrice = price - discountAmount;
  return { discountedPrice, discountAmount };
}
//.................................................... Admin functions ...........................................//
//for updating the booking status
const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { bookingStatus } = req.body;

    if (!bookingId) return Helper.fail(res, "bookingId is required!");
    if (!bookingStatus) return Helper.fail(res, "bookingStatus is required!");

    const validBookingStatus = [
      "Pending",
      "Confirmed",
      "Cancelled",
      "Completed",
    ];
    if (!validBookingStatus.includes(bookingStatus)) {
      return Helper.fail(res, "Invalid status!");
    }

    const updatedBooking = await BookingModel.findByIdAndUpdate(
      bookingId,
      { bookingStatus: bookingStatus },
      { new: true }
    );

    if (!updatedBooking) return Helper.fail(res, "Failed to update booking!");

    return Helper.success(
      res,
      "Booking bookingStatus updated successfully!",
      updatedBooking
    );
  } catch (error) {
    console.error("Error updating booking bookingStatus:", error);
    return Helper.fail(res, error.message);
  }
};
//for updating the renatlCar FareDetails at the time of Booking //not for current use
const updateFareDetails = async (req, res) => {
  try {
    const { rentalCarId } = req.params;
    const { fareDetails } = req.body;
    if (!rentalCarId) return Helper.fail(res, "rentalCarId is required!");
    if (!fareDetails) return Helper.fail(res, "fareDetails is required!");
    const updatedRentalCarDetails = await RentalCarModel.findByIdAndUpdate(
      rentalCarId,
      { fareDetails },
      { new: true }
    );

    if (!updatedRentalCarDetails)
      return Helper.fail(res, "Failed to update booking!");

    return Helper.success(
      res,
      "Booking bookingStatus updated successfully!",
      updatedRentalCarDetails
    );
  } catch (error) {
    console.error("Error updating booking bookingStatus:", error);
    return Helper.fail(res, error.message);
  }
};
// for get Booking by Booking Id
const findBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    if (!bookingId) return Helper.fail(res, "bookingId is required!");
    const booking = await BookingModel.findOne({
      _id: bookingId,
      isDeleted: false,
    })
      .populate("rentalCarId")
      .populate({
        path: "bookingInfoId",
        model: "bookingInfo",
      })
      .populate("userId")
      .populate({
        path: "addons.addonId",
        model: "addons",
      });
    if (!booking || booking.length === 0)
      return Helper.fail(res, "No booking found ");
    return Helper.success(res, "booking fetched successfully", booking);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "Failed to fetch booking");
  }
};
// for soft delete booking
const removeBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return Helper.fail(res, "bookingId is required!");
    let b = { _id: bookingId };
    let deleted = await BookingModel.findOneAndUpdate(
      b,
      { isDeleted: true },
      { new: true }
    );
    if (!deleted) {
      return Helper.fail(res, "No Booking found!");
    }
    return Helper.success(res, " Booking  deleted successfully", deleted);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "Failed to Delete Booking");
  }
};
// for getting All Bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await BookingModel.find({
      isDeleted: false,
    })
      .populate("rentalCarId")
      .populate("userId")
      .populate("bookingInfoId")
      .sort({ _id: -1 }); 

    if (!bookings || bookings.length === 0) 
      return Helper.fail(res, "Bookings not found");
      
    return Helper.success(res, "Bookings found", bookings);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, "Failed to fetch bookings");
  }
};
// for filter Bookings
// const filterBookings = async (req, res) => {
//   try {
//     const { bookingStatus, bookingType } = req.query;
//     let matchStage = { isDeleted: false };
//     if (bookingStatus) matchStage.bookingStatus = bookingStatus;
//     if (bookingType) matchStage.bookingType = bookingType;
//     const pipeline = [
//       { $match: matchStage },
//       {
//         $lookup: {
//           from: "users",
//           localField: "userId",
//           foreignField: "_id",
//           as: "userDetails",
//         },
//       },
//       {
//         $lookup: {
//           from: "rentalcars",
//           localField: "rentalCarId",
//           foreignField: "_id",
//           as: "rentalCarDetails",
//         },
//       },
//       {
//         $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true },
//       },
//       {
//         $unwind: {
//           path: "$rentalCarDetails",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $lookup: {
//           from: "categories", // Assuming the category collection name is 'categories'
//           localField: "rentalCarDetails.categoryId",
//           foreignField: "_id",
//           as: "categoryDetails",
//         },
//       },
//       {
//         $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true },
//       },
//       {
//         $project: {
//           bookingType: 1,
//           price: 1,
//           pickUpDate: 1,
//           pickUpTime: 1,
//           title: 1,
//           bookingStatus: 1,
//           paymentStatus: 1,
//           notes: 1,
//           isDeleted: 1,
//           "categoryDetails.categoryName": 1,
//           "userDetails.number": 1,
//           rentalCarDetails: 1,
//         },
//       },
//     ];
//     const booking = await BookingModel.aggregate(pipeline);
//     if (!booking.length)
//       Helper.fail(res, "No booking Found With this given Filter");
//     return Helper.success(res, "booking Found Successfully", booking);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "something went wrong!" });
//   }
// };
const bookingsListing = async (req, res) => {
  try {
    const { bookingStatus, bookingType, page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    let matchStage = { isDeleted: false };
    if (bookingStatus) matchStage.bookingStatus = bookingStatus;
    if (bookingType) matchStage.bookingType = bookingType;
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $lookup: {
          from: "rentalcars",
          localField: "rentalCarId",
          foreignField: "_id",
          as: "rentalCarDetails",
        },
      },
      {
        $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: {
          path: "$rentalCarDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "categories", 
          localField: "rentalCarDetails.categoryId",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      {
        $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          bookingType: 1,
          price: 1,
          pickUpDate: 1,
          pickUpTime: 1,
          title: 1,
          bookingStatus: 1,
          paymentStatus: 1,
          notes: 1,
          isDeleted: 1,
          "categoryDetails.categoryName": 1,
          "userDetails.number": 1,
          rentalCarDetails: 1,
        },
      },
      { $sort: { _id: -1 } },
      { $skip: (pageNumber - 1) * pageSize },
      { $limit: pageSize },
    ];
    const booking = await BookingModel.aggregate(pipeline);
    if (!booking.length)
      return Helper.fail(res, "No booking Found With this given Filter");
    const totalBookings = await BookingModel.countDocuments(matchStage);
    return Helper.success(res, "Booking Found Successfully", {
      bookings: booking,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalBookings / pageSize),
      totalBookings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong!" });
  }
};
//for assigning the driver
const assignDriver = async (req, res) => {
  try {
    const { bookingId, driverDetails } = req.body;
    if (!driverDetails || !driverDetails.name || !driverDetails.mobileNumber || !driverDetails.carNumber || !driverDetails.carName) {
      return Helper.fail(res, "Driver details (name, mobile number, car number, car name) are required!");
    }
    if (!bookingId) {
      return Helper.fail(res, "Booking ID is required!");
    }
    const booking = await BookingModel.findById(bookingId).populate('userId', 'email');
    if (!booking) {
      return Helper.fail(res, "Booking not found!");
    }
    booking.driverDetails = {
      name: driverDetails.name,
      mobileNumber: driverDetails.mobileNumber,
      image: driverDetails.image,
      carNumber: driverDetails.carNumber,
      carImage: driverDetails.carImage, 
      carName: driverDetails.carName,
    };
    const updatedBooking = await booking.save();
    const email = booking.userId.email;
    const driverCarDetails = {
      name: driverDetails.name,
      mobileNumber: driverDetails.mobileNumber,
      carNumber: driverDetails.carNumber,
      carName: driverDetails.carName,
      image: driverDetails.image,
      carImage: driverDetails.carImage,
    };
    await sendEmail(email, 'Driver Assigned', 'driverTemplate', driverCarDetails);

    return Helper.success(res, "Driver assigned successfully!", updatedBooking);
  } catch (error) {
    console.error("Error assigning driver:", error);
    return Helper.fail(res, error.message);
  }
};

//.................................................... User Booking process .....................................//
//for initiating the Booking
const createInitialBooking = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      bookingType,
      city,
      pickUpLocation,
      dropOffLocation,
      pickUpCoordinates,
      dropOffCoordinates,
      pickUpDate,
      pickUpTime,
      dropOffDate,
      dropOffTime,
      flightNumber,
      multiCityLegs,
    } = req.body;
    if (!userId) return Helper.fail(res, "userId is required!");
    if (!bookingType) return Helper.fail(res, "bookingType is required!");
    if (bookingType) {
      if (!pickUpDate || !pickUpTime) {
        return Helper.fail(res, "Please Fill All fields");
      }
    }
    if (bookingType == "Local") {
      if (!city || !dropOffDate || !dropOffTime) {
        return Helper.fail(res, "Please Fill All fields");
      }
    } else if (bookingType == "Intercity") {
      // if(multiCityLegs.length<=0){
      //   if (!pickUpLocation || !dropOffLocation) {
      //     return Helper.fail(res, "Please Fill All fields");
      //   }
      // }
      
    } else if (bookingType == "Airport Transfer") {
      if (!pickUpLocation || !dropOffLocation || !flightNumber) {
        return Helper.fail(res, "Please Fill All fields");
      }
    }
    const pickUpDateOnly = new Date(pickUpDate);
    if (isNaN(pickUpDateOnly)) return Helper.fail(res, "Invalid pick-up date.");
    let dropOffDateOnly = null;
    if (dropOffDate) {
      dropOffDateOnly = new Date(dropOffDate);
      if (isNaN(dropOffDateOnly)) {
        return Helper.fail(res, "Invalid drop-off date.");
      }
      if (pickUpDateOnly > dropOffDateOnly) {
        return Helper.fail(res, "Drop-off date must be after pick-up date.");
      }
    }
    if (dropOffDate && pickUpTime && dropOffTime) {
      let pickUpDateTime = new Date(`${pickUpDate}T${pickUpTime}`);
      let dropOffDateTime = new Date(`${dropOffDate}T${dropOffTime}`);
      const minGap = 60 * 60 * 1000;
      if (dropOffDateTime - pickUpDateTime < minGap) {
        return Helper.fail(
          res,
          "Drop-off time must be at least 1 hour after pick-up time."
        );
      }

      if (pickUpDateTime >= dropOffDateTime) {
        return Helper.fail(res, "Drop-off time must be after pick-up time.");
      }
    }
    const pickUpTimeFormatted = pickUpTime ? String(pickUpTime) : null;
    const dropOffTimeFormatted = dropOffTime ? String(dropOffTime) : null;
    const pnr = await generateCustomPNR(userId, bookingType);
    const bookingData = {
      pnr,
      userId,
      bookingType,
      city,
      pickUpLocation,
      dropOffLocation,
      pickUpCoordinates,
      dropOffCoordinates,
      pickUpDate: pickUpDateOnly,
      pickUpTime: pickUpTimeFormatted,
      dropOffDate: dropOffDateOnly,
      dropOffTime: dropOffTimeFormatted,
      flightNumber,
      bookingStatus: "Pending",
      paymentStatus: "Pending",
      distance: 0,
      price: 0,
      tollTax: 1000,
      gstAmount: 0,
    };

    if (
      bookingType === "Intercity" &&
      Array.isArray(multiCityLegs) &&
      multiCityLegs.length > 0
    ) {
      bookingData.multiCityLegs = multiCityLegs;
    }
    const booking = await BookingModel.create(bookingData);

    return Helper.success(res, "Initial booking created!", booking);
  } catch (error) {
    return Helper.fail(res, error.message);
  }
};
//for Car Selection And recalculation Of Price and distance
const selectCarAndCalculatePrice = async (req, res) => {
  try {
    const { bookingId, rentalCarId } = req.body;
    if (!bookingId || !rentalCarId)
      return Helper.fail(res, "Booking ID and Car ID are required!");
    const booking = await BookingModel.findById(bookingId);
    if (!booking) return Helper.fail(res, "Booking not found!");
    const rentalCar = await RentalCarModel.findById(rentalCarId);
    if (!rentalCar) return Helper.fail(res, "Car not found!");
    let pickUpDateTime = moment(
      `${moment(booking.pickUpDate).format("YYYY-MM-DD")} ${
        booking.pickUpTime
      }`,
      "YYYY-MM-DD HH:mm:ss"
    );
    let dropOffDateTime = moment(
      `${moment(booking.dropOffDate).format("YYYY-MM-DD")} ${
        booking.dropOffTime
      }`,
      "YYYY-MM-DD HH:mm:ss"
    );
    // // Global check - Agar car already booked hai (for all types)
    // if (!rentalCar.isAvailable) {
    //   return Helper.fail(
    //     res,
    //     "This car is already booked. Please choose another car."
    //   );
    // }
    // //for car availability within duration for local only 
    // const existingBookings = await BookingModel.find(
    //   {
    //     // bookingType: booking.bookingType,
    //     rentalCarId: rentalCarId,
    //     isDeleted: false,
    //     _id: { $ne: bookingId },
    //   },
    //   { pickUpDate: 1, pickUpTime: 1, dropOffDate: 1, dropOffTime: 1, _id: 0 }
    // );
    // // Overlapping check
    // let isOverlapping = false;
    // for (const b of existingBookings) {
    //   const existingPickUpDateTime = moment(
    //     `${moment(b.pickUpDate).format("YYYY-MM-DD")} ${b.pickUpTime}`,
    //     "YYYY-MM-DD HH:mm:ss"
    //   );
    //   const existingDropOffDateTime = moment(
    //     `${moment(b.dropOffDate).format("YYYY-MM-DD")} ${b.dropOffTime}`,
    //     "YYYY-MM-DD HH:mm:ss"
    //   );

    //   if (
    //     pickUpDateTime.isBetween(
    //       existingPickUpDateTime,
    //       existingDropOffDateTime,
    //       null,
    //       "[)"
    //     ) ||
    //     dropOffDateTime.isBetween(
    //       existingPickUpDateTime,
    //       existingDropOffDateTime,
    //       null,
    //       "[)"
    //     ) ||
    //     existingPickUpDateTime.isBetween(
    //       pickUpDateTime,
    //       dropOffDateTime,
    //       null,
    //       "[)"
    //     )
    //   ) {
    //     isOverlapping = true;
    //     break;
    //   }
    // }
    // if (isOverlapping) {
    //   return Helper.fail(
    //     res,
    //     "This car is already booked for the selected time range. Please choose another car."
    //   );
    // }
    let price = 0,
      distance = 0;
    if (booking.bookingType === "Local") {
      price = calculateLocalPrice(
        pickUpDateTime.format(),
        dropOffDateTime.format(),
        rentalCar.priceHour
      );
    } else if (booking.bookingType === "Intercity") {
      if (booking.multiCityLegs?.length > 0) {
        for (const leg of booking.multiCityLegs) {
          const result = await calculateDistanceAndPrice(
            leg.pickUpCoordinates,
            leg.dropOffCoordinates
          );
          
          distance += result.distance;
        }
        const chargeableKm = Math.max(distance, 300); // Ensure at least 300 km is charged
        price = chargeableKm * rentalCar.pricePerKm;
      }//here to make changes
       else {
        const result = await calculateDistanceAndPrice(
          booking.pickUpCoordinates,
          booking.dropOffCoordinates
        );
        distance = result.distance;
        price = distance * rentalCar.pricePerKm;
      }
      rentalCar.isAvailable = false;
      await rentalCar.save();
    } else if (booking.bookingType === "Airport Transfer") {
      price = rentalCar.flatRate;
      // rentalCar.isAvailable = false;
      await rentalCar.save();
    }
    booking.rentalCarId = rentalCarId;
    booking.price = price;
    booking.distance = distance;
    let totalPrice = price + booking.tollTax;
    let gstAmount = (totalPrice * 13) / 100;
    totalPrice = totalPrice + gstAmount;
    booking.gstAmount = gstAmount;
    booking.totalPrice = totalPrice;
    await booking.save();
    return Helper.success(res, "Car selected and price calculated!", booking);
  } catch (error) {
    return Helper.fail(res, error.message);
  }
};
//for adding Addons To Booking
const addAddonsToBooking = async (req, res) => {
  try {
    const { bookingId, selectedAddons } = req.body;
    const booking = await BookingModel.findById(bookingId);
    if (!booking) return Helper.fail(res, "Booking not found!");
    const existingAddonIds = booking.addons
      ? booking.addons.map((addon) => addon.addonId.toString())
      : [];
    const newAddonIds = selectedAddons
      ? selectedAddons.map((id) => id.toString())
      : [];
    const addedAddonIds = newAddonIds.filter(
      (id) => !existingAddonIds.includes(id)
    );
    const removedAddonIds = existingAddonIds.filter(
      (id) => !newAddonIds.includes(id)
    );
    const addedAddons = addedAddonIds.length
      ? await AddOnModel.find({ _id: { $in: addedAddonIds } })
      : [];
    const removedAddons = removedAddonIds.length
      ? await AddOnModel.find({ _id: { $in: removedAddonIds } })
      : [];
    const addedPrice = addedAddons.reduce(
      (total, addon) => total + addon.price,
      0
    );
    const removedPrice = removedAddons.reduce(
      (total, addon) => total + addon.price,
      0
    );
    booking.totalPrice += addedPrice - removedPrice;
    booking.addons = newAddonIds.length
      ? newAddonIds.map((addonId) => ({ addonId }))
      : [];
    await booking.save();
    return Helper.success(res, "Add-ons added successfully!", booking);
  } catch (error) {
    return Helper.fail(res, error.message);
  }
};
//for Aopplying PromoCode To Booking
const applyPromoToBooking = async (req, res) => {
  try {
    const { bookingId, promoCode } = req.body;
    const booking = await BookingModel.findById(bookingId);
    if (!booking) return Helper.fail(res, "Booking not found!");

    const validPromoCode = await PromoCodeModel.findOne({
      code: promoCode,
      isActive: true,
      isDeleted: false,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    });

    if (!validPromoCode)
      return Helper.fail(res, "Invalid or expired promo code.");

    const { discountedPrice, discountAmount } = await applyPromoCode(
      booking.totalPrice,
      validPromoCode
    );

    booking.promoCode = validPromoCode._id;
    booking.discountAmount = discountAmount;
    booking.totalPrice = discountedPrice;
    booking.isPromoApplied = true;
    await booking.save();

    return Helper.success(
      res,
      `Promo code Applied ! You Saved  ₹ ${Math.ceil(discountAmount)}`,
      booking
    );
  } catch (error) {
    return Helper.fail(res, error.message);
  }
};
//for cancel boooking
const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    if (!bookingId) return Helper.fail(res, "bookingId is required!");
    const updatedBooking = await BookingModel.findByIdAndUpdate(
      bookingId,
      { bookingStatus: "Cancelled" },
      { new: true }
    );

    if (!updatedBooking) return Helper.fail(res, "Failed to Cancel booking  !");
    return Helper.success(
      res,
      "Booking Cancelled successfully!",
      updatedBooking
    );
  } catch (error) {
    console.error("Error in  booking cancelling:", error);
    return Helper.fail(res, error.message);
  }
};
// for get UserBooking by user Id
const fetchBookingforUser = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return Helper.fail(res, "userId is required!");
    const bookings = await BookingModel.find({
      userId,
      bookingStatus: { $nin: ["Cancelled"] },
      isDeleted: false,
     
    }) .sort({ createdAt: -1 }) 
      .populate({
        path: "rentalCarId",
        select: "title category  image",
      })
      .populate({
        path: "addons.addonId",
        select: "name price ",
      });

    if (!bookings || bookings.length === 0)
      return Helper.fail(res, "No bookings found !");

    return Helper.success(res, "bookings fetched successfully", bookings);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "Failed to fetch bookings");
  }
};
module.exports = {
  updateBookingStatus,
  fetchBookingforUser,
  findBookingById,
  removeBooking,
  getAllBookings,
  bookingsListing,
  cancelBooking,
  calculateDistanceAndPrice,
  updateFareDetails,
  assignDriver,
  createInitialBooking,
  selectCarAndCalculatePrice,
  addAddonsToBooking,
  applyPromoToBooking,
};

//for tentative dropOffDateTime
// const selectCarAndCalculatePrice = async (req, res) => {
//   try {
//     const { bookingId, rentalCarId } = req.body;
//     if (!bookingId || !rentalCarId)
//       return Helper.fail(res, "Booking ID and Car ID are required!");

//     const booking = await BookingModel.findById(bookingId);
//     if (!booking) return Helper.fail(res, "Booking not found!");

//     const rentalCar = await RentalCarModel.findById(rentalCarId);
//     if (!rentalCar) return Helper.fail(res, "Car not found!");

//     let pickUpDateTime = moment(
//       `${moment(booking.pickUpDate).format("YYYY-MM-DD")} ${booking.pickUpTime}`,
//       "YYYY-MM-DD HH:mm:ss"
//     );

//     let dropOffDateTime;

//     if (booking.bookingType === "Local") {
//       // Local mein pickup aur drop dono required
//       if (!booking.dropOffDate || !booking.dropOffTime) {
//         return Helper.fail(res, "Drop off date and time are required for local booking.");
//       }

//       dropOffDateTime = moment(
//         `${moment(booking.dropOffDate).format("YYYY-MM-DD")} ${booking.dropOffTime}`,
//         "YYYY-MM-DD HH:mm:ss"
//       );
//     } else if (booking.bookingType === "Intercity") {
//       // Intercity ke liye tentative duration set karo (example: 48 hours)
//       dropOffDateTime = pickUpDateTime.clone().add(48, 'hours');
//       booking.tentativeDropOffDateTime = dropOffDateTime.format("YYYY-MM-DD HH:mm:ss");
//     } else if (booking.bookingType === "Airport Transfer") {
//       // Airport transfer ke liye fixed 6 hours block
//       dropOffDateTime = pickUpDateTime.clone().add(6, 'hours');
//       booking.tentativeDropOffDateTime = dropOffDateTime.format("YYYY-MM-DD HH:mm:ss");
//     }

//     // Existing bookings fetch karo
//     const existingBookings = await BookingModel.find(
//       {
//         rentalCarId: rentalCarId,
//         isDeleted: false,
//         _id: { $ne: bookingId } // apni booking ko exclude karte hain
//       },
//       { pickUpDate: 1, pickUpTime: 1, dropOffDate: 1, dropOffTime: 1, tentativeDropOffDateTime: 1, _id: 0 }
//     );

//     // Overlapping check with tentative drop off logic
//     let isOverlapping = false;

//     for (const b of existingBookings) {
//       const existingPickUpDateTime = moment(
//         `${moment(b.pickUpDate).format("YYYY-MM-DD")} ${b.pickUpTime}`,
//         "YYYY-MM-DD HH:mm:ss"
//       );

//       // DropOff DateTime ko handle karo (tentative ya actual)
//       const existingDropOffDateTime = b.tentativeDropOffDateTime
//         ? moment(b.tentativeDropOffDateTime, "YYYY-MM-DD HH:mm:ss")
//         : moment(`${moment(b.dropOffDate).format("YYYY-MM-DD")} ${b.dropOffTime}`, "YYYY-MM-DD HH:mm:ss");

//       if (
//         (pickUpDateTime.isBetween(existingPickUpDateTime, existingDropOffDateTime, null, "[)")) ||
//         (dropOffDateTime.isBetween(existingPickUpDateTime, existingDropOffDateTime, null, "[)")) ||
//         (existingPickUpDateTime.isBetween(pickUpDateTime, dropOffDateTime, null, "[)"))
//       ) {
//         isOverlapping = true;
//         break;
//       }
//     }

//     if (isOverlapping) {
//       return Helper.fail(res, "This car is already booked for the selected time range. Please choose another car.");
//     }

//     // Price Calculation
//     let price = 0, distance = 0;

//     if (booking.bookingType === "Local") {
//       price = calculateLocalPrice(
//         pickUpDateTime.format(),
//         dropOffDateTime.format(),
//         rentalCar.priceHour
//       );
//     } else if (booking.bookingType === "Intercity") {
//       const { distance: calculatedDistance, price: calculatedPrice } =
//         await calculateDistanceAndPrice(
//           booking.pickUpCoordinates,
//           booking.dropOffCoordinates,
//           rentalCar.pricePerKm
//         );
//       distance = calculatedDistance;
//       price = calculatedPrice;
//     } else if (booking.bookingType === "Airport Transfer") {
//       price = rentalCar.flatRate;
//     }

//     booking.rentalCarId = rentalCarId;
//     booking.price = price;
//     booking.distance = distance;

//     let totalPrice = price + booking.tollTax;
//     let gstAmount = (totalPrice * 13) / 100;
//     totalPrice = totalPrice + gstAmount;

//     booking.gstAmount = gstAmount;
//     booking.totalPrice = totalPrice;

//     await booking.save();

//     return Helper.success(res, "Car selected and price calculated!", booking);

//   } catch (error) {
//     return Helper.fail(res, error.message);
//   }
// };
