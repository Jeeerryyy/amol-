# Technical Handover Guide: Amol Veg Resto Platform

This document is the primary architectural and operational handover reference for engineering teams, system administrators, and agencies maintaining or deploying the **Amol Veg Resto** unified hospitality codebase.

---

## 1. Project Directory Structure

```
amol-veg-resto/
├── public/                       # Static public assets served verbatim
│   ├── hero-video.mp4           # Looping background video for landing hero
│   ├── logo.png                 # Primary brand emblem
│   ├── images/                  # Botanical leaf art, sketch, and footer illustrations
│   └── menu/                    # Standalone high-speed digital menu application
│       ├── index.html           # Pure vanilla JS + semantic HTML view-only menu
│       ├── hero-video.mp4       # Video asset for menu banner
│       └── restaurant_menu_data.json # Bundled zero-network fallback dataset
├── src/                          # Main React 18 + TypeScript application
│   ├── admin/                   # Owner-only Admin Panel CMS
│   │   ├── adminApi.ts          # Authenticated fetch client with CSRF token handling
│   │   ├── AdminApp.tsx         # Root admin application router & session gate
│   │   ├── AdminDashboard.tsx   # Analytics, scan KPIs, peak hours & review stats
│   │   ├── AdminLayout.tsx      # Responsive desktop sidebar / mobile drawer shell
│   │   ├── AdminLogin.tsx       # Rate-limited authentication screen
│   │   ├── AdminMenus.tsx       # Categories, dishes, variants & video management
│   │   ├── AdminQRCodes.tsx     # Dynamic QR management & PDF generator
│   │   ├── AdminReviews.tsx     # Review options chips & Google URL settings
│   │   ├── AdminSettings.tsx    # Owner credentials, pricing & data exports
│   │   └── AdminWebsite.tsx     # Popular dishes, gallery, footer & legal pages
│   ├── components/              # Public reusable UI components (Hero, Navbar, Gallery, etc.)
│   ├── pages/                   # Public sub-pages (About, Gallery, Contact, Legal, Review)
│   ├── styles/tokens.css        # Shared brand design tokens and typography
│   ├── siteConfig.ts            # Bundled fallback site configuration
│   ├── App.tsx                  # Public application router & URL hash dispatcher
│   └── main.tsx                 # React DOM entry point
├── server/                       # Unified Express 5 backend server
│   ├── aiClient.js              # Google Gemini AI streaming integration
│   ├── auth.js                  # Argon2id/Bcrypt hashing, sessions & CSRF middleware
│   ├── cloudinary.js            # Signed upload signature generation & asset deletion
│   ├── db.js                    # Dual-engine DB client (Postgres & node:sqlite)
│   ├── migrations.js            # DDL database migration runner with index definitions
│   ├── pricing.js               # Dynamic pricing engine (markup & rounding)
│   ├── qrGenerator.js           # PNG, SVG & A5 print PDF generator (PDFKit)
│   ├── db/
│   │   ├── connection.js        # Dual-engine PostgreSQL/SQLite query & fallback wrapper
│   │   ├── migrations.js        # 21-table DDL & index initializer
│   │   └── seed.js              # Idempotent seed script for initial owner & data
│   ├── index.js                 # Express server bootstrap, CORS, trust proxy & SPA fallback
│   ├── middleware/              # Auth/CSRF, rate limiters, security headers, error handler
│   ├── services/                # Pricing, Cloudinary, QR/PDFKit, CSV/JSON export, Gemini AI
│   └── routes/
│       ├── adminRoutes.js       # Secured admin endpoints with CSRF & sanitization
│       ├── authRoutes.js        # Login, logout, session check, credential updates
│       └── publicRoutes.js      # Public cached endpoints, /contact & /q/:code redirects
├── tests/                        # Automated Node & Playwright test suites
│   ├── security-and-integrity.test.mjs # Unit, security & API integration suite (test:unit)
│   ├── audit-runner.js          # Full E2E audit suite
│   ├── smoke.js                 # Rapid Playwright smoke test runner (<10s)
│   └── smoke.spec.js            # Playwright smoke wrapper
├── scripts/                      # Operational CLI utilities
│   ├── reset-password.js        # CLI owner password reset tool
│   ├── static-checks.js         # Security, asset, and syntax auditor
│   ├── prerender-menu.mjs       # Static menu HTML & JSON-LD prerenderer
│   └── validate-schema.mjs      # Schema.org JSON-LD validator
├── docs/                         # Handover, guides, and architectural documentation
│   ├── HANDOVER.md              # This technical guide
│   ├── ADMIN_GUIDE.md           # Non-technical restaurant owner operations guide
│   ├── AUDIT_REPORT.md          # Complete test evidence and defect log
│   ├── INVENTORY.md             # Complete routes, endpoints, and schema inventory
│   ├── design-reference/        # Original Figma/spec design mockups
│   └── screenshots/             # Showcase screenshot assets
├── .github/workflows/ci.yml      # GitHub Actions verification workflow
├── .env.example                 # Environment configuration template
├── package.json                 # Project dependencies & operational scripts
├── tsconfig.json                # TypeScript project configuration
└── vite.config.ts               # Vite bundler, proxy & dev server settings
```

