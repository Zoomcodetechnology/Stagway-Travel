const express = require('express');
const router = express.Router();
const { isAuth }= require("../utils/auth");
const adminController = require("../controller/adminController");
/*--------------------------------admin Routes-------------------------------*/
router.post("/create", adminController.adminCreate);
router.post("/login", adminController.adminLogin); 
router.post("/update",isAuth, adminController.updateAdmin);
router.post("/remove",isAuth, adminController.removeAdmin);
router.post("/fetch-profile", isAuth, adminController.fetchProfile);
router.post("/update-password", isAuth, adminController.updatePassword);
module.exports = router;