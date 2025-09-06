require("dotenv").config();
const express = require("express");
const app = express();
app.set('view engine', 'ejs');
const cors = require("cors");
const bodyParser = require("body-parser");
//cors Middleware
app.use(cors(
  {
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"],  
  }
));
// we are using body-parser middleware to parse JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// For Db connection
require("./src/utils/db");
//Routes
const adminRoutes = require("./src/routes/adminRoutes")
const analyticsRoutes = require("./src/routes/analyticsRoutes")
const subAdminRoutes = require("./src/routes/subAdminRoutes")
const userRoutes = require("./src/routes/userRoutes")
const wishListRoutes = require("./src/routes/wishListRoutes")
const rentalCarRoutes = require("./src/routes/rentalCarRoutes")
const bookingRoutes = require("./src/routes/bookingRoutes")
const bookingInfoRoutes = require("./src/routes/bookingInfoRoutes")
const addOnRoutes = require("./src/routes/addOnRoutes")
const promoCodeRoutes = require("./src/routes/promoCodeRoutes")
const faqRoutes = require("./src/routes/faqRoutes")
const fareDetailsRoutes = require("./src/routes/fareDetailsRoutes")
const paymentRoutes = require("./src/routes/paymentRoutes")
const reviewRoutes = require("./src/routes/reviewRoutes")
app.use("/uploads", express.static("uploads"));
app.use('/v1/admin', adminRoutes);
app.use('/v1/analytics', analyticsRoutes);
app.use('/v1/subAdmin', subAdminRoutes);
app.use('/v1/user', userRoutes);
app.use('/v1/wishList', wishListRoutes);
app.use("/v1/rentalCar", rentalCarRoutes);
app.use("/v1/booking", bookingRoutes);
app.use("/v1/bookingInfo", bookingInfoRoutes);
app.use("/v1/addOn", addOnRoutes);
app.use("/v1/promoCode", promoCodeRoutes);
app.use("/v1/faq", faqRoutes);
app.use("/v1/fareDetails", fareDetailsRoutes);
app.use("/v1/payment", paymentRoutes);
app.use("/v1/review", reviewRoutes);

//server creating
app.listen(process.env.PORT,'0.0.0.0', function () {
  console.log("Server is running on http://localhost:" + process.env.PORT);
});


