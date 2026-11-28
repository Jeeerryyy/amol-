# Complete Project Inventory: Amol Veg Resto

**Generated during Phase 1 Audit & Handover**  
**Repository Branch:** `chore/audit-and-handover`  
**Baseline Git Tag:** `pre-handover-baseline`

---

## 1. Routes & Pages

| Route / Path | Type | Renderer | Description / Interactive Elements |
|---|---|---|---|
| `/` or `#/` | Public | React (`App.tsx`) | **Public Homepage**:<br>- Sticky Navbar (Home, About, Gallery, Contact, Menu, Call Now `tel:`)<br>- Hero Section (CTA button "EXPLORE MENU")<br>- Popular Dishes (Dynamic cards with modal, "Read More", "Full Menu" CTA)<br>- About / Story Section ("Read Full Story")<br>- Gallery Preview (Interactive carousel with next/prev arrows, "View Full Gallery")<br>- Testimonials (Google Rating card, Carousel arrows, "Read more reviews on Google")<br>- Footer (Quick Links, FSSAI licence, Directions, Social links, Copyright) |
| `#/about` | Public | React (`AboutPage.tsx`) | **About Page**: Extended restaurant narrative, farm-to-table ethos, pure veg philosophy. |
| `#/gallery` | Public | React (`GalleryPage.tsx`) | **Full Gallery Page**: Categorized dynamic gallery items (All, Ambience, Food, Kitchen) with responsive lightbox. |
| `#/contact` or `/contact` | Public | React (`ContactPage.tsx`) | **Contact & Location Page**: Directions link matching verified Google Business Profile (`maps_url`), phone click-to-call, operating hours, validated inquiry submission form (`POST /api/public/contact`) with WhatsApp follow-up option. |
| `#/privacy-policy` or `/privacy-policy` | Public | React (`LegalPage.tsx`) | **Privacy Policy**: Dynamic sanitized rich text rendered from database (`legal_pages`). |
| `#/terms-and-conditions` or `/terms-and-conditions` | Public | React (`LegalPage.tsx`) | **Terms & Conditions**: Dynamic sanitized rich text rendered from database (`legal_pages`). |
| `#/review` or `/review` | Public | React (`ReviewPage.tsx`) | **AI Review Booster**: Accessible `role="radio"` 1-5 star selector, dynamic chip options from DB, instant live local draft, AI streaming polish, Regenerate button, editable text area, Submit with clipboard copy & Google Reviews redirect. |
| `/menu/` or `/menu` | Public | Standalone HTML/JS (`public/menu/index.html`) | **Main Menu**: Fast view-only digital menu, looping hero video, category tabs, search bar with live filtering, XSS-escaped dish cards, modal with variants, dietary tags (Veg/Jain), configurable action buttons (WhatsApp, Call Waiter, Zomato, Swiggy). |
| `/special-menu` | Public | Standalone HTML/JS (`public/menu/index.html`) | **Special Dining Menu**: Noindex meta tag, scoped dishes (`both` + `special_only`), dynamically adjusted prices (markup & rounding). |
| `/q/:code`, `/qr/:code` | Public | Express Redirect (`publicRoutes.js`) | **Dynamic QR Redirect Engine**: Sub-150ms 302 redirect (`/qr/menu` -> `/menu/`, `/qr/special` -> `/special-menu/`), non-blocking scan telemetry, URL scheme validation, fallback 404/503 pages. |
| `/admin` | Owner Only | React (`AdminApp.tsx`) | **Owner Admin Panel Shell**: Authentication check, responsive sidebar on desktop, bottom bar on mobile, CSRF security, 6 modules (Dashboard, QR Codes, Menus, Website, Reviews, Settings). |

---

## 2. API Endpoints

