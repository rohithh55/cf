const express = require("express");
const router = express.Router();

const {
  trackVisitor
} = require("../controllers/visitorController");

router.post("/", trackVisitor);

module.exports = router;
