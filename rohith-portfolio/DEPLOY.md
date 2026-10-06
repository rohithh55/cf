# Deploying: Cloudflare Pages + separate backend + separate database

> **Why the backend isn't "on Cloudflare":** Cloudflare Pages hosts static sites. Your API is Express + Prisma + Postgres,
> which needs a normal Node server, so it runs on a Node host while Cloudflare sits in front for DNS/SSL/CDN.
> (Running the API *on* Cloudflare Workers would mean rewriting it for D1/Hyperdrive — doable, but a different project.)

Do the steps **in this order** — each one gives you a value the next one needs.

---
## 1. Database → Neon (free Postgres)
1. Create a project at neon.tech. Copy the connection string (it ends in `?sslmode=require`).
2. On your laptop:
   ```bash
   cd database
   cp .env.example .env          # paste the Neon string into DATABASE_URL
   npm install
   npm run setup                 # creates all tables, loads your profile, stores the resume PDF in the DB
   ```
3. Check: `npm run studio` → you should see `profile`, `experiences`, `files` (1 resume), etc.

Re-run `npm run setup` any time you change `schema.prisma` or `seed.js` (it rewrites profile content, keeps messages/analytics, and only adds the resume if the PDF changed).

## 2. Backend → Render (or Railway / Fly.io)
Push this whole repo to GitHub, then on Render → **New Web Service** → pick the repo:

| Setting | Value |
|---|---|
| Root Directory | *(leave empty — the backend needs `database/prisma/schema.prisma`)* |
| Build Command | `cd backend && npm install` |
| Start Command | `cd backend && npm start` |
| Health Check Path | `/health` |

*(Docker instead? Runtime = Docker, Dockerfile path `backend/Dockerfile`, context = repo root.)*

Environment variables:
```
NODE_ENV=production
DATABASE_URL=<Neon string>
ADMIN_API_KEY=<long random string — e.g. run: openssl rand -hex 32>
CORS_ORIGINS=https://rohith-portfolio.pages.dev,https://yourdomain.com,https://www.yourdomain.com
```
Test: `curl https://<your-service>.onrender.com/health` → `{"ok":true,...}` and `/api/profile` returns your data.

**Custom API domain (recommended):** in Render add custom domain `api.yourdomain.com`; in Cloudflare DNS add
`CNAME api → <your-service>.onrender.com` with the orange cloud **on**, and set SSL/TLS mode to **Full (strict)**.

> Free Render services sleep when idle (first request ~30 s). The site still shows all content immediately from its built-in copy; only the contact form / live data wait for the wake-up. A $7 plan or Railway/Fly removes this.

## 3. Frontend → Cloudflare Pages
1. Edit `frontend/config.js`:
   ```js
   window.PORTFOLIO_PROD_API = "https://api.yourdomain.com/api";
   ```
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** → pick the repo:

   | Setting | Value |
   |---|---|
   | Framework preset | None |
   | Build command | *(empty)* |
   | Build output directory | `frontend` |

   (No Git? `npm install && npx wrangler login && npm run deploy:frontend` — `wrangler.toml` already points at `frontend`.)
3. **Custom domains** → add `yourdomain.com` / `www`. Cloudflare creates the DNS records for you.
4. Go back to the backend and make sure `CORS_ORIGINS` contains exactly the URLs the site is served from (the `*.pages.dev` one and your custom domain, `https://`, no trailing slash). Redeploy the backend after changing it.

## 4. Verify
- Open the site → DevTools → Network: `GET /api/profile` should be **200**.
- Click **View Resume** → PDF loads from `…/api/resume/download?inline=1`.
- Send a test message from the contact form, then:
  ```bash
  curl https://api.yourdomain.com/api/admin/stats -H "x-admin-key: $ADMIN_API_KEY"
  ```

## Day-to-day
| I want to… | Do this |
|---|---|
| Change the resume | `curl -X POST https://api.yourdomain.com/api/admin/files -H "x-admin-key: $KEY" -F kind=RESUME -F file=@Rohith_Reddy_Resume.pdf` (live instantly; also replace `frontend/Rohith_Reddy_Resume.pdf` for the offline fallback) |
| Add/edit a job, project, skill | `POST/PUT /api/admin/experiences`, `/projects`, `/skills`… (see API list) — or edit `database/prisma/seed.js` and run `npm run seed` |
| Read contact messages | `GET /api/admin/messages` with the admin key |
| Change the database schema | edit `database/prisma/schema.prisma` → `cd database && npm run push` → redeploy backend |
| Change site design/text | edit `frontend/index.html` → git push (Pages redeploys automatically) |

## API reference
Public: `GET /api/profile`, `GET /api/resume`, `GET /api/resume/download[?inline=1]`, `POST /api/messages`, `POST /api/visitors`, `POST /api/analytics/page-view`, `POST /api/analytics/download`.
Admin (header `x-admin-key`): `/api/admin/stats`, `/messages`, `/files`, `/profile`, `/experiences`, `/projects`, `/skills`, `/education`, `/certifications`.

## Notes
- Keep `ADMIN_API_KEY` secret; anyone with it can edit your site content.
- Each part has its own `.env` — never commit them (already git-ignored).
- The backend reads the visitor's real IP from Cloudflare's `CF-Connecting-IP` header, so analytics and rate limiting work correctly behind the proxy.