### A. Public & Operational Endpoints
- `GET /robots.txt` - Disallows `/admin`, `/special-menu`, `/review`; allows `/` and `/menu/`.
- `GET /api/health` - Unified service health check.
- `GET /q/:code`, `GET /qr/:code` - Dynamic QR code redirect with rate limiting, safe destination validation & scan logging.
- `GET /api/public/site` - Bundled site metadata, contact info (`maps_url`, `hours`, etc.), footer, and SEO.
- `GET /api/public/popular-dishes` - Curated popular dishes list with fallback.
- `GET /api/public/gallery` - Live gallery images sorted by `sort_order`.
- `GET /api/public/menu/:menuId` - Menu data (`main` or `special`) with categories, dishes, buttons, and SEO metadata.
- `GET /api/public/review-config` - Active review chips and verified Google review link.
- `POST /api/public/review-events` - Anonymous telemetry for review funnel (`started`, `submitted`).
- `POST /api/generate-review` - Server-Sent Events (SSE) AI review polisher using Gemini API.
- `GET /api/public/legal/:id` - Rich-text legal content (`privacy-policy`, `terms-and-conditions`).

### B. Admin Authentication Endpoints
- `POST /api/admin/auth/login` - Rate limited (5 fails/15min), `bcryptjs` verification, `httpOnly` `SameSite=Strict` 7-day session cookie, CSRF token issuance.
- `POST /api/admin/auth/logout` - Clears validated session token in database and cookie (protected against LIKE wildcards).
- `GET /api/admin/auth/me` - Validates session and returns current owner identity (`email`, `csrfToken`).
- `PUT /api/admin/auth/credentials` (aliases `PUT /api/admin/auth/auth/credentials`, `POST /api/admin/auth/change-account`) - Change owner email and password with current password verification (revokes other active sessions on password change).

### B2. Additional Public Operational Endpoints
- `GET /api/public/menu-buttons` - Active menu modal action buttons (no-store real-time sync).
- `POST /api/public/contact` - Rate-limited, Zod-validated and HTML-stripped customer inquiry submission (`contact_inquiries`).
- `POST /api/generate-review` (also at `/api/public/generate-review`) - Rate-limited SSE AI review generator.

