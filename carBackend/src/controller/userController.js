const UserModel = require("../model/userModel");
const { signInToken } = require("../utils/auth");
const Helper = require("../utils/helper");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const { sendEmail } = require("./mailController");
const saltRounds = 10;
async function getUserWithToken(userId) {
  try {
    let userDetail = await userProfile(userId);
    //userDetail.first_name + " " + userDetail.last_name, if we want to send then use it
    const token = signInToken(userId);
    return { token: token, userDetail: userDetail };
  } catch (error) {
    console.log(error);
    return {};
  }
}
const userProfile = async (userId) => {
  try {
    let userProfile = await UserModel.findById(userId).select({
      password: 0,
      __v: 0,
      createdAt: 0,
      updatedAt: 0,
    });
    return userProfile;
  } catch (error) {
    return false;
  }
};
//for generating 5 digit random otp
const generateOTP = () =>
  Math.floor(10000 + Math.random() * 9000); // 4digit
//for creating User
const register = async (req, res) => {
  try {
    let {
      number,
      email,
      password,
    } = req.body;
    if (!number) {
      return Helper.fail(res, "number is required!");
    }
    if (!email) {
      return Helper.fail(res, "Email is required!");
    }
    if (!password) {
      return Helper.fail(res, "Password is required!");
    }
    // Validating email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(email)) {
      return Helper.fail(res, "Email is not valid!");
    }
    // Validating phone no.
    if (number) {
      const phoneRegex = /^[1-9]\d{10,13}$/;
      if (!phoneRegex.test(number)) {
      return Helper.fail(res, "Number is not valid!" );
      }
    }
    let checkObj = { $or: [{ email: email }] };
    if (number) {
      checkObj.$or.push({ number: number });
    }
    let userCheck = await UserModel.find(checkObj);
    if (userCheck.length > 0) {
      return Helper.fail(res, "User already exists with this email or mobile!");
    }
    // // generateOTP();
    // const otp =1234; 
    //for hashing password
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    let userObj = {
      number,
      email,
      password: hashedPassword,
      // otp: otp,
    };
    let createUser = await UserModel.create(userObj);
    const { token, userDetail } = await getUserWithToken(createUser._id);
    if (!token || !userDetail) {
      return Helper.error("Failed to generate token or get user profile");
    }
    return Helper.success(res, "SignUp Successfully",{ token, userDetail, });
    // return Helper.success(res, "Otp Sent successfully!", createUser);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

//for updating User
const update = async (req, res) => {
  try {
    const {userId}  = req.body;
    const {  number, email,} =
      req.body;
    if (!userId) {
      return Helper.fail(res, "userId is missing from request");
    }
    //validating email
    if (email) {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      if (!emailRegex.test(email)) {
        return Helper.fail(res, "Email is not valid!");
      }
    }
    // Validate mobile if provided
    if (number) {
      const phoneRegex = /^\d{6,14}$/;
      if (!phoneRegex.test(number)) {
        return Helper.fail(res, "phone number is not valid!");
      }
    }
   
    //checking customer exist or not
    let user = await UserModel.findById(userId);
    if (!user) {
      return Helper.fail(res, "user not found!");
    }
    let objToUpdate = {};
   
    if (number)
      if (formattedDob) {
        objToUpdate.dob = formattedDob;
      }
    if (email) {
      // Case insensitive search for email already used
      const emailRegex = new RegExp(`^${email}$`, "i");
      const user = await UserModel.findOne({
        email: emailRegex,
        _id: { $ne: userId },
      });

      if (user) {
        return Helper.fail(res, "Email is already used in another account");
      }
      objToUpdate.email = email;
    }
    let updateProfile = await UserModel.findByIdAndUpdate(userId, objToUpdate, {
      new: true,
    });
    if (updateProfile) {
      return Helper.success(res, "User  updated successfully!", updateProfile);
    }
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};
//for soft Delete User
const remove = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return Helper.fail(res, "Please provide user id ");
    }
    let i = { _id: userId };
    let deleted = await UserModel.findOneAndUpdate(
      i,
      { isDeleted: true },
      { new: true }
    );
    if (!deleted) {
      return Helper.fail(res, "No user found!");
    }
    return Helper.success(res, " user  deleted successfully", deleted);

    return Helper.fail(res, "No valid userId provided");
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};
//for finding userBy UserId
const findUserById = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return Helper.fail(res, "userId is required");
    }
    const user = await UserModel.findById(userId);

    if (!user) {
      return Helper.fail(res, "User not found");
    }
    return Helper.success(res, "User found", user);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "Failed to fetch user");
  }
};
//for updating User Password
const updatePassword = async (req, res) => {
  try {
    const  userId  = req.userId;
    const { password, old_password } = req.body;
    if (!password || !old_password) {
      return Helper.fail(res, "Please enter old password and new password");
    }
    const user = await UserModel.findById({ _id: userId });
    if (!user) {
      return Helper.fail(res, "User not found");
    }
    const isMatch = await bcrypt.compare(old_password, user.password);
    if (!isMatch) {
      return Helper.fail(res, "Invalid old password");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();
    return Helper.success(res, "Password updated successfully", null);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "Failed to update password");
  }
};

