const prisma = require("../lib/prisma");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (v, max) => String(v ?? "").trim().slice(0, max);

exports.createMessage = asyncHandler(async (req, res) => {
  const name = clean(req.body.name, 100);
  const email = clean(req.body.email, 200);
  const subject = clean(req.body.subject, 200) || null;
  const message = clean(req.body.message, 5000);

  if (!name || !email || !message) throw new HttpError(400, "name, email and message are required");
  if (!EMAIL_RE.test(email)) throw new HttpError(400, "Please provide a valid email address");
  if (req.body.website) return res.status(201).json({ success: true }); // honeypot: bots fill hidden field

  const saved = await prisma.message.create({
    data: { name, email, subject, message, ipAddress: req.ip },
    select: { id: true, createdAt: true }
  });
  res.status(201).json({ success: true, data: saved });
});
