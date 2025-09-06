const mongoose = require("mongoose");
const PaymentModel = new mongoose.Schema({
    orderId: String,
    transactionId: String,
    amount: Number,
    status: String,
    paymentMode: String,
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("payments", PaymentModel);

