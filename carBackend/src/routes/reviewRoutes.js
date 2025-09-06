const express = require('express');
const router = express.Router();
const { isAuth } = require("../utils/auth");
const reviewController = require("../controller/reviewController");
/*--------------------------------Review Routes-------------------------------*/
router.post("/add",isAuth, reviewController.addReview);
router.post("/update/:reviewId",isAuth, reviewController.updateReview);
router.post("/remove/:reviewId",isAuth, reviewController.deleteReview);
router.post("/car/:rentalCarId", isAuth, reviewController.getReviewsByCar);
module.exports = router;