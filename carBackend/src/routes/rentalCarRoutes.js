const express = require("express");
const router = express.Router();
const rentalCarController = require("../controller/rentalCarController");
const upload = require("../utils/upload"); 
const {isAuth} = require("../utils/auth");
/*-------------------------------------------------****RentalCar Routes****-----------------------------------------*/
/*.............................Admin Side Routes .............................................*/
// Create a new  rentalCar
router.post("/create",upload.single("image"),isAuth, rentalCarController.createRentalCar);
// Get a RentalCar by ID //:RentalCarId"
router.post("/findById/:rentalCarId",isAuth, rentalCarController.findRentalCarById);
// Soft delete a RentalCar //:RentalCarId
router.post("/remove/:rentalCarId", isAuth,rentalCarController.removeRentalCar);
// Update a RentalCar //:RentalCarId
router.post("/update/:rentalCarId",upload.single("image"),isAuth, rentalCarController.updateRentalCar);
//get all RentalCars
router.post("/findAll",isAuth, rentalCarController.findAllRentalCars);
//for status change
router.post("/changeStatus/:rentalCarId",isAuth, rentalCarController.updateRentalCarStatus);
/*.............................User Side  Routes ................................................*/
router.post("/fetchByFilter",isAuth, rentalCarController.getAvailableRentalCars);
module.exports = router;