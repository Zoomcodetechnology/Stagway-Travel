const express = require("express");
const router = express.Router();
const bookingInfoController = require("../controller/bookingInfoController");
const { isAuth } = require("../utils/auth");

/*--------------------------------Booking Info  Routes-------------------------------*/
router.post("/bookingInfoRegister",isAuth, bookingInfoController.bookingInfoRegister);
router.post("/resendOTP",isAuth, bookingInfoController.resendOTP);
router.get("/get-Token", bookingInfoController.get_token);
router.post("/verifyInfoOTP",isAuth, bookingInfoController.verifyOTP);
module.exports = router;