---

## 2. Environment Variables Reference

Copy `.env.example` to `.env` in the project root. Secrets must never be committed to source control.

| Variable | Scope | Required | Default | Description |
|---|---|---|---|---|
| `PORT` | Server | Optional | `3001` | Port on which the unified Express server listens. |
| `ALLOWED_ORIGIN` | Server | Optional | `http://localhost:5173` | Allowed CORS origins (comma-separated) for browser API requests. |
| `DATABASE_URL` | Server | Optional | *(empty)* | PostgreSQL connection URI (`postgres://user:pass@host:5432/dbname`). If omitted, server automatically falls back to local SQLite at `data/restaurant.db`. |
| `ADMIN_EMAIL` | Server | Required | `owner@amolvegresto.in` | Initial owner account email seeded on the first boot. |
| `ADMIN_INITIAL_PASSWORD` | Server | Required | `Admin@nirvanaa26` | Initial owner password seeded on first boot. Ignored once owner record exists. |
| `IP_HASH_SALT` | Server | Required | `amol_qr_salt_secure_2026` | Cryptographic salt used to anonymize client IP addresses before logging scan events. |
| `CLOUDINARY_CLOUD_NAME` | Server | Optional | *(empty)* | Cloudinary cloud identifier for media uploads. |
| `CLOUDINARY_API_KEY` | Server | Optional | *(empty)* | Cloudinary API Key. |
| `CLOUDINARY_API_SECRET` | Server | Optional | *(empty)* | Cloudinary API Secret (server-side only, never expose to client). |
| `AI_API_KEY` | Server | Optional | *(empty)* | Google Gemini API Key for AI review enhancement (falls back gracefully to templates if unset). |
| `AI_MODEL` | Server | Optional | `gemini-2.5-flash` | Gemini model ID used by the review polish pipeline. |
| `RATE_LIMIT_PER_MIN` | Server | Optional | `12` | Maximum AI review generation requests allowed per minute per client IP. |
| `RATE_LIMIT_PER_DAY` | Server | Optional | `100` | Maximum daily AI review generation requests allowed per client IP. |
| `SITE_URL` | Server | Optional | `https://amolvegresto.in` | Canonical site URL for QR code URLs and CORS allowlist. |
| `GOOGLE_SITE_VERIFICATION` | Build | Optional | *(empty)* | Optional Google Search Console verification meta tag injected during build. |
| `BING_SITE_VERIFICATION` | Build | Optional | *(empty)* | Optional Bing Webmaster verification meta tag injected during build. |

---

## 3. Database Operations & Dual-Engine Architecture

The database client (`server/db/connection.js`) features a resilient dual-engine design:
1. **PostgreSQL**: Activated automatically when `DATABASE_URL` is configured in `.env`. Utilizes `pg.Pool` with connection pooling and parameterized queries (`$1, $2`).
2. **SQLite**: Activated automatically when `DATABASE_URL` is absent (or unreachable on startup). Uses Node's built-in `node:sqlite` (`DatabaseSync`) stored at `data/restaurant.db` (overrideable via `SQLITE_DB_PATH` for isolated test runs) and safely expands positional `$N` placeholders.

### Key Operations:
- **Run Migrations**: `npm run migrate` executes `server/db/migrations.js` to establish all 21 tables and indexes with `IF NOT EXISTS`.
- **Seed Baseline Data**: `npm run seed` executes `server/db/seed.js` idempotently (will not overwrite existing records).
- **SQLite Database Backup**: Back up the single file `data/restaurant.db`.
- **Switching from SQLite to PostgreSQL**: Provide a valid `DATABASE_URL` in `.env` and execute `npm run migrate && npm run seed`. All query wrappers adapt parameterized syntaxes safely across both engines.

