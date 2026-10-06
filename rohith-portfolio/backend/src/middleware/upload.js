const multer = require("multer");
const HttpError = require("../utils/httpError");

const ALLOWED = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "image/webp"
]);

// Files are kept in memory, then written to Postgres (see fileController).
module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 }, // 5 MB
  fileFilter: (req, file, cb) =>
    ALLOWED.has(file.mimetype)
      ? cb(null, true)
      : cb(new HttpError(415, "Only PDF, DOCX, PNG, JPG or WEBP files are allowed"))
});