//for forget password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return Helper.fail(res, "please enter your email");
    }
    const user = await UserModel.findOne({ email });
    if (!user) {
      return Helper.fail(res, "User not found");
    }
    const otp = generateOTP();
    user.resetPasswordToken = otp; // Store OTP for password reset
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    await sendEmail(email, 'Your Verification code for Forget Password', 'forgetTemplate', {value:otp} )
    // const emailResponse = await sendEmail(email, subject, text);
    // if (!emailResponse.success) {
    //   return Helper.fail(res, "Failed to send OTP email");
    // }
   
    return Helper.success(res, "Password reset email sent", null);
  } catch (error) {
    console.error("Error:", error.message);
    return Helper.fail(
      res,
      error.message || "Failed to initiate password reset"
    );
  }
};
//for password reset OTP On email
const verifyResetPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return Helper.fail(res, "Email and OTP are required");

    const user = await UserModel.findOne({
      email,
      resetPasswordToken: otp,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return Helper.fail(res, "Invalid or expired OTP");
    return Helper.success(res, "OTP verified successfully");
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};
//for resend Password Reset OTP On email
const resendResetPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return Helper.fail(res, "Email is required");
    }
    const user = await UserModel.findOne({ email });
    if (!user) {
      return Helper.fail(res, "User not found");
    }
    const otp = generateOTP();
    user.resetPasswordToken = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    await sendEmail(email, 'Your Verification code for Forget Password', 'forgetTemplate', {value:otp} )
    return Helper.success(res, "New OTP sent successfully");
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "Failed to resend OTP");
  }
};
//for reset password
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return Helper.fail(res, "All fields are required");
    }
    if (newPassword !== confirmPassword) {
      return Helper.fail(res, "Passwords do not match");
    }
    const user = await UserModel.findOne({ email });
    if (!user) {
      return Helper.fail(res, "User not found");
    }
    if (user.resetPasswordExpires < Date.now()) {
      return Helper.fail(res, "OTP expired. Please request a new OTP.");
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return Helper.success(res, "Password has been reset successfully");
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};
// const userDetail = async (req, res) => {
//   try {
//     let userId = req.userId;
//     if (!userId) {
//       return Helper.fail(res, "userId is required");
//     }
//     const user = await UserModel.findById(userId).select("-password");
//     if (!user) {
//       return Helper.fail(res, "User not found");
//     }
//     return Helper.success(res, "User details fetched successfully", user);
//   } catch (error) {
//     console.log(error);
//     return Helper.fail(res, "Failed to fetch user");
//   }
// };
const userLogin = async (req, res) => {
  try {
    const { number,password } = req.body;
    if (!number) {
      return Helper.fail(res, "Please enter number ");
    }
    if (!password) {
      return Helper.fail(res, "Please enter password ");
    }
    const user = await UserModel.findOne({ number });
    if (!user) {
      return Helper.fail(res, "Looks Like You Have Not Registered With us!");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return Helper.fail(res, "Invalid password");
    }
    // generateOTP();
  //   const otp = 1234;
  //   user.otp = otp;
  //  const  userId= user._id
  //   await user.save();
    //as per client requirements
    const { token, userDetail } = await getUserWithToken(user._id);
    if (!token || !userDetail) {
      return Helper.error("Failed to generate token or get user profile");
    }
    return Helper.success(res, "Login Successfull",{ token, userDetail, });
    // return Helper.success(res, "OTP Sent successful", { otp,userId });
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "Failed to Login");
  }
};
const whatsappApiUrl = `https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`;
const whatsappToken = process.env.WHATSAPP_TOKEN;
const templateName = process.env.WHATSAPP_TEMPLATE_NAME;
const sendOtp = async (req, res) => {
  try{
    const { number } = req.body;
    if (!number) {
      return Helper.fail(res, "Please enter number ");
    }
    const user = await UserModel.findOne({ number });
    if (!user) {
      return Helper.fail(res, "Looks Like You Have Not Registered With us!");
    }
       const otp = generateOTP();
    // Set OTP expiry time (5 minutes from now)
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    // Update user record with OTP and expiry time
    user.otp = otp;
    user.expiresAt = otpExpiresAt;
    await user.save();
    const message = {
      messaging_product: "whatsapp",
      to: number,
      type: "template",
      template: {
        name: "dummy_template_name", 
        language: { code: "en_US" },
        components: [{
          type: "body",
          parameters: [{ type: "text", text: otp }]
        }]
      }
    };

    // Send OTP via WhatsApp API
    const response = await axios.post(whatsappApiUrl, message, {
      headers: {
       'Authorization': `Bearer ${whatsappToken.trim()}`,
        'Content-Type': 'application/json'
      }
    });

    return Helper.success(res, "OTP sent successfully");
  } catch (error) {
     console.error("Error sending OTP:", error.response ? error.response.data : error.message);
     res.status(500).json({ success: false, message: 'Failed to send OTP', error: error.response ? error.response.data : error.message });
  }
}