---

## 4. Authentication, Sessions & Security Model

- **Password Hashing**: Uses `bcryptjs` with salt rounds = 12.
- **Session Tokens**: Cryptographically random 64-character hexadecimal tokens stored in the `sessions` table as `<token>:<csrf>` and validated via strict hex format checks + exact prefix matching (zero `LIKE` wildcard surface). Memory fallback checks expiration and activates only when DB is offline.
- **Session Cookie**: Cookie name `amol_admin_session`. Properties: `httpOnly: true`, `Secure: true` (in production), `SameSite: Strict`, rolling 7-day expiration.
- **CSRF Protection**: All non-GET admin mutations require an active session plus a matching `x-csrf-token` header generated on login. Password updates revoke all other active sessions.
- **CORS & Proxy**: Trust proxy enabled (`app.set('trust proxy', 1)`). CORS restricts origins to `ALLOWED_ORIGIN`, `SITE_URL`, Vercel deployment URLs (`VERCEL_URL` / `VERCEL_BRANCH_URL`), and localhost dev origins in non-production.
- **Rate Limiting**:
  - Admin login: 5 failed attempts per 15 minutes per IP+email, resulting in a temporary HTTP 429 lockout.
  - Review AI generation: 12 requests/minute, 100 requests/day per IP.
  - QR scan tracking: 30 requests/minute per IP.
  - QR asset downloads: 40 requests/minute per IP (authentication required).
  - Contact inquiries: 5 requests per 10 minutes per IP.
- **Security Headers**: Uniformly enforced via Express middleware:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains` (production)
  - `Content-Security-Policy` scoped to `/admin` and `/api/admin/*`.

---

## 5. Media Pipeline: Cloudinary Direct Uploads

To avoid server memory exhaustion and bypass proxy upload limits, media uploads follow a **direct browser-to-cloud signed architecture**:
1. Client requests a cryptographic upload signature from `POST /api/admin/cloudinary-sign` (session required).
2. Server validates folder whitelist (`restaurant/menu`, `restaurant/dishes`, `restaurant/gallery`, `restaurant/popular`, `restaurant/seo`) and returns a timestamped HMAC signature.
3. Client browser uploads directly to `https://api.cloudinary.com/v1_1/<cloud_name>/auto/upload` with live upload progress bar.
4. Server deletes deprecated assets from Cloudinary when dishes, gallery items, or videos are updated or deleted (`server/services/cloudinaryService.js`).

---

## 6. AI Review Booster & Fallback Resilience

The AI review enhancement pipeline (`POST /api/generate-review` / `POST /api/public/generate-review`) utilizes Google Gemini (`gemini-2.5-flash` via REST endpoint):
- **Streaming Pipeline**: Uses Server-Sent Events (SSE) `text/event-stream` for instantaneous token streaming (<5s completion).
- **Strict Guardrails**: Disallows arbitrary user prompts; strictly constructs prompts based on verified database options (`review_options`) and chosen star counts.
- **Resilience Fallback**: If network fails, Gemini API returns an error, or the model times out, the client immediately falls back to the local template phrase engine (`reviewTemplates.js`) with zero user disruption.

---

## 7. Production Deployment Runbook

### Recommended Targets:
- **Vercel** (`vercel.json` + serverless entrypoint `api/index.js`) or **Render** (`render.yaml`).
- **Ubuntu VPS (Nginx + PM2)** running `node server/index.js`.

### Build and Start Commands:
- **Build Command**: `npm run build`
- **Start Command**: `npm run server`

### Standard Reverse Proxy Configuration (Nginx):
```nginx
server {
    listen 80;
    server_name amolvegresto.in;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off; # Required for SSE streaming
    }
}
```

---

## 8. Operational Troubleshooting & Secret Rotation

- **Lost Owner Password**: Run `npm run reset-password` via SSH/CLI (`RESET_PASSWORD="..." npm run reset-password`).
- **Rotating Credentials / Revoking Sessions**: Update email/password in **Admin > Settings > Account** (`PUT /api/admin/auth/credentials`); updating the password automatically revokes all other active sessions.
- **Verification**: Run unit/security tests with `npm run test:unit`, typechecking with `npm run lint`, static checks with `node scripts/static-checks.js`, and Playwright smoke tests with `npm test`.

