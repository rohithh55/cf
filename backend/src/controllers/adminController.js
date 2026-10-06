const prisma = require("../lib/prisma");
const asyncHandler = require("../utils/asyncHandler");

exports.getStats = asyncHandler(async (req, res) => {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalVisitors, totalMessages, unreadMessages, totalPageViews, totalDownloads,
         visitors7d, topSections, downloadsByType, devices, recentMessages] = await Promise.all([
    prisma.visitor.count(),
    prisma.message.count(),
    prisma.message.count({ where: { isRead: false } }),
    prisma.pageVisit.count(),
    prisma.download.count(),
    prisma.visitor.count({ where: { createdAt: { gte: since } } }),
    prisma.pageVisit.groupBy({ by: ["pageName"], _count: { _all: true }, orderBy: { _count: { pageName: "desc" } }, take: 10 }),
    prisma.download.groupBy({ by: ["downloadType"], _count: { _all: true } }),
    prisma.visitor.groupBy({ by: ["device"], _count: { _all: true } }),
    prisma.message.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, name: true, email: true, subject: true, createdAt: true, isRead: true } })
  ]);

  res.json({
    success: true,
    data: {
      totalVisitors, totalMessages, unreadMessages, totalPageViews, totalDownloads, visitorsLast7Days: visitors7d,
      topSections: topSections.map((s) => ({ section: s.pageName, views: s._count._all })),
      downloadsByType: downloadsByType.map((d) => ({ type: d.downloadType, count: d._count._all })),
      devices: devices.map((d) => ({ device: d.device || "unknown", count: d._count._all })),
      recentMessages
    }
  });
});

exports.listMessages = asyncHandler(async (req, res) => {
  const where = req.query.unread === "1" ? { isRead: false } : {};
  const messages = await prisma.message.findMany({ where, orderBy: { createdAt: "desc" }, take: 200 });
  res.json({ success: true, data: messages });
});

exports.markRead = asyncHandler(async (req, res) => {
  const m = await prisma.message.update({ where: { id: Number(req.params.id) }, data: { isRead: req.body.isRead !== false } });
  res.json({ success: true, data: m });
});

exports.deleteMessage = asyncHandler(async (req, res) => {
  await prisma.message.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});
