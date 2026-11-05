# SEO & Technical Audit Baseline — Amol Veg Restaurant

**Audit Date:** November 5, 2026  
**Auditor:** FAANG/MAANG Technical SEO & Generative Engine Optimization (GEO) Team  
**Subject:** Amol Veg Resto (`https://amolvegresto.in` / `http://localhost:5173`)  
**Deployment Target:** Vercel (Edge / Serverless) + Vite React SPA Frontend + Node.js Admin Backend  
**Audit Tooling:** Playwright Headless Chromium Engine (Core Web Vitals & DOM Tree Analyzer)

---

## 1. System Architecture & Rendering Analysis

| Attribute | State | Technical Assessment |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + TypeScript + Vite | Client-Side Hydration / SPA architecture. |
| **Initial HTML Shell** | Minimal (`<div id="root"></div>`) | **Critical Bottleneck:** Web crawlers without JavaScript execution (Bingbot fast-pass, Perplexity, GPTBot, ClaudeBot) receive empty content containers. |
| **Menu Route (`/menu/`)** | Static HTML wrapper with empty `#dishesGrid` | **High Severity:** 280 pure vegetarian dishes and 24 categories are loaded asynchronously via client-side `fetch('restaurant_menu_data.json')`. Zero dish names, prices, or dietary tags exist in the initial raw HTTP response. |
| **Routing Strategy** | Mixed Hash (`#/about`, `#/contact`, `#/gallery`) & Path (`/menu/`, `/admin`) | Path-based routing is standard for search crawlers. Fragment identifiers (`#`) are ignored by search engine indexing pipelines; pages must support clean canonical path URLs (`/about`, `/contact`, `/gallery`). |
| **Styling & Assets** | Tailwind CSS + Lucide Icons + Google Fonts | Google Fonts (`Montserrat`, `Playfair Display`) loaded via render-blocking CSS links. |
| **Deployment & Server** | Vercel Edge (`vercel.json`) | Requires HTTP/2 push, HSTS, security headers, and rewrite/redirect handling. |

---

## 2. Baseline Measurements & Metrics Summary

Audited on clean production dev instance (`http://localhost:5173/` and `http://localhost:5173/menu/`):

### A. Homepage (`/`)

| Metric / Audit Check | Baseline Value | Standard Target | Status |
| :--- | :--- | :--- | :--- |
| **TTFB (Time to First Byte)** | 9 ms | < 200 ms | PASS |
| **DOMContentLoaded** | 4,421 ms | < 1,500 ms | NEEDS OPTIMIZATION |
| **Title Tag** | `Amol Veg Resto \| Pure Veg Restaurant in Sakhar Peth, Solapur` (62 chars) | <= 60 chars, keyword-fronted | REVIEW |
| **Meta Description** | `null` (None) | 140–155 chars, rich CTA | **FAIL (Missing)** |
| **Canonical Link** | `null` (None) | `https://amolvegresto.in/` | **FAIL (Missing)** |
| **Robots Meta Tag** | `null` (None) | `index, follow, max-image-preview:large...` | **FAIL (Missing)** |
| **HTML Language** | `<html lang="en">` | `<html lang="en-IN">` | NEEDS UPDATE |
| **Heading Hierarchy (H1)** | 2 H1 tags found (Desktop + Mobile separate DOM) | Exactly 1 canonical `<h1>` | **FAIL (Duplicate)** |
| **Heading Count (H2 / H3)** | H2: 5, H3: 5 | Logical semantic structure | PASS |
| **Open Graph (og:*)** | All `null` (title, desc, image, type, url) | Complete rich preview card | **FAIL (Missing)** |
| **Twitter Card** | `null` (None) | `summary_large_image` | **FAIL (Missing)** |
| **Geo Meta Tags** | `null` (`geo.region`, `geo.position`, `ICBM`) | Exact coordinates for Solapur (IN-MH) | **FAIL (Missing)** |
| **Structured Data (JSON-LD)** | 0 scripts detected | Validated Schema.org `Restaurant` graph | **FAIL (Missing)** |
| **Image Auditing** | 5 total images; 1 missing `alt`, 2 missing width/height | 100% descriptive alt + explicit aspect ratios | NEEDS FIX |

