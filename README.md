# Amol Veg Resto — Modern Hospitality Platform

> **Pure Vegetarian Heritage Meets Next-Generation Headless Dining Architecture**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Node Express](https://img.shields.io/badge/Express-5.3-000000?logo=express&logoColor=white)](https://expressjs.com)
[![Database](https://img.shields.io/badge/DB-Postgres_%7C_SQLite-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Cloudinary](https://img.shields.io/badge/Media-Cloudinary-3448C5?logo=cloudinary&logoColor=white)](https://cloudinary.com)
[![Google Gemini](https://img.shields.io/badge/AI-Google_Gemini-4285F4?logo=google&logoColor=white)](https://ai.google.dev)

![Amol Veg Resto Platform Preview](docs/screenshots/showcase-desktop.png)

---

## 🌟 Standout Technical Highlights

- **Dual-Engine Dynamic Dining**: Seamless synchronization across Public Main and Special Dining menus with automated percentage markup, rounding controls, and manual price overrides.
- **Zero-Latency Dynamic QR Engine**: Sub-150ms 302 redirect engine with non-blocking scan analytics, fingerprint deduplication, bot filtering, and print-ready A5 PDF generation.
- **AI-Powered Customer Review Booster**: Interactive multi-star rating assistant with zero-delay local phrase generation and real-time Server-Sent Events (SSE) streaming via Google Gemini.
- **Hardened Owner-Only Admin Panel**: Mobile-first responsive CMS with Argon2id/Bcrypt authentication, httpOnly SameSite=Strict sessions, CSRF token validation, and CSP headers.
- **High-Performance Resilient Delivery**: Client-side edge caching (~60s TTL), instant fallback to bundled seed snapshots, and direct browser-to-cloud signed media uploads.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Devices"]
        MobileGuest["Mobile Guest\n(QR Menu / AI Review)"]
        WebVisitor["Desktop Visitor\n(Public Website)"]
        Owner["Restaurant Owner\n(Mobile / Desktop Admin)"]
    end

    subgraph CDN ["Edge & Routing Layer"]
        ViteEdge["Vite / Reverse Proxy\nStatic & SPA Delivery"]
        QREngine["Low-Latency /q/:code\n302 Redirect Engine"]
    end

    subgraph Backend ["Unified Backend Engine (Express 5)"]
        PublicAPI["Public API\n(Cached ~60s + Fallbacks)"]
        AuthLayer["Auth & Session Guard\n(CSRF + Rate Limiting)"]
        AdminAPI["Admin CMS Mutations\n(Auto-Revalidation)"]
        AIStream["SSE Review Generator\n(Streaming Pipeline)"]
    end

    subgraph Services ["External & Storage Services"]
        DB[("Dual-Engine Database\nPostgreSQL / SQLite")]
        Cloudinary[("Cloudinary\nDirect Signed Uploads")]
        Gemini[("Google Gemini\nGenerative AI")]
    end

    MobileGuest -->|Scans QR| QREngine
    QREngine -->|Sub-150ms 302| ViteEdge
    WebVisitor -->|Browses /menu & /| ViteEdge
    Owner -->|Manages CMS| AuthLayer
    AuthLayer --> AdminAPI
    ViteEdge --> PublicAPI
    PublicAPI --> DB
    AdminAPI --> DB
    AdminAPI -->|Server Deletion| Cloudinary
    AIStream -->|SSE Streaming| Gemini
```

---

## 🛠️ Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend Framework** | React 18 + TypeScript | Type-safe declarative UI with optimal re-rendering performance |
| **Styling & Design** | Pure CSS Variables & Tokens | Zero runtime overhead, authentic warm paper aesthetic |
| **Bundler & Dev Server** | Vite 6 | Sub-second Hot Module Replacement and optimized chunking |
| **Application Server** | Node.js + Express 5 | High-throughput async I/O with native SSE and cookie parsing |
| **Database Architecture** | PostgreSQL / SQLite (Dual-Engine) | Zero-friction local development with zero-code Postgres production switch |
| **Media Pipeline** | Cloudinary Direct API | Direct client-to-cloud signed uploads with automated image optimization |
| **AI Intelligence** | Google Gemini API | Low-latency natural language review synthesis and tone refinement |
| **E2E Test Engine** | Playwright Chromium | Deterministic, headless visual regression and critical-path validation |

---

## 📍 About Amol Veg Resto

**Amol Veg Resto** is a beloved pure vegetarian restaurant in Sakhar Peth, Solapur, Maharashtra. Renowned for authentic Maharashtrian specialties, tandoor delicacies, and Solapuri Shev Bhaji, this project honors that rich culinary heritage through modern, bespoke digital craftsmanship.
