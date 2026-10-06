const prisma = require("../lib/prisma");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");

// Whitelisted fields per model so the admin API can't write arbitrary columns.
const FIELDS = {
  experience:    ["company", "role", "location", "startDate", "endDate", "isCurrent", "bullets", "tags", "sortOrder"],
  project:       ["title", "description", "bullets", "tags", "status", "liveUrl", "repoUrl", "sortOrder"],
  skillGroup:    ["category", "icon", "items", "sortOrder"],
  education:     ["degree", "institution", "graduationYear", "sortOrder"],
  certification: ["name", "status", "issuer", "sortOrder"]
};
const DATES = ["startDate", "endDate"];

const pick = (model, body) => {
  const out = {};
  for (const f of FIELDS[model]) {
    if (body[f] === undefined) continue;
    out[f] = DATES.includes(f) && body[f] ? new Date(body[f]) : body[f];
  }
  return out;
};

// builds list/create/update/remove handlers for one model
exports.crud = (model) => ({
  list: asyncHandler(async (req, res) => res.json({ success: true, data: await prisma[model].findMany({ orderBy: { sortOrder: "asc" } }) })),
  create: asyncHandler(async (req, res) => {
    const data = pick(model, req.body);
    if (!Object.keys(data).length) throw new HttpError(400, "No valid fields provided");
    res.status(201).json({ success: true, data: await prisma[model].create({ data }) });
  }),
  update: asyncHandler(async (req, res) =>
    res.json({ success: true, data: await prisma[model].update({ where: { id: Number(req.params.id) }, data: pick(model, req.body) }) })),
  remove: asyncHandler(async (req, res) => {
    await prisma[model].delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  })
});

const PROFILE_FIELDS = ["fullName", "title", "headline", "summary", "about", "email", "phone", "location", "linkedin", "github", "website", "liveProject", "availability"];
exports.updateProfile = asyncHandler(async (req, res) => {
  const data = {};
  for (const f of PROFILE_FIELDS) if (req.body[f] !== undefined) data[f] = req.body[f];
  const existing = await prisma.profile.findFirst();
  const profile = existing
    ? await prisma.profile.update({ where: { id: existing.id }, data })
    : await prisma.profile.create({ data });
  res.json({ success: true, data: profile });
});
