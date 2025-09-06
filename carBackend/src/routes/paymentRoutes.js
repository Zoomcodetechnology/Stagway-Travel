
const express = require("express");
const router = express.Router();
const paymentController = require("../controller/paymentController");
const { isAuth } = require("../utils/auth");

/*--------------------------------FareDetails Routes-------------------------------*/
router.post("/initiate-payment",isAuth, paymentController.initiatePayment);
router.post("/handle-payment",isAuth, paymentController.verifyPayment);
router.post("/redirect", paymentController.redirected);
router.post("/cancel", paymentController.canceled);  

module.exports = router;


