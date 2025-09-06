const express = require('express');
const router = express.Router();

const { isAuth } = require("../utils/auth");

const subAdminController = require("../controller/subAdminController");
/*--------------------------------SubAdmin Route-------------------------------*/
 router.post("/create",isAuth, subAdminController.createSubAdmin);
 router.post("/update",isAuth, subAdminController.updateSubAdmin);
 router.post("/remove",isAuth, subAdminController.removeSubAdmin);
 router.post("/update-password", isAuth, subAdminController.updatePassword);
 router.post("/login", subAdminController.subAdminLogin); 
 router.post("/fetch-profile", isAuth, subAdminController.fetchProfile);
module.exports = router;