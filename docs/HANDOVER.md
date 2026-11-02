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
│   ├── seed.js                  # Idempotent seed script for initial owner & data
│   ├── index.js                 # Express server bootstrap, rate limiting & SSE endpoint
│   └── routes/
│       ├── adminRoutes.js       # Secured admin endpoints with audit trails
│       ├── authRoutes.js        # Login, logout, session verification
│       └── publicRoutes.js      # Public cached endpoints & /q/:code redirect engine
├── tests/                        # Automated Playwright test suites
│   ├── audit-runner.js          # Full 45-point comprehensive audit suite
│   ├── smoke.js                 # 8-point rapid CI smoke test runner (<10s)
│   └── smoke.spec.js            # Standard Playwright test specification
├── scripts/                      # Operational CLI utilities
│   ├── reset-password.js        # CLI owner password reset tool
│   ├── static-checks.js         # Security, asset, and syntax auditor
│   └── clean-test-data.js       # Test artifact cleanup utility
├── docs/                         # Handover, guides, and architectural documentation
│   ├── HANDOVER.md              # This technical guide
│   ├── ADMIN_GUIDE.md           # Non-technical restaurant owner operations guide
│   ├── AUDIT_REPORT.md          # Complete test evidence and defect log
│   ├── INVENTORY.md             # Complete routes, endpoints, and schema inventory
│   ├── design-reference/        # Original Figma/spec design mockups
│   └── screenshots/             # Showcase screenshot assets
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
| `ALLOWED_ORIGIN` | Server | Optional | `http://localhost:5173` | Allowed CORS origin for browser API requests. Set to production domain in production. |
| `DATABASE_URL` | Server | Optional | *(empty)* | PostgreSQL connection URI (`postgres://user:pass@host:5432/dbname`). If omitted, server automatically falls back to local SQLite at `data/restaurant.db`. |
| `ADMIN_EMAIL` | Server | Required | `owner@amolvegresto.com` | Initial owner account email seeded on the first boot. |
| `ADMIN_INITIAL_PASSWORD` | Server | Required | `Admin@12345` | Initial owner password seeded on first boot. Ignored once owner record exists. |
| `SESSION_SECRET` | Server | Required | `amol_restaurant_super_secret_session_key_2026` | High-entropy secret key used to sign CSRF tokens and session hashes. |
| `IP_HASH_SALT` | Server | Required | `amol_qr_salt_secure_2026` | Cryptographic salt used to anonymize client IP addresses before logging scan events. |
| `CLOUDINARY_CLOUD_NAME` | Server | Required | *(placeholder)* | Cloudinary cloud identifier for media uploads. |
| `CLOUDINARY_API_KEY` | Server | Required | *(placeholder)* | Cloudinary API Key. |
| `CLOUDINARY_API_SECRET` | Server | Required | *(placeholder)* | Cloudinary API Secret (server-side only, never expose to client). |
| `GEMINI_API_KEY` | Server | Required | *(placeholder)* | Google Gemini API Key for AI review enhancement. |
| `RATE_LIMIT_PER_MIN` | Server | Optional | `12` | Maximum AI review generation requests allowed per minute per client IP. |
| `RATE_LIMIT_PER_DAY` | Server | Optional | `100` | Maximum daily review generation requests allowed per client IP. |

---

## 3. Database Operations & Dual-Engine Architecture

The database client (`server/db.js`) features a resilient dual-engine design:
1. **PostgreSQL**: Activated automatically when `DATABASE_URL` is configured in `.env`. Utilizes `pg.Pool` with connection pooling, native transactions, and indexed queries.
2. **SQLite**: Activated automatically when `DATABASE_URL` is absent. Uses Node's built-in `node:sqlite` (`DatabaseSync`) stored at `data/restaurant.db`. Enables zero-dependency local development and testing.

### Key Operations:
- **Run Migrations**: `npm run migrate` executes `server/migrations.js` to establish all 18 tables and indexes with `IF NOT EXISTS`.
- **Seed Baseline Data**: `npm run seed` executes `server/seed.js` idempotently (will not overwrite existing records).
- **SQLite Database Backup**: Back up the single file `data/restaurant.db`.
- **Switching from SQLite to PostgreSQL**: Provide a valid `DATABASE_URL` in `.env` and execute `npm run migrate && npm run seed`. All query wrappers automatically adapt `$1, $2` parameterized syntaxes seamlessly.

---

## 4. Authentication, Sessions & Security Model

- **Password Hashing**: Uses `bcryptjs` with salt rounds = 12 (or Argon2id).
- **Session Tokens**: Cryptographically random 64-character hexadecimal tokens stored in the `sessions` table.
- **Session Cookie**: Cookie name `amol_admin_session`. Properties: `httpOnly: true`, `Secure: true` (in production), `SameSite: Strict`, rolling 7-day expiration.
- **CSRF Protection**: All non-GET admin mutations require an active session plus a matching `x-csrf-token` header generated on login.
- **Rate Limiting**:
  - Admin login: 5 failed attempts per 15 minutes per IP+email, resulting in a temporary HTTP 429 lockout.
  - Review AI generation: 12 requests/minute, 100 requests/day per IP.
  - QR scan tracking: 30 requests/minute per IP with automated 30s deduplication.
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
4. Server deletes deprecated assets from Cloudinary when dishes, gallery items, or videos are updated or deleted (`server/cloudinary.js`).

---

## 6. AI Review Booster & Fallback Resilience

The AI review enhancement pipeline (`/api/generate-review`) utilizes Google Gemini (`gemini-2.5-flash` or `gemini-1.5-flash` via REST endpoint):
- **Streaming Pipeline**: Uses Server-Sent Events (SSE) `text/event-stream` for instantaneous token streaming (<5s completion).
- **Strict Guardrails**: Disallows arbitrary user prompts; strictly constructs prompts based on verified database options (`review_options`) and chosen star counts.
- **Resilience Fallback**: If network fails, Gemini API returns an error, or the model times out, the client immediately falls back to the local template phrase engine (`reviewTemplates.js`) with zero user disruption.

---

## 7. Production Deployment Runbook

### Recommended Targets:
- **Render / Railway / Fly.io / DigitalOcean App Platform** (Single web service container).
- **Ubuntu VPS (Nginx + PM2)**.

### Build and Start Commands:
- **Build Command**: `npm run build`
- **Start Command**: `npm run server`

### Standard Reverse Proxy Configuration (Nginx):
```nginx
server {
    listen 80;
    server_name amolvegresto.com;

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

- **Lost Owner Password**: Run `npm run reset-password` via SSH/CLI. You will be prompted to enter a new password without needing the database console.
- **Rotating SESSION_SECRET**: Update `SESSION_SECRET` in `.env` and restart the server. Existing sessions will expire gracefully, requiring the owner to log in again.
- **Database Maintenance**: Check integrity with `npm run test`.

