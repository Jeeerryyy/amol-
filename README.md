# Amol Veg Resto — Modern Hospitality Platform

> **Authentic Pure Vegetarian Dining Heritage Meets High-Performance Full-Stack Engineering**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Node Express](https://img.shields.io/badge/Express-5.3-000000?logo=express&logoColor=white)](https://expressjs.com)
[![Database](https://img.shields.io/badge/DB-PostgreSQL_%7C_SQLite-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Cloudinary](https://img.shields.io/badge/Media-Cloudinary-3448C5?logo=cloudinary&logoColor=white)](https://cloudinary.com)
[![Google Gemini](https://img.shields.io/badge/AI-Google_Gemini-4285F4?logo=google&logoColor=white)](https://ai.google.dev)
[![Playwright](https://img.shields.io/badge/Testing-Playwright-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev)

---

## 🌟 Key Highlights

- **Dual-Engine Dynamic Dining**: Seamless real-time synchronization between Public Main Menu and Special AC Dining Menu with configurable percentage markups, rounding steps, and manual price overrides.
- **Zero-Latency Dynamic QR Engine**: Sub-150ms 302 redirect engine (`/q/:code`) with non-blocking scan analytics, fingerprint deduplication, bot filtering, and print-ready A5 Table-Tent PDF generation.
- **AI-Powered Review Booster**: Interactive multi-star rating assistant with instant local draft generation and real-time Server-Sent Events (SSE) streaming via Google Gemini.
- **Hardened Admin Panel**: Complete management dashboard for menus, categories, pricing, gallery, SEO, legal pages, and QR codes with Bcrypt password hashing, httpOnly SameSite=Strict rolling sessions, and CSRF protection.
- **OWASP Top 10 Hardened**: CSP, HSTS, frame protection, DB-backed rate limiting, parameterized queries, and sanitized inputs.
- **Flexible Dual Deployment**: Ready for deployment with frontend on Vercel and backend on Render, or unified single-instance execution.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Clients ["Client Layer"]
        GuestMobile["Mobile Guest\n(QR Menu / AI Review)"]
        WebVisitor["Desktop Visitor\n(Public Website)"]
        Owner["Restaurant Owner\n(Mobile / Desktop Admin)"]
    end

    subgraph Edge ["Routing & CDN Layer (Vercel / Reverse Proxy)"]
        ViteEdge["Static Assets & SPA Shell\n(/, /menu, /review, /admin)"]
        QREngine["Dynamic QR Redirects\n(/q/:code -> 302 Destination)"]
    end

    subgraph Backend ["Layered Backend (Node.js & Express 5 / Render)"]
        PublicRoutes["Public API Routes\n(Cached ~60s + Fallbacks)"]
        AuthMiddleware["Auth & Session Guard\n(httpOnly + CSRF + Rate Limiting)"]
        AdminRoutes["Admin CMS Controllers\n(Menu, Pricing, Analytics, QR)"]
        ReviewController["SSE AI Review Pipeline\n(Gemini 2.5 Flash Streaming)"]
    end

    subgraph Storage ["Data & External Services"]
        Database[("PostgreSQL (Production)\nSQLite (Local Fallback)")]
        Cloudinary[("Cloudinary Media Storage\nDirect Signed Uploads")]
        Gemini[("Google Gemini API\nGenerative AI")]
    end

    GuestMobile -->|Scans QR Table Tent| QREngine
    QREngine -->|Sub-150ms 302| ViteEdge
    WebVisitor -->|Visits / & /menu| ViteEdge
    Owner -->|Manages CMS| AuthMiddleware
    AuthMiddleware --> AdminRoutes
    ViteEdge --> PublicRoutes
    PublicRoutes --> Database
    AdminRoutes --> Database
    AdminRoutes -->|Asset Deletion| Cloudinary
    ReviewController -->|SSE Streaming| Gemini
```

---

## 📁 Repository Structure

```text
amol-veg-resto/
├── api/                    # Vercel Serverless Function entrypoint
│   └── index.js
├── public/                 # Static assets, logos, favicons, prerendered menu
│   ├── favicon.ico
│   ├── logo.png
│   ├── menu/               # Prerendered SEO-friendly HTML menu
│   └── sitemap.xml
├── scripts/                # Database migrations, seeders, schema generators
│   ├── migrate.js          # Run database DDL migrations
│   ├── seed.js             # Idempotent database seeder
│   ├── reset-password.js   # CLI utility to reset owner password
│   ├── prerender-menu.mjs  # Pre-render crawlable HTML menu shell
│   └── validate-schema.mjs # Schema.org JSON-LD validator
├── server/                 # Layered Backend Architecture
│   ├── config/             # Environment & runtime constants
│   ├── controllers/        # Route controllers (Review Gen, etc.)
│   ├── db/                 # Connection pooling, migrations, seeders
│   ├── middleware/         # Auth, CSRF, Rate Limiting, Security Headers, Error Handlers
│   ├── routes/             # Admin, Auth, Public, and Root router
│   ├── services/           # Pricing, QR generation, Cloudinary, AI streaming, CSV exports
│   ├── validation/         # Zod schemas for input validation
│   └── index.js            # Express application entrypoint
├── src/                    # React 18 TypeScript Frontend
│   ├── admin/              # Admin CMS (Dashboard, Menus, QR, Settings, Analytics)
│   ├── components/         # Shared presentation components (Navbar, Hero, Menu, FAQ)
│   ├── pages/              # Code-split subpages (About, Contact, Gallery, Review, Legal)
│   ├── styles/             # Warm paper design tokens & CSS
│   ├── types/              # TypeScript interfaces
│   ├── App.tsx             # Root router with React.lazy code splitting
│   └── main.tsx            # React DOM mounting
├── tests/                  # Automated verification & test suites
│   ├── smoke.js            # Playwright headless critical path smoke tests (8/8)
│   └── total-admin-test.mjs# 18-step administrative sync & security test suite
├── .env.example            # Environment variable template
├── render.yaml             # Render Blueprint deployment config
├── vercel.json             # Vercel Edge routing & cache headers
└── package.json            # Scripts & project dependencies
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- Optional: PostgreSQL database instance (Supabase, Neon, or local). If omitted, the server automatically boots with local SQLite.

### 1. Installation

```bash
git clone https://github.com/your-org/amol-veg-resto.git
cd amol-veg-resto
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your credentials in `.env`:

```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/postgres
AI_API_KEY=your_gemini_api_key
ADMIN_EMAIL=owner@amolvegresto.in
ADMIN_INITIAL_PASSWORD=YourSecurePassword123!
```

### 3. Database Migration & Seeding

```bash
npm run migrate
npm run seed
```

### 4. Running Locally

Start the backend server:

```bash
npm run server
```

In a separate terminal, start the Vite frontend development server:

```bash
npm run dev
```

Visit:
- **Public Website**: `http://localhost:5173/`
- **Digital Menu**: `http://localhost:5173/menu/`
- **Admin Panel**: `http://localhost:5173/admin`
- **API Health**: `http://localhost:3001/api/health`

---

## 🧪 Testing & Verification

The codebase includes comprehensive automated test suites:

```bash
# 1. Playwright Headless Browser Smoke Test (8 Critical Paths)
npm test

# 2. Total Admin CMS & Public Live Sync Suite (18 Automated Steps)
npm run test:admin

# 3. Schema.org JSON-LD & Rich Snippets Validator
npm run seo:validate

# 4. Production TypeScript Typecheck & Vite Build
npm run build
```

---

## 🔒 Security Hardening (OWASP Top 10)

- **A1: Broken Access Control**: Strict role validation, indexed session lookup (`token LIKE $1 || ':%'`), and constant-time CSRF verification.
- **A2: Cryptographic Failures**: Bcrypt password hashing (12 rounds), 256-bit cryptographically secure session tokens, and automated HSTS in production.
- **A3: Injection**: Parameterized SQL queries throughout both PostgreSQL and SQLite backends; zero string-concatenated SQL queries.
- **A5: Security Misconfiguration**: Strict Content Security Policy (CSP), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Permissions-Policy`.
- **A7: Identification & Authentication Failures**: Database-backed rate limiting with exponential lockout after 5 failed attempts, rolling 7-day session expiry, and atomic session destruction on logout.
- **A8: Software & Data Integrity**: Comprehensive input validation via Zod schemas and HTML sanitization on rich inputs.
- **A9: Logging & Monitoring Failures**: Health monitoring endpoint (`/api/health`) and non-blocking audit logging for QR scans and review submissions.

---

## 📍 About Amol Veg Resto

- **Restaurant**: Amol Veg Resto
- **Address**: Gala No 2, Plot 16/1, Karnik Nagar Rd, Sakhar Peth, Solapur, Maharashtra 413006
- **Phone**: +91 72496 64983 / +91 81491 73027
- **Cuisine**: Authentic Maharashtrian, Solapuri Specialties, North Indian & Tandoor Pure Vegetarian

---

## 📄 License

Proprietary © Amol Veg Resto. All rights reserved.
