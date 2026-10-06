const prisma = require("../lib/prisma");
const asyncHandler = require("../utils/asyncHandler");

// One call → everything the portfolio page needs.
exports.getProfile = asyncHandler(async (req, res) => {
  const [profile, experiences, projects, skillGroups, education, certifications, resume] = await Promise.all([
    prisma.profile.findFirst(),
    prisma.experience.findMany({ orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }] }),
    prisma.project.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.skillGroup.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.education.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.certification.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.storedFile.findFirst({
      where: { kind: "RESUME", isActive: true },
      select: { id: true, filename: true, version: true, sizeBytes: true, createdAt: true }
    })
  ]);

  res.set("Cache-Control", "public, max-age=60");
  res.json({ success: true, data: { profile, experiences, projects, skillGroups, education, certifications, resume } });
});
