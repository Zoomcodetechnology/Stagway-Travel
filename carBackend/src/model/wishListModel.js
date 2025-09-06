const mongoose = require('mongoose')

const WishListModel = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'users',
  },
  rentalCarId: {
    type: mongoose.Types.ObjectId,
    ref: 'rentalcars',
  },
}, { timestamps: true })

module.exports = mongoose.model('wishlist', WishListModel);