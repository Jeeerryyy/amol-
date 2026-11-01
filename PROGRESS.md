# AMOL VEG RESTO - Admin Panel & Headless CMS Implementation Progress

## Implementation Checklist & Status

### Phase 1: Foundation, DB, Auth, Admin Shell, Cloudinary Uploader
- [x] DB Schema definition with real indexes (Postgres `pg.Pool` & SQLite `node:sqlite` dual-engine support)
- [x] Database migration engine & runner (`server/migrations.sql`, `server/migrations.js`)
- [x] Idempotent seed script (`server/seed.js` seeding owner, settings, 22 dishes, popular dishes, gallery, legal, SEO)
- [x] Password hashing (bcrypt cost 12 / argon2id) & CLI reset script (`scripts/reset-password.js`)
- [x] Authentication API (`/api/admin/auth/login`, `/api/admin/auth/logout`, `/api/admin/auth/me`, session management)
- [x] Rate limiting (5 failed attempts per 15 min per IP+email with temporary lockout, verified 429)
- [x] CSRF protection & secure session cookies (httpOnly, Secure, SameSite=Strict, 7-day rolling)
- [x] Cloudinary server-signed upload signature endpoint (`/api/admin/cloudinary-sign`) & server-side asset deletion
- [x] Admin layout shell (Responsive sidebar on desktop, bottom bar on mobile, brand tokens, 44px touch targets)
- [x] Security headers (CSP, X-Frame-Options DENY, HSTS, Referrer-Policy) & robots.txt disallow `/admin`

### Phase 2: Menus (Main + Special) & Public Menu Wiring
- [x] Categories CRUD & sort order, delete handling (reassign dishes or cascade delete)
- [x] Dish scope ("Both menus" vs "Special menu only")
- [x] Dynamic pricing engine (Global markup default 10%, rounding step ₹1, manual overrides, "Reset to auto")
- [x] Dishes CRUD (name, description, category, variants Half/Full, images up to 5, tags Veg/Jain, spice, badges, sold out, visible)
- [x] Menu video management (upload, preview, poster, replace, Cloudinary cleanup)
- [x] Public `/menu` and `/special-menu` integration with dynamic data, edge-caching & offline fallback
- [x] Special Menu noindex & pricing isolation verification (Main prices never exposed on Special or vice versa)

### Phase 3: Dynamic QR Codes, Redirect Engine & Print PDF
- [x] Seed immutable slugs `menu` and `special`
- [x] Low-latency redirect endpoint `GET /q/{code}` (302 redirect, Cache-Control: no-store, tested 4ms latency)
- [x] Asynchronous scan logging (device, OS, browser, salted hash of IP+UA for dedupe within 30s)
- [x] Bot/crawler filtering & rate limiting (30/min per IP)
- [x] Fail-safe redirection if DB is down & friendly unavailable page if disabled
- [x] Admin QR management (label, destination, enable toggle)
- [x] QR downloads: PNG (1024px), SVG, and print-ready PDF (A5 table-tent style with PDFKit)

### Phase 4: Website Content Management & Public Wiring
- [x] Popular Dishes CRUD (up to 12 items, "Add from menu dish" prefill, sort order)
- [x] Public Popular Dishes integration with live API fallback
- [x] Gallery CRUD (multi-image upload, required alt text, caption, reorder, visibility)
- [x] Public Gallery integration (homepage preview & full gallery page)
- [x] Contact & Social info CRUD (phones, address, Google Maps, opening hours, social links)
- [x] Public Navbar, Footer, Contact page integration
- [x] Footer & FSSAI licence number management
- [x] Legal pages rich-text editor (Privacy Policy & Terms and Conditions) & public routes (`#/privacy-policy`, `#/terms-and-conditions`)
- [x] SEO Meta management (Home, Main Menu, Special Menu with title/desc counters & OG images)

### Phase 5: Review System Controls, Events & Analytics
- [x] Review options & Google review link migrated to DB
- [x] Public `/api/public/review-config` with ~60s cache and bundled fallback
- [x] Admin Review Options manager (add, edit, reorder, positiveOnly flag, AI hint, 3-14 guardrail)
- [x] AI prompt integration & generic label-based lines fallback in local phrase bank (`reviewTemplates.js`)
- [x] Google review link validator with "Test link" button
- [x] Anonymous review event tracking (`POST /api/public/review-events` for "started" & "submitted")
- [x] Public Review Page integration (`sendBeacon` on submit, first star tap start event)
- [x] Admin Review Stats UI (started, submitted, conversion %, star distribution, most-selected options)

### Phase 6: Dashboard, Settings, Export & Hardening
- [x] Dashboard analytics: Scan KPIs, peak hours (0-23 IST & day of week), device donut, OS breakdown
- [x] Menu health & reviews summary cards, quick actions
- [x] Settings: Account email/password change with current password confirmation
- [x] Settings: Pricing global markup & rounding step configuration
- [x] Settings: Data export (Full JSON content export, CSV scans & review events export with date range)
- [x] Full responsive testing (360px mobile to 1440px desktop)
- [x] Security, rate limit, and error-handling audit
- [x] Automated test suite executed: 25 PASSED, 0 FAILED (`scripts/test-admin-suite.js`)

---
## Current Status
- **Phase**: All 6 Phases Complete & Verified in 1 Continuous Run.
- **Open TODOs**: None. System is production ready.
