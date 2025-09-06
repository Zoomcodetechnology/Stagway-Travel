const express = require("express");
const router = express.Router();
const promoCodeController = require("../controller/promoCodeController");
const { isAuth } = require("../utils/auth");

/*--------------------------------PromoCode Routes-------------------------------*/
router.post("/create",isAuth, promoCodeController.createPromoCode);
router.post("/update/:promoCodeId",isAuth, promoCodeController.updatePromoCode);
router.post("/remove/:promoCodeId",isAuth, promoCodeController.removePromoCode);
router.post("/findAll",isAuth, promoCodeController.findAllPromoCodes);

module.exports = router;
