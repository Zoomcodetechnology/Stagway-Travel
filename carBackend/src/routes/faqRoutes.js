const express = require("express");
const router = express.Router();
const faqController = require("../controller/faqController");
const { isAuth } = require("../utils/auth");

/*--------------------------------FAQ Routes-------------------------------*/
router.post("/create",isAuth, faqController.createFaq);
router.post("/remove/:faqId",isAuth, faqController.removeFaq);
router.post("/findAll",isAuth, faqController.findAllFaqs);
router.post("/update",isAuth, faqController.updateFaqs);

module.exports = router;
