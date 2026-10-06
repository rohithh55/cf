# Rohith Reddy — Portfolio

Three independent parts. Deploy each one separately (see **DEPLOY.md**).

```
rohith-portfolio/
├── frontend/     → Cloudflare Pages   (static site + resume PDF)
│   ├── index.html
│   ├── config.js                 ← set your backend URL here
│   ├── _headers
│   └── Rohith_Reddy_Resume.pdf   (fallback copy)
│
├── backend/      → Node host (Render / Railway / Fly / EC2)   (Express API)
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── database/     → Postgres (Neon / Supabase / RDS)   (schema + seed, run from your laptop)
│   ├── prisma/schema.prisma
│   ├── prisma/seed.js            ← loads profile data + stores the resume in the DB
│   ├── assets/Rohith_Reddy_Resume.pdf
│   ├── docker-compose.yml        (local Postgres)
│   ├── package.json
│   └── .env.example
│
├── wrangler.toml   (Cloudflare Pages config → output dir: frontend)
├── render.yaml     (backend blueprint for Render)
├── package.json    (helper scripts: npm run deploy:frontend)
└── DEPLOY.md
```

How they talk: `Browser → Cloudflare Pages (frontend)` → calls `https://api.yourdomain.com/api` → `backend` → `Postgres`.

## Run everything locally
```bash
cd database && cp .env.example .env && docker compose up -d && npm install && npm run setup
cd ../backend && cp .env.example .env   # set DATABASE_URL to the local one, ADMIN_API_KEY to anything
npm install && npm run dev              # http://localhost:5000
cd ../frontend && npx serve .           # http://localhost:3000
```
(For local use set `CORS_ORIGINS="http://localhost:3000"` and `NODE_ENV=development` in backend/.env.)
