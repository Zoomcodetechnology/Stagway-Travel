const express = require("express");
const router = express.Router();
const fareDetailsController = require("../controller/fareDetailsController");
const { isAuth } = require("../utils/auth");

/*--------------------------------FareDetails Routes-------------------------------*/
router.post("/createFareDetails",isAuth, fareDetailsController.createFareDetails);
router.post("/updateFareDetails",isAuth, fareDetailsController.updateFareDetails);
router.post("/getAllFareDetails",isAuth, fareDetailsController.getAllFareDetails);
module.exports = router;
