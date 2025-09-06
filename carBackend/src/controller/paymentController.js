const Helper = require("../utils/helper");
const BookingModel = require("../model/bookingModel");
const UserModel = require("../model/userModel");
const ccavReqHandler = require("../utils/ccAvenue/ccavRequestHandler");
const ccavResHandler = require("../utils/ccAvenue/ccavResponseHandler");
const razorpayInstance = require("../utils/razorPay");

const initiatePayment = async (req, res) => {
  try {
    const userId = req.userId;
    const { bookingId } = req.body;
    if (!bookingId) {
      return Helper.fail(
        res,
        "bookingId is required!"
      );
    }
    const booking = await BookingModel.findOne({ userId, _id: bookingId });
    if (!booking) return Helper.fail(res, "Booking not found!");
    const user = await UserModel.findOne({ _id: userId, isDeleted: false });
    if (!user) return Helper.fail(res, "User not found!");

    const orderId = "LOC" + Date.now();
    const amount = booking.totalPrice;
    if (!amount || isNaN(amount)) {
      return Helper.fail(res, "Invalid amount");
    }
    
    const name = user?.fullName;
    const email = user?.email;
    const merchantId =process.env.CCA_MERCHANT_ID;
    const redirectUrl =process.env.CCA_REDIRECT_URL;
    const cancelUrl =process.env.CCA_CANCEL_URL;
    const payload = {
      merchant_id: String(merchantId), // ⚠️ Required
      order_id: String(orderId),
      currency: "INR",
      amount: String(amount),
      redirect_url: redirectUrl,
      cancel_url: cancelUrl,
      language: "EN", // ⚠️ Required
      billing_name: name || "Guest",
      billing_email: email || "guest@example.com",

      // ...other optional fields
    };

    ccavReqHandler.postReq(req, res, payload);
    //     const creds = getCCAvenueCredentials(redirectUrl);

  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};
const verifyPayment = async (req, res) => {
  try {
    // Step 1: Decrypt using postRes
    const paymentDetails = await ccavResHandler.postRes(req, res); // also renders HTML table

    // 👇 If you don't want to send HTML and just handle result in backend:
    // const paymentDetails = qs.parse(ccav.decrypt(req.body.encResp, process.env.CCA_WORKING_KEY));

    if (paymentDetails?.order_status === "Success") {
      console.log(
        "✅ Payment successful for Order ID:",
        paymentDetails.order_id
      );
      // Update your booking/payment record here
    } else {
      console.log("❌ Payment failed for Order ID:", paymentDetails?.order_id);
    }

    // Optional: redirect to frontend
    // res.redirect(`https://your-frontend.com/payment-status?status=${paymentDetails.order_status}`);
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).send("Payment verification failed");
  }
};
const redirected = async (req, res) => {
  return res.status(200).send("Payment Redirected");
};
const canceled = async (req, res) => {
  return res.status(200).send("Payment Cancelled");
};


//razorpay  Start 7:15 date:- 09-04-25

const createOrder = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return Helper.fail(res, "userId is required!");
    const { bookingId, } = req.body; 
    if (!bookingId) {
      return Helper.fail(
        res,
        "bookingId is required!"
      );
    }
    const booking = await BookingModel.findOne({ userId, _id: bookingId });
    if (!booking) return Helper.fail(res, "Booking not found!");
    const user = await UserModel.findOne({ _id: userId, isDeleted: false });
    if (!user) return Helper.fail(res, "User not found!");

    const amount = booking.totalPrice;
    if (!amount || isNaN(amount)) {
      return Helper.fail(res, "Invalid amount");
    } // Added purchaseType
    // const existingOrderQuery = {
    //   userId,
    //   isDeleted: false,
    //   status: { $in: ["pending","completed"] },
    // };
    //   existingOrderQuery.bookingId = bookingId;
  
    // const existingOrder = await OrderModel.findOne(existingOrderQuery);
    // if (existingOrder) {
    //   return Helper.fail(res,"Order already exists booking");
    // }
     // Razorpay Order Creation
     const razorpayOrder = await razorpayInstance.orders.create({
      amount: totalPrice * 100,  
      currency: "INR",
      receipt: `order_${Date.now()}`,
      payment_capture: 1
  });
  if (!razorpayOrder.id) {
      return Helper.fail(res, "Failed to create Razorpay order!");
  }
    const orderObj = {
      userId,
      bookingId,
      totalPrice,
      isActive: true,
      status: "pending", 
      razorpayOrderId: razorpayOrder.id  
    };
    const createdOrder = await OrderModel.create(orderObj);
    return Helper.success(res, "Payment Initiated successfully!", {
        order: createdOrder,
        razorpayOrder, 
        keyId: process.env.RAZORPAY_KEY_ID 
    });

  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};
//verify Payment For RazorPay
// const verifyPayment = async (req, res) => {
//   try {
//     const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
//     const order = await OrderModel.findOne({ razorpayOrderId: razorpay_order_id });
//     if (!order) return Helper.fail(res,"Order not found");
//     const secret = process.env.RAZORPAY_KEY_SECRET; // ✅ ENV se lo
//     const generatedSignature = crypto
//       .createHmac("sha256",secret)
//       .update(razorpay_order_id + "|" + razorpay_payment_id)
//       .digest("hex");
//     if (generatedSignature !== razorpay_signature) {
//     return Helper.fail(res,"Invalid payment signature");
//     }
//       order.status = "completed";
//       order.paymentStatus = "completed";
//       order.razorpayPaymentId = razorpay_payment_id;
//       await order.save();
//     return Helper.success(res,"Payment verified", order );
//   } catch (error) {
//     console.log(error);
//     return Helper.fail(res, "Failed to Verify Payment");
//   }
// };

module.exports = {
  initiatePayment,
  verifyPayment,
  redirected,
  canceled,
};