### B. Digital Menu Route (`/menu/`)

| Metric / Audit Check | Baseline Value | Standard Target | Status |
| :--- | :--- | :--- | :--- |
| **Title Tag** | `Amol Veg Resto \| View-Only Digital Menu` (40 chars) | Keyword-targeted menu title (<=60 chars) | PASS |
| **Meta Description** | Present (92 chars) | Expand with top dish highlights & CTA | NEEDS EXPANSION |
| **Canonical Link** | `null` (None) | `https://amolvegresto.in/menu/` | **FAIL (Missing)** |
| **Robots Meta Tag** | `null` (None) | `index, follow` | **FAIL (Missing)** |
| **Heading Hierarchy (H1)** | **0 H1 tags found** | Distinct H1 with target keywords | **FAIL (Missing)** |
| **Raw HTML Dishes Rendered** | **0 dishes in raw DOM** | All 280 dishes indexed statically | **FAIL (JS-dependent)** |
| **Structured Data (JSON-LD)** | 0 scripts detected | Complete Schema.org `Menu` & `MenuItem`s | **FAIL (Missing)** |

### C. Site-Wide Infrastructure

| Feature / Asset | Baseline State | Required State | Status |
| :--- | :--- | :--- | :--- |
| **`robots.txt`** | Present, but basic Disallow rules only; points to `/sitemap.xml` | Explicit directives for Googlebot, Bingbot, and AI scrapers (GPTBot, ClaudeBot, PerplexityBot) | NEEDS UPGRADE |
| **`sitemap.xml`** | **Missing (404)** | Valid XML sitemap with all routes, lastmod, and image nodes | **FAIL (Missing)** |
| **`llms.txt` / `llms-full.txt`**| **Missing (404)** | Concise & full LLM-consumable markdown specifications for AI Answer Engines | **FAIL (Missing)** |
| **Ground-Truth NAP** | Inconsistent: Phone had placeholder `+91 98765 43210` in footer/contact; address was vague | Unified NAP in `siteConfig.ts` with phone `+91 72496 64983` and exact Gala No 2, Plot 16/1, Sakhar Peth address | NEEDS CORRECTION |

---

## 3. High-Priority Action Plan

1. **Static HTML Prerendering**:
   - Prerender all 280 menu items and 24 categories inside `public/menu/index.html` within `<div class="dishes-container" id="dishesGrid">` so every crawler gets immediate access to dishes, descriptions, and prices.
   - Inject rich, crawlable semantic HTML markup into `index.html` inside `<div id="root"></div>` for search engines before client JS hydration.
2. **Meta & Geo Tags Standardization**:
   - Add high-converting, keyword-focused titles and descriptions (<=60 and <=155 chars).
   - Configure Open Graph (1200x630 banner), Twitter cards, geo coordinates (Lat 17.6681849, Long 75.9245468, Region IN-MH), and canonical tags across all pages.
3. **FAANG/MAANG Structured Data (JSON-LD)**:
   - Implement Schema.org `@graph` featuring `Restaurant`, `LocalBusiness`, `PostalAddress`, `GeoCoordinates`, `OpeningHoursSpecification`, `Menu`, `MenuItem`, `BreadcrumbList`, and `FAQPage`.
   - Validate with zero errors or warnings via custom validator script.
4. **GEO / AEO Engine Assets**:
   - Deploy `llms.txt` and `llms-full.txt` providing factual data to AI answer engines (ChatGPT, Claude, Perplexity, Gemini).
   - Add high-intent FAQ accordion with rich microdata.
5. **Infrastructure & Verification**:
   - Generate `sitemap.xml` and update `robots.txt`.
   - Ensure clean build (`npm run build`), full unit test pass, and admin suite verification.
