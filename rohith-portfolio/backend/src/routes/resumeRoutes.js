const router = require("express").Router();
const { resumeInfo, downloadResume } = require("../controllers/fileController");
router.get("/", resumeInfo);
router.get("/download", downloadResume);
module.exports = router;
