require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const profileRoutes = require("./routes/profileRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const messageRoutes = require("./routes/messageRoutes");
const visitorRoutes = require("./routes/visitorRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const adminRoutes = require("./routes/adminRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
app.set("trust proxy", 1);
// Behind Cloudflare the TCP peer is Cloudflare's edge; the visitor's real IP is in CF-Connecting-IP.
app.use((req, res, next) => {
  const cf = req.get("cf-connecting-ip");
  if (cf) Object.defineProperty(req, "ip", { value: cf, configurable: true });
  next();
});

const origins = (process.env.CORS_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
app.use(
  cors({
    origin: origins.length ? origins : true, // no list configured → allow all (dev)
    exposedHeaders: ["Content-Disposition"]
  })
);
// Resume PDF is shown in an <iframe> on the portfolio, so allow framing from allowed origins.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    frameguard: false, // replaced by CSP frame-ancestors below
    contentSecurityPolicy: {
      directives: { "frame-ancestors": ["'self'", ...(origins.length ? origins : ["*"])] }
    }
  })
);
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "100kb" }));

const publicLimiter = rateLimit({ windowMs: 60 * 1000, limit: 120, standardHeaders: true, legacyHeaders: false });
const writeLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false,
  message: { success: false, error: "Too many requests, please try again later." } });

app.get("/", (req, res) => res.json({ success: true, message: "Portfolio backend running" }));
app.get("/health", (req, res) => res.json({ ok: true, uptime: process.uptime() }));

app.use("/api/profile", publicLimiter, profileRoutes);
app.use("/api/resume", publicLimiter, resumeRoutes);
app.use("/api/messages", writeLimiter, messageRoutes);   // contact form: 10 / hour / IP
app.use("/api/visitors", publicLimiter, visitorRoutes);
app.use("/api/analytics", publicLimiter, analyticsRoutes);
app.use("/api/admin", adminRoutes);                      // protected by x-admin-key

app.use((req, res) => res.status(404).json({ success: false, error: "Not found" }));
app.use(errorHandler);

module.exports = app;
