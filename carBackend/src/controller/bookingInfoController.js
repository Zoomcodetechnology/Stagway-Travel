const BookingInfoModel = require("../model/bookingInfoModel");
const UserModel = require("../model/userModel");
const BookingModel = require("../model/bookingModel");
const nodemailer = require("nodemailer");
const Helper = require("../utils/helper");
const { sendEmail } = require("../controller/mailController.js");
require("dotenv").config();
//for otp generation 6 digit
const generateOTP = () => Math.floor(100000 + Math.random() * 90000).toString();
// for  booking User Info register
const bookingInfoRegister = async (req, res) => {
  try {
    let { fullName, number, email, pickUpAddress, dropOffAddress, anyNotes } =
      req.body;

    if (!fullName) {
      return Helper.fail(res, "Please Fill FullName!");
    }
    if (!number) {
      return Helper.fail(res, "Please Fill Number!");
    }
    if (!email) {
      return Helper.fail(res, "Please Fill Email!");
    }
    if (!pickUpAddress) {
      return Helper.fail(res, "Pick-Up Address is required!");
    }
    if (!dropOffAddress) {
      return Helper.fail(res, "Drop-Off Address is required!");
    }
    // Validating email format
    // const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Helper.fail(res, "Email is not valid!");
    }
    // Validating phone no.
    if (number) {
      const phoneRegex = /^[1-9]\d{10,13}$/;
      if (!phoneRegex.test(number)) {
        return Helper.fail(
          res,
          "Invalid phone number! Please enter your phone number including the country code (e.g., 91 for India)."
        );
      }
    }
    const existingUserByEmail = await UserModel.findOne({ email });
    const existingUserByNumber = await UserModel.findOne({ number });

    if (!existingUserByEmail && !existingUserByNumber) {
      return Helper.fail(res, "User not Registered with this Email and Number");
    } else if (!existingUserByEmail) {
      return Helper.fail(res, "User not Registered with this Email");
    } else if (!existingUserByNumber) {
      return Helper.fail(res, "User not Registered with this Mobile Number");
    }
    const otp = generateOTP();
    let existingBookingInfo = await BookingInfoModel.findOne({ number, email });
    if (existingBookingInfo) {
      existingBookingInfo.otp = otp;
      await existingBookingInfo.save();
    sendEmail(email, 'Your OTP for Verification', 'otpTemplate', { value: otp })
      // sendResetEmail(email, existingBookingInfo.otp);
      return Helper.success(res, "OTP sent successfully!", {
        bookingInfoId: existingBookingInfo._id,
        createdBookingInfo: existingBookingInfo,
      });
    }
    
    const bookingInfoObj = new BookingInfoModel({
      fullName,
      number,
      email,
      pickUpAddress,
      dropOffAddress,
      anyNotes,
      otp,
    });
    await bookingInfoObj.save();
    // sendResetEmail(email, otp);
    sendEmail(email, 'Your OTP for Verification', 'otpTemplate', { value: otp })
    return Helper.success(res, "OTP sent successfully!", {
      bookingInfoId: bookingInfoObj._id,
      createdBookingInfo: bookingInfoObj,
    });
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};
//for nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASS, // Use an app password if 2FA is enabled
  },
});
const sendResetEmail = (email, otp) => {
  const resetUrl = `http://your-frontend-url/reset-password?otp=${otp}`; // Frontend ko OTP bhejna hai
  const mailOptions = {
    to: email,
    from: process.env.EMAIL,
    subject: "For Email Verification",
    text:
      `You are receiving this because you (or someone else) have requested Booking Car to Your account.\n\n` +
      `Please use the following OTP to Verify your Email: \n\n` +
      `${otp}\n\n` + // OTP as part of the email
      `If you did not request this, please ignore this email .\n`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("Error sending email:", err);
      return;
    }
    console.log("Email sent:", info.response);
  });
};
//verifying BookingInfo
const verifyOTP = async (req, res) => {
  try {
    const { email, bookingId, otp } = req.body;
    if (!otp) {
      return Helper.fail(res, " OTP is required");
    }
    if (!email) {
      return Helper.fail(res, "email is required");
    }
    if (!bookingId) {
      return Helper.fail(res, "bookingId is required");
    }
    const bookingInfo = await BookingInfoModel.findOne({
      email: email,
      otp,
    });
    if (!bookingInfo) return Helper.fail(res, "Invalid OTP.");
    // bookingInfo.otp = undefined;
    // bookingInfo.expiresAt = undefined;
    // await bookingInfo.save();
    //for adding the user name from info and saving it into our userData
    await UserModel.updateOne(
      { number: bookingInfo.number, email: bookingInfo.email },
      {
        $set: {
          fullName: bookingInfo.fullName,
        },
      }
    );

    await BookingModel.updateOne(
      { _id: bookingId },
      { $set: { bookingInfoId: bookingInfo._id } }
    );
    return Helper.success(res, "OTP verified successfully.");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong!" });
  }
};
//for resnd OTP
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return Helper.fail(res, "Email is required!");
    }
    const bookingInfo = await BookingInfoModel.findOne({ email });
    if (!bookingInfo) {
      return Helper.fail(res, "No booking info found with this email!");
    }
    const newOTP = generateOTP();
    bookingInfo.otp = newOTP;
    await bookingInfo.save();
    sendEmail(email, 'Your OTP for Verification', 'otpTemplate', { value: newOTP })

    // sendResetEmail(email, newOTP);
    return Helper.success(res, "OTP resent successfully!", {
      bookingInfoId: bookingInfo._id,
    });
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};
const get_token = async (req, res) => {
  console.log("test1");
  const email = await sendEmail(
    "sachinzoomcode@gmail.com",
    "Agent Password",
    "AgentPass",
    "password"
  );
  return Helper.success(res, "test3", {
    email,
  });
  console.log("test2");
};

module.exports = {
  bookingInfoRegister,
  verifyOTP,
  resendOTP,
  get_token,
};
