const express = require("express");
const router = express.Router();
const addOnController = require("../controller/addOnController");
const { isAuth } = require("../utils/auth");
/*--------------------------------AddOn Routes-------------------------------*/
router.post("/create",isAuth, addOnController.addOnRegister);
router.post("/update/:addOnId",isAuth, addOnController.updateAddOn);
router.post("/findAll",isAuth, addOnController.findAllAddOns);
module.exports = router;
