const RentalCarModel = require("../model/rentalCarModel");
const BookingModel = require("../model/bookingModel");
const Helper = require("../utils/helper");
const axios = require("axios");
const moment = require("moment");
//........................................ Helper Functions ..........................................//
// Function to calculate distance and price
// const calculateDistanceAndPrice = async (
//   pickUpCoordinates,
//   dropOffCoordinates,
//   pricePerKm
// ) => {
//   try {
//     if (isNaN(pricePerKm) || pricePerKm <= 0) {
//       throw new Error("Invalid price per kilometer.");
//     }
//     const { lat: pickupLat, lng: pickupLng } = pickUpCoordinates;
//     const { lat: dropoffLat, lng: dropoffLng } = dropOffCoordinates;

//     console.log(pickUpCoordinates +' '+ dropOffCoordinates);

//     const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${pickupLat},${pickupLng}&destinations=${dropoffLat},${dropoffLng}&key=${process.env.GOOGLE_API_KEY}`;
//     const response = await axios.get(url);
//     const distanceInMeters =
//       response.data.rows[0]?.elements[0]?.distance?.value;
//     if (!distanceInMeters) {
//       throw new Error("Unable to calculate distance, no valid route found.");
//     }
//     if (response.data.status !== "OK") {
//       throw new Error("Google API error: " + response.data.error_message);
//     }

