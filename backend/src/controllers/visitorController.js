const prisma = require("../lib/prisma");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("../utils/asyncHandler");

const clean = (v, max = 300) => (v == null ? null : String(v).slice(0, max));

exports.trackVisitor = asyncHandler(async (req, res) => {
  const { browser, device, os, country, city } = req.body;
  const visitor = await prisma.visitor.create({
    data: {
      visitorUuid: uuidv4(),
      ipAddress: req.ip,
      browser: clean(browser),
      device: clean(device, 50),
      os: clean(os, 100),
      country: clean(country, 100),
      city: clean(city, 100)
    },
    select: { id: true, visitorUuid: true, createdAt: true }
  });
  res.status(201).json({ success: true, data: visitor });
});