### C. Admin Dashboard & Operations Endpoints
- `GET /api/admin/dashboard` - Analytics metrics: scan KPIs (today, 7D, 30D, all-time), peak hours (0-23 IST), days of week, device/OS breakdown, review conversion rate, menu health.
- `GET /api/admin/qr-codes` - List all QR codes with total scan counts.
- `POST /api/admin/qr-codes` - Create dynamic QR code (with safe URL validation).
- `PUT /api/admin/qr-codes/:id` - Update label, slug, destination URL, or enable/disable toggle.
- `DELETE /api/admin/qr-codes/:id` - Delete non-core custom QR codes.
- `GET /api/admin/qr-codes/:id/download` - Authenticated vector & raster downloads: PNG (1024px), SVG, or Print PDF (A5 table-tent).
- `GET /api/admin/categories` - List categories.
- `POST /api/admin/categories` - Create new dish category.
- `PUT /api/admin/categories/:id` - Update category name, description, visibility, sort order.
- `DELETE /api/admin/categories/:id` - Delete category with choice to reassign or soft-delete dishes.
- `PUT /api/admin/categories/reorder/batch` - Reorder categories.
- `GET /api/admin/dishes` - List dishes with filters, category info, variants, and images.
- `POST /api/admin/dishes` - Create dish (single price or variants, tags, spice level, images, badges, manual special override).
- `PUT /api/admin/dishes/:id` - Update dish details, variants, images, or pricing overrides.
- `DELETE /api/admin/dishes/:id` - Soft-delete dish.
- `POST /api/admin/dishes/bulk` - Bulk availability, visibility, category move, or soft delete.
- `POST /api/admin/dishes/:id/duplicate` - Duplicate dish with copy naming, variants, and images.
- `PUT /api/admin/dishes/reorder/batch` - Reorder dishes within category.
- `GET /api/admin/menus` - List menu video, poster, and subtitle settings.
- `PUT /api/admin/menus/:id` - Update menu hero video URL, poster, and subtitles.
- `GET /api/admin/menu-buttons` - List configurable menu action buttons.
- `POST /api/admin/menu-buttons` - Create menu modal action button.
- `PUT /api/admin/menu-buttons/:id` - Update menu modal action button.
- `DELETE /api/admin/menu-buttons/:id` - Delete menu modal action button.
- `PUT /api/admin/menu-buttons/reorder/batch` - Reorder menu action buttons.
- `GET /api/admin/popular-dishes` - List curated popular dishes.
- `POST /api/admin/popular-dishes` - Add popular dish (max 12).
- `PUT /api/admin/popular-dishes/:id` - Update popular dish.
- `DELETE /api/admin/popular-dishes/:id` - Remove popular dish.
- `PUT /api/admin/popular-dishes/reorder/batch` - Reorder popular dishes.
- `GET /api/admin/gallery` - List gallery items.
- `POST /api/admin/gallery` - Add gallery image with alt text and category.
- `PUT /api/admin/gallery/:id` - Edit gallery item.
- `DELETE /api/admin/gallery/:id` - Delete gallery item and remove Cloudinary asset.
- `PUT /api/admin/gallery/reorder/batch` - Reorder gallery items.
- `GET /api/admin/site-content` - Fetch all site content blocks (`contact`, `footer`, `popular_header`).
- `PUT /api/admin/site-content/:key` - Update a site content block.
- `GET /api/admin/legal-pages` - List legal documents.
- `PUT /api/admin/legal-pages/:id` - Update sanitized legal document HTML.
- `GET /api/admin/seo-pages` - List all SEO page configurations (with derived `page_name`).
- `PUT /api/admin/seo-pages/:id` - Update page title, meta description, OG image, noindex flag.
- `GET /api/admin/reviews/config` - Fetch admin review options & Google review link.
- `PUT /api/admin/reviews/google-link` - Update Google review URL.
- `GET /api/admin/reviews/options` - List all review option chips.
- `POST /api/admin/reviews/options` - Add review option chip (up to 14 visible guardrail).
- `PUT /api/admin/reviews/options/:id` - Update review option chip (min 3 / max 14 visible guardrail).
- `DELETE /api/admin/reviews/options/:id` - Delete review option chip (min 3 visible guardrail).
- `PUT /api/admin/reviews/options/reorder/batch` - Reorder review options.
- `GET /api/admin/reviews/stats` - Fetch review conversion, star breakdown, and popular options.
- `GET /api/admin/settings` - Fetch pricing and system configuration.
- `PUT /api/admin/settings` - Update global special markup % and rounding step & trigger `both`-scope price recalculation.
- `GET /api/admin/export/content` - Full JSON database snapshot export.
- `GET /api/admin/export/scans` - CSV export of QR scan logs with IST timestamps & date range validation.
- `GET /api/admin/export/reviews` - CSV export of review telemetry events with IST timestamps.
- `GET /api/admin/inquiries` - List customer contact inquiries submitted via `/contact`.
- `PUT /api/admin/inquiries/:id` - Update inquiry status (`new` / `resolved`).
- `POST /api/admin/cloudinary-sign` - Generates signed direct-upload signature for browser-to-Cloudinary uploads.

---

## 3. Database Schema (21 Tables)

