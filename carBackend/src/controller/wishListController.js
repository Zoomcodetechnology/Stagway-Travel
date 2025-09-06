const { default: mongoose } = require("mongoose")
const WishListModel = require("../model/wishListModel");
const Helper = require("../utils/helper");
//for adding WishList
const addToWishlist = async (req, res) => {
  try {
    let userId = req.userId;
    let { rentalCarId } = req.body
    if (!userId) {
      return Helper.fail(res, "User ID is required or user token is required")
    }
    if (!rentalCarId) {
      return Helper.fail(res, "rentalCarId is required")
    }
    const existingWishlistItem = await WishListModel.findOneAndDelete({ userId, rentalCarId });
    if (existingWishlistItem) {
      return Helper.success(res, "rentalCar removed from wishlist",existingWishlistItem);
    }
    let obj = { rentalCarId, userId };
    const add = await WishListModel.create(obj)
    if (!add) {
      return Helper.fail(res, "Failed to add item to wishlist")
    }
    return Helper.success(res, "Item added to wishlist successfully", add)
  } catch (error) {
    console.log({ error })
    return Helper.fail(res, error.message)
  }
};
//for removing WishList
const removeFromWishlist = async (req, res) => {
  try {
    let userId = req.userId;
    const { wishlistId } = req.body;
    if (!wishlistId) {
      return Helper.fail(res, "Wishlist ID is required");
    }
    if (!userId) {
      return Helper.fail(res, "User ID is required");
    }

    const removedItem = await WishListModel.findByIdAndDelete(wishlistId);

    if (!removedItem) {
      return Helper.fail(res, "Item not found in wishlist or could not be removed");
    }
    return Helper.success(res, "Item removed from wishlist successfully", removedItem);

  } catch (error) {
    console.log({ error });
    return Helper.fail(res, error.message);
  }
};
//for Listing WishListItems
const wishlistItemList = async (req, res) => {
  try {
    let { page = 1, limit = 10, search } = req.body
    page = parseInt(page);
    limit = parseInt(limit);

    const query = {};

    if (search) {
      query.$or = [

      ]
    };
    const aggregationPipeline = [
        Helper.lookup(
            'rentalcars',
            'rentalCarId',
            '_id',
            'rentalCarDetails',
          ),
      Helper.unwind(
        '$rentalCarDetails',
        false
      ),
    ];

    const count = await WishListModel.countDocuments(query);

    const wishlist = await WishListModel.aggregate(aggregationPipeline)
      .skip((page - 1) * limit)
      .limit(limit);

    return Helper.success(res, "wishList found", { wishlist, total: count, currentPage: page, totalPages: Math.ceil(count / limit) });


  } catch (error) {
    console.log({ error });
    return Helper.fail(res, error.message);
  }
};
//for listing wishList
const myWishList = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return Helper.fail(res, "User ID is required");
    }
    const aggregationPipeline = [
      Helper.match(
        {userId: new mongoose.Types.ObjectId(userId)}
      ),
      Helper.lookup(
        'rentalcars',
        'rentalCarId',
        '_id',
        'rentalCarDetails',
      ),
      Helper.unwind(
        '$rentalCarDetails',
        false
      ),
      Helper.project({
        userId: 1,                         
        rentalCarId: 1,                   
        'rentalCarDetails.title': 1,         
        'rentalCarDetails.description': 1,   
        'rentalCarDetails.images': 1 ,
        'rentalCarDetails.price': 1,
        'rentalCarDetails._id': 1,

      })
    ];

    const wishlist = await WishListModel.aggregate(aggregationPipeline)
    return Helper.success(res, "wishList found", wishlist);

  } catch (error) {
    console.log({ error });
    return Helper.fail(res, "An error occurred while retrieving the wishlist");
  }
};
module.exports = {
    addToWishlist,
  removeFromWishlist,
  wishlistItemList,
  myWishList
};
