const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const { isAuth } = require("../utils/auth");

/*--------------------------------user Routes-------------------------------*/
router.post("/register", userController.register);
router.post("/update", isAuth, userController.update);
router.post("/remove", isAuth, userController.remove);
router.post("/find-By-Id", isAuth, userController.findUserById);
router.post("/update-password", isAuth, userController.updatePassword);
router.post("/search-user", isAuth, userController.getUsersWithFilters);
router.post("/login", userController.userLogin);
router.post("/forgotPassword",  userController.forgotPassword)
router.post("/verifyOtp",  userController.verifyResetPasswordOtp)//for resetPassword
router.post("/resendOtp",  userController.resendResetPasswordOtp)
router.post("/resetPassword",userController.resetPassword) 
// router.post("/detail",isAuth, userController.userDetail);
router.post("/fetch-profile",isAuth, userController.fetchProfile);
module.exports = router;