1. `owner`: Owner credentials (`id`, `email`, `password_hash`, timestamps).
2. `sessions`: Owner login sessions (`id`, `owner_id`, `token`, `expires_at`, `created_at`).
3. `login_attempts`: IP+email brute-force tracking & lockout timestamps (`key`, `count`, `first_attempt`, `locked_until`).
4. `settings`: System configurations (`special_markup_percent`, `rounding_step`).
5. `categories`: Food menu categories (`id`, `name`, `description`, `visible`, `sort_order`).
6. `dishes`: Menu dishes (`id`, `name`, `description`, `category_id`, `base_price`, `special_price`, `special_price_override`, `tags`, `spice_level`, `badges`, `is_available`, `is_visible`, `scope`, `sort_order`, `deleted_at`).
7. `dish_variants`: Variants per dish (`id`, `dish_id`, `label`, `base_price`, `special_price`, `special_price_override`, `sort_order`).
8. `dish_images`: Images per dish (`id`, `dish_id`, `public_id`, `url`, `sort_order`, `is_cover`).
9. `menus`: Menu configurations (`id`, `title`, `subtitle`, `video_url`, `poster_url`).
10. `qr_codes`: Dynamic QR codes configuration (`id`, `slug`, `label`, `destination`, `is_enabled`).
11. `scans`: QR code scan analytics (`id`, `qr_id`, `ip_hash`, `device_type`, `os`, `browser`, `created_at`).
12. `popular_dishes`: Curated dishes for homepage (`id`, `title`, `description`, `price`, `image_url`, `is_visible`, `sort_order`).
13. `gallery_items`: Photos for gallery (`id`, `url`, `public_id`, `alt_text`, `caption`, `category`, `is_visible`, `sort_order`).
14. `site_content`: Contact, footer, and popular header JSON data (`key`, `data`, `updated_at`).
15. `legal_pages`: Sanitized legal HTML documents (`privacy-policy`, `terms-and-conditions`).
16. `seo_pages`: SEO tags per page (`home`, `menu`, `special-menu`, `about`, `gallery`, `contact`, etc.).
17. `review_options`: Review tags/chips (`id`, `label`, `positive_only`, `ai_hint`, `is_visible`, `sort_order`).
18. `review_settings`: Review configuration (`google_review_url`).
19. `review_events`: Review funnel telemetry (`id`, `event_type`, `stars`, `option_ids`, `device_type`, `created_at`).
20. `menu_buttons`: Customizable menu modal action buttons (`id`, `type`, `label`, `url`, `phone`, `bg_color`, `hover_color`, `is_enabled`, `sort_order`).
21. `contact_inquiries`: Customer inquiry submissions from `/contact` (`id`, `name`, `phone`, `email`, `message`, `status`, `created_at`).

---

## 4. Environment Variables

| Variable | Scope | Purpose |
|---|---|---|
| `PORT` | Server | Express server port (default: `3001`) |
| `ALLOWED_ORIGIN` | Server | CORS origin whitelist (default: `http://localhost:5173`, comma-separated) |
| `DATABASE_URL` | Server | PostgreSQL connection URI; if omitted, dual-engine defaults to local SQLite (`data/restaurant.db`) |
| `DATABASE_SSL` | Server | Toggle SSL (`false` disables SSL for PG pool) |
| `ADMIN_EMAIL` | Server | Seed owner email on initial run |
| `ADMIN_INITIAL_PASSWORD` | Server | Seed owner password on initial run |
| `IP_HASH_SALT` | Server | Salt for anonymizing QR scan IPs in analytics |
| `CLOUDINARY_CLOUD_NAME` | Server | Cloudinary media upload cloud identifier |
| `CLOUDINARY_API_KEY` | Server | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Server | Cloudinary API secret |
| `AI_API_KEY` | Server | Google Gemini API key for AI review polishing |
| `AI_MODEL` | Server | Gemini model name (default: `gemini-2.5-flash`) |
| `RATE_LIMIT_PER_MIN` | Server | AI Review polisher minute rate cap (default: `12`) |
| `RATE_LIMIT_PER_DAY` | Server | AI Review polisher daily rate cap (default: `100`) |
| `SITE_URL` | Server | Canonical site URL used for QR encoding & CORS allowlist |
| `VITE_API_URL` | Client | Optional API base URL if frontend is hosted separately |
| `GOOGLE_SITE_VERIFICATION` | Build | Optional Google Search Console HTML verification token |
| `BING_SITE_VERIFICATION` | Build | Optional Bing Webmaster Tools HTML verification token |

---

## 5. Report on Hardcoded Values Looking Dynamic

Per the Global Audit Rules:
1. **Google Rating Badge**: `"3.9 ★ on Google, 253 reviews"` located in `src/components/Testimonials/TestimonialsSection.tsx` (line 33). This is static in code and not currently driven by a live Google Places API.
2. **Guest Testimonials Carousel**: The 3 testimonial cards in `src/siteConfig.ts` (`TESTIMONIALS` array: Rahul Sharma, Priya Patil, Amit Deshmukh) are static in code.
3. **Hero Header & Subtitle**: `"Pure Vegetarian Culinary Excellence in Solapur"` in `src/components/Hero/Hero.tsx` is static in code (as specified in Global Rules: hero text remains static).
4. **Our Story Narrative**: Text in `src/components/About/AboutSection.tsx` is static in code (frozen per spec).

