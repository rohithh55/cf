const crypto = require("crypto");
const HttpError = require("../utils/httpError");

// Protects /api/admin/*. Client sends:  x-admin-key: <ADMIN_API_KEY>
module.exports = (req, res, next) => {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) return next(new HttpError(503, "ADMIN_API_KEY is not configured on the server"));

  const given = String(req.get("x-admin-key") || "");
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!ok) return next(new HttpError(401, "Unauthorized"));
  next();
};