//     const distanceInKm = distanceInMeters / 1000;
//     const price = distanceInKm * pricePerKm;
//     if (isNaN(price) || price <= 0) {
//       throw new Error("Calculated price is invalid.");
//     }
//     return { distance: distanceInKm*2, price };//for return car 
//   } catch (error) {
//     console.error(
//       "Error calculating distance and price:",
//       error.message || error
//     );
//     throw new Error("Distance calculation failed using Distance Matrix API.");
//   }
// };
const calculateDistanceAndPrice = async (pickUpCoordinates, dropOffCoordinates, pricePerKm) => {
  try {
    if (isNaN(pricePerKm) || pricePerKm <= 0) {
      throw new Error("Distance calculation failed using Distance Matrix API.");
    }
    const { lat: pickupLat, lng: pickupLng } = pickUpCoordinates;
    const { lat: dropoffLat, lng: dropoffLng } = dropOffCoordinates;
    if (!pickupLat || !pickupLng || !dropoffLat || !dropoffLng) {
      throw new Error("Distance calculation failed using Distance Matrix API.");
    }
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${pickupLat},${pickupLng}&destinations=${dropoffLat},${dropoffLng}&key=${process.env.GOOGLE_API_KEY}`;
    const response = await axios.get(url);
    if (response.data.status !== "OK" || !response.data.rows[0]?.elements[0]?.distance) {
      throw new Error("Distance calculation failed using Distance Matrix API.");
    }
    const distanceInMeters = response.data.rows[0].elements[0].distance.value;
    const distanceInKm = distanceInMeters / 1000;
    const price = distanceInKm * pricePerKm;
    if (isNaN(price) || price <= 0) {
      throw new Error("Distance calculation failed using Distance Matrix API.");
    }
    return { distance: distanceInKm * 2, price }; 
  } catch (error) {
    console.error("Error calculating distance and price:", error.message || error);
    return { distance: 0, price: 0 };
  }
};

//for checking
// const calculateDistanceAndPrice = async (pickUpCoordinates, dropOffCoordinates, pricePerKm) => {
//   try {
//     if (isNaN(pricePerKm) || pricePerKm <= 0) {
//       throw new Error("Invalid price per kilometer.");
//     }

//     console.log("Pickup Coordinates:", pickUpCoordinates);
//     console.log("Dropoff Coordinates:", dropOffCoordinates);

//     const { lat: pickupLat, lng: pickupLng } = pickUpCoordinates;
//     const { lat: dropoffLat, lng: dropoffLng } = dropOffCoordinates;

//     const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${pickupLat},${pickupLng}&destinations=${dropoffLat},${dropoffLng}&mode=driving&key=${process.env.GOOGLE_API_KEY}`;

//     console.log("Google Distance Matrix URL:", url);

//     const response = await axios.get(url);

//     console.log("Google API Response:", response.data);

//     if (response.data.status !== "OK") {
//       throw new Error("Google API error: " + (response.data.error_message || "Unknown error"));
//     }

//     const distanceInMeters = response.data.rows[0]?.elements[0]?.distance?.value;

//     if (!distanceInMeters) {
//       throw new Error("Unable to calculate distance, no valid route found.");
//     }

//     const distanceInKm = distanceInMeters / 1000;
//     const price = distanceInKm * pricePerKm;

//     if (isNaN(price) || price <= 0) {
//       throw new Error("Calculated price is invalid.");
//     }

//     return { distance: distanceInKm * 2, price }; // For return car (round trip)
//   } catch (error) {
//     console.error("Error calculating distance and price:", error.message || error);
//     throw new Error("Distance calculation failed using Distance Matrix API.");
//   }
// };

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
  let totalHours = diffMinutes;
  const extraMinutes = diffMinutes % 60;

  if (extraMinutes > 20) {
    totalHours += 1;
  }

  let totalPrice = 0;
  let remainingHours = totalHours;
  const maxHourlyCharge = 23;

  while (remainingHours > 0) {
    if (remainingHours >= 24) {
      totalPrice += maxHourlyCharge * pricePerHour;
      remainingHours -= 24;
    } else if (remainingHours < maxHourlyCharge) {
      totalPrice += maxHourlyCharge * pricePerHour;
      remainingHours = 0;
    } else {
      totalPrice += remainingHours * pricePerHour;
      remainingHours = 0;
    }
  }

  return totalPrice;
};
//........................................ Admin Functions ..........................................//
// Create a new rental car
const createRentalCar = async (req, res) => {
  try {
    const {
      title,
      fuelType,
      category,
      capacity,
      luggage,
      priceHour,
      pricePerKm,
      flatRate,
      fareDetailsId,
      isAvailable,
      isActive,
      // bookingType,
      // cities
    } = req.body;

    let bookingType, cities;
    try {
      bookingType = JSON.parse(req.body.bookingType);
      cities = JSON.parse(req.body.cities);
    } catch (error) {
      return Helper.fail(res, "Invalid data format for bookingType or cities");
    }

    const image = req.file ? req.file.path : null;

    if (!title) return Helper.fail(res, "Title is required!");
    if (!fuelType) return Helper.fail(res, "fuelType is required!");
    if (!bookingType?.length)
      return Helper.fail(res, "bookingType is required!");
    if (!cities?.length) return Helper.fail(res, "cities are required!");

    const rentalCarObj = {
      image,
      title,
      fuelType,
      bookingType,
      cities,
      category,
      capacity,
      luggage,
      priceHour,
      pricePerKm,
      flatRate,
      fareDetailsId,
      isAvailable,
      isActive,
    };

    const createdRentalCar = await RentalCarModel.create(rentalCarObj);
    return Helper.success(
      res,
      "Rental car created successfully!",
      createdRentalCar
    );
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};

// Find rental car by ID
const findRentalCarById = async (req, res) => {
  try {
    const { rentalCarId } = req.params;
    if (!rentalCarId) return Helper.fail(res, "Rental car ID is required!");
    const rentalCar = await RentalCarModel.findOne({
      _id: rentalCarId,
      isDeleted: false,
    }).populate("fareDetailsId");
    if (!rentalCar) return Helper.fail(res, "Rental car not found!");
    return Helper.success(res, "Rental car found!", rentalCar);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, "Failed to fetch rental car.");
  }
};
// Soft delete a rental car
const removeRentalCar = async (req, res) => {
  try {
    const { rentalCarId } = req.params;
    if (!rentalCarId) return Helper.fail(res, "Rental car ID is required!");

    const deleted = await RentalCarModel.findByIdAndUpdate(
      rentalCarId,
      { isDeleted: true },
      { new: true }
    );
    if (!deleted) return Helper.fail(res, "Rental car not found!");

    return Helper.success(res, "Rental car deleted successfully!", deleted);
  } catch (error) {
    console.error(error);
    return Helper.error(res, "Failed to delete rental car.");
  }
};
// Update rental car
const updateRentalCar = async (req, res) => {
  try {
    const { rentalCarId } = req.params;
    if (!rentalCarId) return Helper.fail(res, "Rental car ID is required!");

    const {
      title,
      fuelType,
      category,
      capacity,
      luggage,
      priceHour,
      pricePerKm,
      flatRate,
    } = req.body;
    const image = req.file ? req.file.path : null;
    let bookingType, cities;
    try {
      bookingType = JSON.parse(req.body.bookingType);
      cities = JSON.parse(req.body.cities);
    } catch (error) {
      return Helper.fail(res, "Invalid data format for bookingType or cities");
    }
    const objToUpdate = {};
    if (image) objToUpdate.image = image;
    if (title) objToUpdate.title = title;
    if (fuelType) objToUpdate.fuelType = fuelType;
    if (bookingType) objToUpdate.bookingType = bookingType;
    if (cities) objToUpdate.cities = cities;
    if (category) objToUpdate.category = category;
    if (capacity) objToUpdate.capacity = capacity;
    if (luggage) objToUpdate.luggage = luggage;
    if (priceHour) objToUpdate.priceHour = priceHour;
    if (pricePerKm) objToUpdate.pricePerKm = pricePerKm;
    if (flatRate) objToUpdate.flatRate = flatRate;

    const updatedRentalCar = await RentalCarModel.findByIdAndUpdate(
      rentalCarId,
      objToUpdate,
      { new: true }
    );
    if (!updatedRentalCar) return Helper.fail(res, "Rental car not found!");

    return Helper.success(
      res,
      "Rental car updated successfully!",
      updatedRentalCar
    );
  } catch (error) {
    console.error(error);
    return Helper.fail(res, "Failed to update rental car.");
  }
};
// Get all rental cars with pagination
const findAllRentalCars = async (req, res) => {
  try {
    let { category, page, limit } = req.body;
    page = Math.max(parseInt(page));
    limit = Math.max(parseInt(limit));
    const offset = (page - 1) * limit;
    const filters = { isDeleted: false };

    //for Multiple category finding
    if (category) {
      if (Array.isArray(category) && category.length > 0) {
        filters.category = { $in: category.map((cat) => new RegExp(cat, "i")) };
      } else if (typeof category === "string") {
        filters.category = { $regex: new RegExp(category, "i") };
      }
    }
    const rentalCars = await RentalCarModel.find(filters)
      .populate("fareDetailsId")
      .skip(offset)
      .limit(limit);
    if (!rentalCars || rentalCars.length === 0) {
      return Helper.fail(res, "No rental cars found!");
    }
    const totalCars = await RentalCarModel.countDocuments(filters);
    return Helper.success(res, "Rental cars found!", {
      count: totalCars,
      rentalCars,
      page,
      limit,
    });
  } catch (error) {
    console.error(error);
    return Helper.fail(res, "Failed to fetch rental cars.");
  }
};
//for status change
const updateRentalCarStatus = async (req, res) => {
  try {
    const { rentalCarId } = req.params;
    const { isActive } = req.body;

    if (!rentalCarId) return Helper.fail(res, "rentalCarId is required!");
    if (!isActive) return Helper.fail(res, "isActive is required!");

    const updatedRentalCarStatus = await RentalCarModel.findByIdAndUpdate(
      rentalCarId,
      { isActive: isActive },
      { new: true }
    );

    if (!updatedRentalCarStatus)
      return Helper.fail(res, "Failed to update rental Car status!");

    return Helper.success(
      res,
      " RentalCarStatus updated successfully!",
      updatedRentalCarStatus
    );
  } catch (error) {
    console.error("Error updating  RentalCarStatus:", error);
    return Helper.fail(res, error.message);
  }
};
//for fetching Available Cars with Price and Filter
const getAvailableRentalCars = async (req, res) => {
  try {
    const { bookingId, category, luggage, capacity, maxPrice, page, limit } =
      req.body;
    if (!bookingId) return Helper.fail(res, "bookingId is required!");
    const booking = await BookingModel.findById(bookingId);
    if (!booking) return Helper.fail(res, "Booking not found!");
    const {
      bookingType,
      city,
      pickUpLocation,
      dropOffLocation,
      pickUpCoordinates,
      dropOffCoordinates,
      pickUpDate,
      dropOffDate,
      pickUpTime,
      dropOffTime,
    } = booking;
    let distance = 0;
    let price = 0;
    let pickUpDateTime = moment(
      `${moment(pickUpDate).format("YYYY-MM-DD")} ${pickUpTime}`,
      "YYYY-MM-DD HH:mm:ss"
    );
    let dropOffDateTime = moment(
      `${moment(dropOffDate).format("YYYY-MM-DD")} ${dropOffTime}`,
      "YYYY-MM-DD HH:mm:ss"
    );
    let filters = { isAvailable: true, isDeleted: false };
    
    const createCityRegex = (location) => {
      const cityName = location.split(",")[0].trim();
      const shortCityName = cityName.slice(0, 3);
      return new RegExp(shortCityName, "i");
    };    
    if (bookingType === "Local") {
      filters.cities = { $regex: createCityRegex(city) };
      filters.bookingType = bookingType;
      // const rentalCar = await RentalCarModel.findOne(filters);
      // if (rentalCar) {
      //   price = calculateLocalPrice(
      //     pickUpDateTime.format(),
      //     dropOffDateTime.format(),
      //     rentalCar.priceHour
      //   );
      // }
    } else if (bookingType === "Intercity") {//here to make changes
        filters.cities = { $regex: createCityRegex(pickUpLocation) };
        filters.bookingType = bookingType;
        if (booking.multiCityLegs?.length > 0) {
          for (const leg of booking.multiCityLegs) {
            const result = await calculateDistanceAndPrice(leg.pickUpCoordinates, leg.dropOffCoordinates, 1);
            distance += result.distance;
          }
        } else {
          const result = await calculateDistanceAndPrice(pickUpCoordinates, dropOffCoordinates, 1);
          distance = result.distance;
        }
    } else if (bookingType === "Airport Transfer") {
      // filters.cities = { $regex: createCityRegex(pickUpLocation) };
      filters.bookingType = bookingType;
      // const rentalCar = await RentalCarModel.findOne(filters);
      // price = rentalCar ? rentalCar.flatRate : 0;
    }
    if (category) filters.category = { $regex: new RegExp(category, "i") };
    if (luggage) filters.luggage = { $gte: luggage };
    if (capacity) filters.capacity = { $gte: capacity };
    let availableCars = await RentalCarModel.find(filters).populate({
      path: "fareDetailsId",
      select: "-_id -isDeleted -createdAt -updatedAt -__v",
    });
    availableCars = await Promise.all(
      availableCars.map(async (car) => {
        let estimatedPrice = 0;
        if (bookingType === "Local") {
          estimatedPrice = calculateLocalPrice(
            pickUpDateTime.format(),
            dropOffDateTime.format(),
            car.priceHour
          );
        } else if (bookingType === "Intercity") {
          const chargeableKm = Math.max(distance, 300); // Ensure at least 300 km is charged
          estimatedPrice = chargeableKm * car.pricePerKm;
        } else if (bookingType === "Airport Transfer") {
          estimatedPrice = car.flatRate;
        }
        return { ...car.toObject(), estimatedPrice, distance };
      })
    );

    if (maxPrice) {
      availableCars = availableCars.filter(
        (car) => car.estimatedPrice <= maxPrice
      );
    }
    const totalCars = availableCars.length;
    if (totalCars === 0) {
      return Helper.success(
        res,
        "No cars available for the selected criteria.",
        {
          count: totalCars,
          list: [],
          page: 0,
          limit: 0,
          distance,
        }
      );
    }
    const pageNum = Math.max(parseInt(page));
    const limitNum = Math.max(parseInt(limit));
    const offset = (pageNum - 1) * limitNum;
    const paginatedCars = availableCars.slice(offset, offset + limitNum);
    return Helper.success(res, "Available rental cars fetched successfully!", {
      count: totalCars,
      list: paginatedCars,
      page: pageNum,
      limit: limitNum,
      distance,
    });
  } catch (error) {
    return Helper.fail(res, error.message);
  }
};
module.exports = {
  createRentalCar,
  updateRentalCar,
  findRentalCarById,
  removeRentalCar,
  findAllRentalCars,
  updateRentalCarStatus,
  getAvailableRentalCars,
};


//schema
// multiCityLegs: [
//   {
//       pickUpLocation: String,
//       dropOffLocation: String,
//       pickUpCoordinates: { lat: Number, lng: Number },
//       dropOffCoordinates: { lat: Number, lng: Number },
//       distance: Number
//   }
// ],

// let totalDistance = 0;
// let totalPrice = 0;
// const pricePerKm = car.pricePerKm;  // Assume pricePerKm sab cars ke andar hai

// if (booking.multiCityLegs?.length > 0) {
//     for (const leg of booking.multiCityLegs) {
//         const result = await calculateDistanceAndPrice(
//             leg.pickUpCoordinates,
//             leg.dropOffCoordinates,
//             pricePerKm
//         );
//         totalDistance += result.distance;
//         totalPrice += result.price;
//     }
// } else {
//     const result = await calculateDistanceAndPrice(
//         booking.pickUpCoordinates,
//         booking.dropOffCoordinates,
//         pricePerKm
//     );
//     totalDistance = result.distance;
//     totalPrice = result.price;
// }
