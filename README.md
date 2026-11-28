# Amol Veg Resto — Restaurant Website, Digital QR Menu & Admin Platform

Full-stack web platform for **Amol Veg Resto** (100% Pure Vegetarian Restaurant in Sakhar Peth, Solapur, Maharashtra). Built with **React 18 + TypeScript + Vite 6**, an **Express 5** unified API backend, **PostgreSQL** with automatic local **SQLite (`node:sqlite`)** fallback, a **prerendered static Digital Menu**, **dynamic QR code management**, and a **cookie/CSRF-authenticated Admin Portal**.

---

## Architecture Overview

```text
  Public SPA (React + Vite) ─────► /, /about, /gallery, /contact, /review, Legal
  Digital Menu (Static + Sync) ──► /menu/, /special-menu (public/menu/index.html)
  Admin Portal (Protected SPA) ──► /admin (Dashboard, QR Codes, Menus, Website, Reviews, Settings)
           │
           ▼
  Unified Express 5 API (server/index.js · api/index.js)
    ├── /api/public/*      Cached public content, menu feeds, review config, contact inquiries
    ├── /q/:code, /qr/:code Dynamic QR redirects + privacy-hashed device scan analytics
    ├── /api/admin/auth/*  HttpOnly session cookie + CSRF token authentication
    └── /api/admin/*       CRUD, QR PNG/SVG/A5 PDF export, CSV/JSON exports, pricing recalculation
           │
           ▼
  Dual Database Layer (server/db/connection.js)
    ├── Primary: PostgreSQL (pg via DATABASE_URL)
    └── Fallback: Built-in SQLite (data/restaurant.db via node:sqlite)
```

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend SPA** | React 18, TypeScript (`~5.7`), Vite 6, Lucide React |
| **Digital Menu** | Prerendered semantic HTML + vanilla JS (`public/menu/index.template.html`) |
| **Backend API** | Node.js, Express 5, Zod, `sanitize-html`, `bcryptjs`, `compression`, `cors` |
| **Database** | PostgreSQL (`pg`) with automatic `node:sqlite` fallback |
| **Media & Exports** | Cloudinary signed direct uploads, `qrcode`, `pdfkit` |
| **QA & SEO** | Playwright, `node:test`, Lighthouse, Schema.org JSON-LD validator |
| **Deployment** | Vercel (`vercel.json`, `api/index.js`) & Render (`render.yaml`) |

---

## Quick Start

### 1. Prerequisites
- **Node.js >= 22** (required for built-in `node:sqlite` fallback when `DATABASE_URL` is omitted)
- **npm >= 10**

### 2. Install & Configure
```bash
npm install
cp .env.example .env
```
Update `.env` with your `ADMIN_EMAIL`, `ADMIN_INITIAL_PASSWORD`, `ALLOWED_ORIGIN`, and optional `DATABASE_URL`, `AI_API_KEY`, and `CLOUDINARY_*` keys.

### 3. Run Database Migrations & Seed
```bash
npm run migrate
npm run seed
```
*(Migrations and seeding also run automatically on server startup.)*

### 4. Local Development
Run the backend server and Vite dev server together:
```bash
# Terminal 1 — Backend API (http://localhost:3001)
npm run server

# Terminal 2 — Frontend Dev Server (http://localhost:5173)
npm run dev
```

### 5. Production Build & Serve
```bash
npm run build
npm run server
```

---

## Available Scripts

| Script | Purpose |
| :--- | :--- |
| `npm run dev` | Start Vite frontend dev server on port `5173` (proxies `/api`, `/q`, `/qr` to `:3001`) |
| `npm run server` | Start unified Express 5 API & static server on `PORT` (default `3001`) |
| `npm run build` | Prerender `/menu/`, generate `sitemap.xml`, update `index.html`, run `tsc -b` & `vite build` |
| `npm run lint` | Run strict TypeScript typechecking (`tsc -b`) |
| `npm run seo:prerender` | Regenerate `public/menu/index.html`, `public/sitemap.xml`, and `index.html` |
| `npm run seo:validate` | Validate Schema.org JSON-LD in `index.html` and `public/menu/index.html` |
| `npm run test:unit` | Run automated unit, security & backend API integration tests (`node:test`) |
| `npm test` | Run Playwright smoke suite against running dev/staging server |
| `npm run test:admin` | Run Admin CRUD & live public sync Playwright verification suite |
| `npm run migrate` | Initialize all 21 database tables and indexes |
| `npm run seed` | Seed default owner account, QR codes, 24 categories, 280+ dishes, gallery & review config |
| `npm run reset-password` | Reset the owner password from CLI using `RESET_PASSWORD` or `ADMIN_INITIAL_PASSWORD` |

---

## Environment Variables

See [`.env.example`](.env.example) for the complete annotated template:

- **Server & Database:** `PORT`, `NODE_ENV`, `DATABASE_URL`, `DATABASE_SSL`, `ALLOWED_ORIGIN`, `SITE_URL`, `VITE_API_URL`
- **Admin & Security:** `ADMIN_EMAIL`, `ADMIN_INITIAL_PASSWORD`, `IP_HASH_SALT`
- **AI Review Polish:** `AI_API_KEY`, `AI_MODEL`, `RATE_LIMIT_PER_MIN`, `RATE_LIMIT_PER_DAY`
- **Cloudinary Media (optional):** `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- **Search Console Verification (optional build-time):** `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION`

---

## Documentation

- **System & Developer Handover:** [docs/HANDOVER.md](docs/HANDOVER.md)
- **Restaurant Owner Admin Guide:** [docs/ADMIN_GUIDE.md](docs/ADMIN_GUIDE.md)
- **Routes, API & Schema Inventory:** [docs/INVENTORY.md](docs/INVENTORY.md)
- **Engineering Audit Report:** [docs/AUDIT_REPORT.md](docs/AUDIT_REPORT.md)
- **Icon Attribution & Map:** [public/icons/README.md](public/icons/README.md)
