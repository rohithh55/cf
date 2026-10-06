const crypto = require("crypto");
const prisma = require("../lib/prisma");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");

const KINDS = ["RESUME", "CERTIFICATE", "DOCUMENT", "IMAGE"];
const noData = { id: true, kind: true, filename: true, mimeType: true, sizeBytes: true, sha256: true, version: true, isActive: true, createdAt: true };

// ── public ──
exports.resumeInfo = asyncHandler(async (req, res) => {
  const file = await prisma.storedFile.findFirst({ where: { kind: "RESUME", isActive: true }, select: noData });
  if (!file) throw new HttpError(404, "No resume uploaded yet");
  res.json({ success: true, data: file });
});

// GET /api/resume/download            → forces download
// GET /api/resume/download?inline=1   → shows in browser (used by the "View Resume" modal)
// optional ?visitorId=12              → records the download against that visitor
exports.downloadResume = asyncHandler(async (req, res) => {
  const file = await prisma.storedFile.findFirst({ where: { kind: "RESUME", isActive: true } });
  if (!file) throw new HttpError(404, "No resume uploaded yet");

  const inline = req.query.inline === "1";
  const visitorId = Number(req.query.visitorId) || null;

  // fire-and-forget; a failed analytics insert must never block the download
  prisma.visitor
    .findUnique({ where: { id: visitorId || -1 }, select: { id: true } })
    .then((v) => prisma.download.create({
      data: { visitorId: v ? v.id : null, fileId: file.id, downloadType: inline ? "resume_view" : "resume_download" }
    }))
    .catch((e) => console.error("download tracking failed:", e.message));

  res.set({
    "Content-Type": file.mimeType,
    "Content-Length": file.sizeBytes,
    "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${file.filename}"`,
    "Cache-Control": "no-cache",
    ETag: `"${file.sha256}"`
  });
  res.end(file.data);
});

// ── admin ──
exports.listFiles = asyncHandler(async (req, res) => {
  const where = req.query.kind ? { kind: String(req.query.kind).toUpperCase() } : {};
  const files = await prisma.storedFile.findMany({ where, select: noData, orderBy: { createdAt: "desc" } });
  res.json({ success: true, data: files });
});

// POST /api/admin/files   multipart/form-data: file=<binary>, kind=RESUME|CERTIFICATE|DOCUMENT|IMAGE
exports.uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) throw new HttpError(400, "Attach a file in the 'file' field");
  const kind = String(req.body.kind || "DOCUMENT").toUpperCase();
  if (!KINDS.includes(kind)) throw new HttpError(400, `kind must be one of ${KINDS.join(", ")}`);
  if (kind === "RESUME" && req.file.mimetype !== "application/pdf") throw new HttpError(400, "Resume must be a PDF");

  const sha256 = crypto.createHash("sha256").update(req.file.buffer).digest("hex");

  const saved = await prisma.$transaction(async (tx) => {
    const last = await tx.storedFile.findFirst({ where: { kind }, orderBy: { version: "desc" }, select: { version: true } });
    const makeActive = kind === "RESUME";
    if (makeActive) await tx.storedFile.updateMany({ where: { kind: "RESUME", isActive: true }, data: { isActive: false } });
    return tx.storedFile.create({
      data: {
        kind,
        filename: req.file.originalname.replace(/[^\w.\- ]/g, "_"),
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
        sha256,
        version: (last?.version || 0) + 1,
        isActive: makeActive,
        data: req.file.buffer
      },
      select: noData
    });
  });

  res.status(201).json({ success: true, data: saved });
});

// PATCH /api/admin/files/:id/activate → roll back / switch to an older resume version
exports.activateFile = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const file = await prisma.storedFile.findUniqueOrThrow({ where: { id } });
  if (file.kind !== "RESUME") throw new HttpError(400, "Only resumes can be activated");
  await prisma.$transaction([
    prisma.storedFile.updateMany({ where: { kind: "RESUME" }, data: { isActive: false } }),
    prisma.storedFile.update({ where: { id }, data: { isActive: true } })
  ]);
  res.json({ success: true });
});

exports.deleteFile = asyncHandler(async (req, res) => {
  await prisma.storedFile.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

// GET /api/admin/files/:id/download → admin can fetch any stored file
exports.adminDownload = asyncHandler(async (req, res) => {
  const file = await prisma.storedFile.findUniqueOrThrow({ where: { id: Number(req.params.id) } });
  res.set({ "Content-Type": file.mimeType, "Content-Disposition": `attachment; filename="${file.filename}"` });
  res.end(file.data);
});
