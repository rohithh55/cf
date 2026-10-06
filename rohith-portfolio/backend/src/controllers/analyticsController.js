const prisma = require("../lib/prisma");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");

const int = (v, def = 0) => (Number.isFinite(Number(v)) ? Math.max(0, Math.round(Number(v))) : def);

exports.trackPageView = asyncHandler(async (req, res) => {
  const visitorId = Number(req.body.visitorId);
  const pageName = String(req.body.pageName || "").slice(0, 100);
  if (!visitorId || !pageName) throw new HttpError(400, "visitorId and pageName are required");

  const pageView = await prisma.pageVisit.create({
    data: {
      visitorId,
      pageName,
      timeSpent: int(req.body.timeSpent),
      clickCount: int(req.body.clickCount),
      referrer: req.body.referrer ? String(req.body.referrer).slice(0, 500) : null
    }
  });
  res.status(201).json({ success: true, data: pageView });
});

exports.trackDownload = asyncHandler(async (req, res) => {
  const visitorId = Number(req.body.visitorId);
  const downloadType = String(req.body.downloadType || "").slice(0, 50);
  if (!visitorId || !downloadType) throw new HttpError(400, "visitorId and downloadType are required");

  const download = await prisma.download.create({ data: { visitorId, downloadType } });
  res.status(201).json({ success: true, data: download });
});
