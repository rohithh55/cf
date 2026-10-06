const express = require("express");
const router = express.Router();

const {
  trackPageView,
  trackDownload
} = require("../controllers/analyticsController");

router.post("/page-view", trackPageView);
router.post("/download", trackDownload);

module.exports = router;
