const router = require("express").Router();
const adminAuth = require("../middleware/adminAuth");
const upload = require("../middleware/upload");
const admin = require("../controllers/adminController");
const files = require("../controllers/fileController");
const { crud, updateProfile } = require("../controllers/contentController");

router.use(adminAuth); // everything below needs the x-admin-key header

// dashboard + inbox
router.get("/stats", admin.getStats);
router.get("/messages", admin.listMessages);
router.patch("/messages/:id/read", admin.markRead);
router.delete("/messages/:id", admin.deleteMessage);

// file storage (resume versions, certificates, documents…)
router.get("/files", files.listFiles);
router.post("/files", upload.single("file"), files.uploadFile);
router.get("/files/:id/download", files.adminDownload);
router.patch("/files/:id/activate", files.activateFile);
router.delete("/files/:id", files.deleteFile);

// profile content
router.put("/profile", updateProfile);
const resources = {
  experiences: "experience",
  projects: "project",
  skills: "skillGroup",
  education: "education",
  certifications: "certification"
};
for (const [path, model] of Object.entries(resources)) {
  const c = crud(model);
  router.get(`/${path}`, c.list);
  router.post(`/${path}`, c.create);
  router.put(`/${path}/:id`, c.update);
  router.delete(`/${path}/:id`, c.remove);
}

module.exports = router;
