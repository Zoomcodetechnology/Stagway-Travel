const  ReviewModel = require("../model/reviewModel");
const RentalCarModel = require("../model/rentalCarModel");
const Helper = require("../utils/helper");

const addReview = async (req, res) => {
  try {
    const userId = req.userId;
    const { rentalCarId, rating, review } = req.body;
    if (!rentalCarId || !rating) return Helper.fail(res, "Car ID and Rating are required!");
    if (rating < 1 || rating > 5) return Helper.fail(res, "Rating must be between 1 and 5.");
    const rentalCar = await RentalCarModel.findById(rentalCarId);
    if (!rentalCar) return Helper.fail(res, "Car not found!");
    const existingReview = await ReviewModel.findOne({ rentalCarId, userId, isDeleted: false });
    if (existingReview) return Helper.fail(res, "You have already submitted a review for this car.");
    const newReview = new ReviewModel({ rentalCarId, userId, rating, review });
    await newReview.save();
    const reviews = await ReviewModel.find({ rentalCarId, isDeleted: false });
    const totalReviews = reviews.length;
    const sumRatings = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalReviews ? sumRatings / totalReviews : 0;
    rentalCar.averageRating = avgRating;
    await rentalCar.save();
    return Helper.success(res, "Review added successfully!", newReview);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, review } = req.body;
    const userId = req.userId;

    const existingReview = await ReviewModel.findOne({ _id: reviewId, userId, isDeleted: false });
    if (!existingReview) return Helper.fail(res, 'Review not found or unauthorized.');

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) return Helper.fail(res, 'Rating must be between 1 to 5.');
      existingReview.rating = rating;
    }
    if (review !== undefined) existingReview.review = review;

    await existingReview.save();
    const reviews = await ReviewModel.find({ rentalCarId: existingReview.rentalCarId, isDeleted: false });
    const totalReviews = reviews.length;
    const sumRatings = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalReviews ? sumRatings / totalReviews : 0;
    await RentalCarModel.findByIdAndUpdate(existingReview.rentalCarId, { averageRating: avgRating });
    return Helper.success(res, 'Review updated successfully!', existingReview);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await ReviewModel.findOneAndUpdate(
      { _id: reviewId, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    if (!review) return Helper.fail(res, "Review not found or already deleted!");
    const reviews = await ReviewModel.find({ rentalCarId: review.rentalCarId, isDeleted: false });
    const totalReviews = reviews.length;
    const sumRatings = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalReviews ? sumRatings / totalReviews : 0;
    await RentalCarModel.findByIdAndUpdate(review.rentalCarId, { averageRating: avgRating });
    return Helper.success(res, "Review deleted successfully ", review);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};
const getReviewsByCar = async (req, res) => {
  try {
    const { rentalCarId } = req.params;
    const reviews = await ReviewModel.find({ rentalCarId, isDeleted: false }).populate('userId', 'name email');
    return Helper.success(res, "Reviews fetched successfully!", reviews);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};
module.exports = { addReview,updateReview, deleteReview, getReviewsByCar };