// const fetchProfile = async (req, res) => {
//   try {
//     const userId = req.userId;
//     const user = await UserModel.findById(userId).select({
//       password: 0,
//       __v: 0,
//       createdAt: 0,
//       updatedAt: 0,
//     });
//     if (!user) {
//       return Helper.fail(res, "user not found");
//     }
//     return Helper.success(res, "Profile fetched successfully", user);
//   } catch (error) {
//     console.log(error);
//     return Helper.fail(res, "Failed to fetch profile");
//   }
// };
//for filter user
const getUsersWithFilters = async (req, res) => {
  try {
    let { search } = req.query;
    // if (!search) {
    //   return Helper.success(res, "Not found", []);
    // }
    const isPhoneNumberSearch = !isNaN(search); 

    const query = {
      isDeleted: { $ne: true },
      $or: [ 
        { email: { $regex: new RegExp(search, "i") } },  
      ],
    };

    if (isPhoneNumberSearch) {
      query.$or.push({ number: Number(search) });
    }

    let users = await UserModel.find(query);

    return Helper.success(res, "Success!", users);
  } catch (error) {
    console.log({ error });
    return Helper.fail(res, error.message);
  }
};
// const { MongoClient } = require('mongodb');
//  const sourceUri = 'mongodb://localhost:27017/carBooking';
//  const destinationUri = 'mongodb+srv://rajputsachin8878:rajput8878@crudappdata.3dxd8.mongodb.net/CarBookingDB';

// const transferData = async () => {
//     const sourceClient = new MongoClient(sourceUri, { useNewUrlParser: true, useUnifiedTopology: true });
//     const destinationClient = new MongoClient(destinationUri, { useNewUrlParser: true, useUnifiedTopology: true });

//     try {
//         await sourceClient.connect();
//         await destinationClient.connect();

//         console.log('Connected to both databases');

//         const sourceDb = sourceClient.db();
//         const destinationDb = destinationClient.db();

//         const collections = await sourceDb.listCollections().toArray();
//         console.log({ collections })

//         for (const collectionInfo of collections) {
//             const collectionName = collectionInfo.name;

//             const sourceCollection = sourceDb.collection(collectionName);
//             const data = await sourceCollection.find({}).toArray();

//             console.log(`Fetched ${data.length} documents from source collection: ${collectionName}`);

//             const destinationCollection = destinationDb.collection(collectionName);
//             if (data.length > 0) {
//                 const result = await destinationCollection.insertMany(data);
//                 console.log(`Inserted ${result.insertedCount} documents into destination collection: ${collectionName}`);
//             }
//         }

//     } catch (error) {
//         console.error('Error transferring data:', error);
//     } finally {
//         await sourceClient.close();
//         await destinationClient.close();
//         console.log('Connections closed');
//     }
// };
//  transferData();

//for fetching user profile
const fetchProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await UserModel.findById(userId).select({
      password: 0,
      __v: 0,
      createdAt: 0,
      updatedAt: 0,
    });
    if (!user) {
      return Helper.fail(res, "user not found");
    }
    return Helper.success(res, "Profile fetched successfully",user);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "Failed to fetch profile");
  }
};

module.exports = {
  register,
  update,
  remove,
  findUserById,
  updatePassword,
  getUsersWithFilters,
  userLogin,
  sendOtp,
  forgotPassword,
  verifyResetPasswordOtp,
  resendResetPasswordOtp,
  resetPassword,
  
  // userDetail,
  // userLogin,
  fetchProfile
};
