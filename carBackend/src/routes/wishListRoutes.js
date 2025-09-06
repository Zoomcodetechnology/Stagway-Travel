const express = require("express");
const router = express.Router();
const wishListController = require("../controller/wishListController");
const { isAuth } = require("../utils/auth");

/*--------------------------------WishList Routes-------------------------------*/

router.post("/add-to-wishlist", isAuth,wishListController.addToWishlist)
router.post("/remove", isAuth, wishListController.removeFromWishlist)
router.post("/list", isAuth,wishListController.wishlistItemList)
router.post("/my-wishlist", isAuth,wishListController.myWishList)
module.exports = router;

