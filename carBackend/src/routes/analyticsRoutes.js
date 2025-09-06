const express = require('express');
const router = express.Router();
const { isAuth }= require("../utils/auth");
const AnalyticsController = require("../controller/analyticsController");
/*--------------------------------admin Analytics Routes-------------------------------*/

router.post("/fetchAnalytics", isAuth, AnalyticsController.getAdminAnalytics);
module.exports = router;