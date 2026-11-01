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
| `#/contact` | Public | React (`ContactPage.tsx`) | **Contact & Location Page**: Interactive Google Maps embed, phone click-to-call, WhatsApp direct link, opening hours. |
| `#/privacy-policy` | Public | React (`LegalPage.tsx`) | **Privacy Policy**: Dynamic rich text rendered from database (`legal_pages`). |
| `#/terms-and-conditions` | Public | React (`LegalPage.tsx`) | **Terms & Conditions**: Dynamic rich text rendered from database (`legal_pages`). |
| `#/review` or `/review` | Public | React (`ReviewPage.tsx`) | **AI Review Booster**: Interactive 1-5 star selector, dynamic chip options from DB, instant live local draft, AI streaming polish, Regenerate button, editable text area, Submit with clipboard copy & auto-redirect to Google Reviews. |
| `/menu/` or `/menu` | Public | Standalone HTML/JS (`public/menu/index.html`) | **Main Menu**: Fast view-only digital menu, looping hero video, category tabs (All, Starters, Main Course, Breads, Beverages, Desserts), search bar with live filtering, dish cards, modal with variants (Half/Full), dietary tags (Veg/Jain), WhatsApp order button, "Review Us" top bar buttons. |
| `/special-menu` | Public | Standalone HTML/JS (`public/menu/index.html`) | **Special Dining Menu**: Noindex meta tag, scoped dishes (both + special_only), dynamically adjusted prices (markup & rounding). |
| `/q/:code` | Public | Express Redirect (`publicRoutes.js`) | **Dynamic QR Redirect Engine**: Sub-150ms 302 redirect (`/q/menu` -> `/menu/`, `/q/special` -> `/special-menu/`), non-blocking scan logging, dedupe, bot filtering, fallback redirection, 503 unavailable page if disabled. |
| `/admin` | Owner Only | React (`AdminApp.tsx`) | **Owner Admin Panel Shell**: Authentication check, responsive sidebar on desktop, bottom bar on mobile, CSRF security, 6 modules (Dashboard, QR Codes, Menus, Website, Reviews, Settings). |

---

## 2. API Endpoints

### A. Public & Operational Endpoints
- `GET /robots.txt` - Disallows `/admin`, `/special-menu`, `/review`; allows `/` and `/menu`.
- `GET /api/health` - Unified service health check.
- `GET /q/:code` - Dynamic QR code redirect with scan logging.
- `GET /api/public/site` - Bundled site metadata, contact info, footer, and SEO.
- `GET /api/public/popular-dishes` - Curated popular dishes list with fallback.
- `GET /api/public/gallery` - Live gallery images sorted by sort_order.
- `GET /api/public/menu/:menuId` - Menu data (`main` or `special`) with categories and dishes.
- `GET /api/public/review-config` - Active review chips and verified Google review link.
- `POST /api/public/review-events` - Anonymous telemetry for review funnel (`started`, `submitted`).
- `POST /api/generate-review` - Server-Sent Events (SSE) AI review polisher using Gemini API.
- `GET /api/public/legal/:id` - Rich-text legal content (`privacy-policy`, `terms-and-conditions`).

### B. Admin Authentication Endpoints
- `POST /api/admin/auth/login` - Rate limited (5 fails/15min), argon2id/bcrypt verification, httpOnly 7-day session cookie, CSRF token issuance.
- `POST /api/admin/auth/logout` - Clears session token in database and cookie.
- `GET /api/admin/auth/me` - Validates session and returns current owner identity.

### C. Admin Dashboard & Operations Endpoints
- `GET /api/admin/dashboard` - Analytics metrics: scan KPIs (today, 7D, 30D), peak hours (0-23 IST), days of week, device/OS donut, review conversion rate, menu health.
- `GET /api/admin/qr-codes` - List all QR codes.
- `PUT /api/admin/qr-codes/:id` - Update label, destination URL, or enable/disable toggle.
- `GET /api/admin/qr-codes/:id/download` - Vector & raster downloads: PNG (1024px), SVG, or Print PDF (A5 table-tent).
- `GET /api/admin/categories` - List categories with dish counts.
- `POST /api/admin/categories` - Create new dish category.
- `PUT /api/admin/categories/:id` - Update category name, description, visibility.
- `DELETE /api/admin/categories/:id` - Delete category with choice to reassign or cascade.
- `PUT /api/admin/categories/reorder` - Reorder categories.
- `GET /api/admin/dishes` - List all dishes with category and variants.
- `POST /api/admin/dishes` - Create dish (single price or variants, tags, spice level, images, badges).
- `PUT /api/admin/dishes/:id` - Update dish details or pricing overrides.
- `DELETE /api/admin/dishes/:id` - Soft-delete dish.
- `POST /api/admin/dishes/bulk` - Bulk visibility or availability toggle.
- `POST /api/admin/dishes/:id/duplicate` - Duplicate dish with copy naming.
- `PUT /api/admin/dishes/reorder` - Reorder dishes within category.
- `GET /api/admin/menus` - List menu video and subtitle settings.
- `PUT /api/admin/menus/:id` - Update menu hero video URL, poster, and subtitles.
- `GET /api/admin/popular-dishes` - List curated popular dishes.
- `POST /api/admin/popular-dishes` - Add popular dish.
- `PUT /api/admin/popular-dishes/:id` - Update popular dish.
- `DELETE /api/admin/popular-dishes/:id` - Remove popular dish.
- `PUT /api/admin/popular-dishes/reorder` - Reorder popular dishes.
- `GET /api/admin/gallery` - List gallery items.
- `POST /api/admin/gallery` - Add gallery image with alt text and category.
- `PUT /api/admin/gallery/:id` - Edit gallery item.
- `DELETE /api/admin/gallery/:id` - Delete gallery item and remove Cloudinary asset.
- `PUT /api/admin/gallery/reorder` - Reorder gallery items.
- `GET /api/admin/content/:key` - Fetch site contact or footer data.
- `PUT /api/admin/content/:key` - Update site contact or footer data.
- `GET /api/admin/legal/:id` - Fetch legal document HTML.
- `PUT /api/admin/legal/:id` - Update legal document HTML.
- `GET /api/admin/seo` - List all SEO page configurations.
- `PUT /api/admin/seo/:id` - Update page title, meta description, OG image, noindex flag.
- `GET /api/admin/reviews/config` - Fetch admin review options & Google review link.
- `PUT /api/admin/reviews/google-url` - Update and test Google review link.
- `POST /api/admin/reviews/options` - Add review option chip (3 to 14 guardrail).
- `PUT /api/admin/reviews/options/:id` - Update review option chip.
- `DELETE /api/admin/reviews/options/:id` - Delete review option chip.
- `PUT /api/admin/reviews/options/reorder` - Reorder review options.
- `GET /api/admin/reviews/stats` - Fetch review conversion, star breakdown, and popular options.
- `GET /api/admin/settings` - Fetch pricing and system configuration.
- `PUT /api/admin/settings/pricing` - Update global special markup % and rounding step.
- `PUT /api/admin/settings/account` - Change owner email and password with password verification.
- `GET /api/admin/settings/export/all` - Full JSON database snapshot export.
- `GET /api/admin/settings/export/scans` - CSV export of QR scan logs with date range filter.
- `GET /api/admin/settings/export/review-events` - CSV export of review telemetry events.
- `POST /api/admin/cloudinary-sign` - Generates signed direct-upload signature for browser-to-Cloudinary uploads.

---

## 3. Database Schema (18 Tables)

1. `owner`: Owner credentials (`id`, `email`, `password_hash`, timestamps).
2. `sessions`: Owner login sessions (`id`, `owner_id`, `token`, `expires_at`, `created_at`).
3. `settings`: System configurations (`special_markup_percent`, `rounding_step`).
4. `categories`: Food menu categories (`id`, `name`, `description`, `visible`, `sort_order`).
5. `dishes`: Menu dishes (`id`, `name`, `description`, `category_id`, `base_price`, `special_price`, `special_price_override`, `tags`, `spice_level`, `badges`, `is_available`, `is_visible`, `scope`, `sort_order`).
6. `dish_variants`: Variants per dish (`id`, `dish_id`, `label`, `base_price`, `special_price`, `sort_order`).
7. `dish_images`: Images per dish (`id`, `dish_id`, `public_id`, `url`, `sort_order`).
8. `menus`: Menu configurations (`id`, `title`, `subtitle`, `video_url`, `poster_url`).
9. `qr_codes`: QR codes configuration (`id`, `label`, `destination`, `is_enabled`).
10. `scans`: QR code scan analytics (`id`, `qr_id`, `ip_hash`, `device_type`, `os`, `browser`, `created_at`).
11. `popular_dishes`: Curated dishes for homepage (`id`, `title`, `description`, `price`, `image_url`, `is_visible`, `sort_order`).
12. `gallery_items`: Photos for gallery (`id`, `url`, `public_id`, `alt_text`, `caption`, `category`, `is_visible`, `sort_order`).
13. `site_content`: Contact and footer JSON data (`contact_info`, `footer_info`).
14. `legal_pages`: Legal markdown/HTML documents (`privacy-policy`, `terms-and-conditions`).
15. `seo_pages`: SEO tags per page (`home`, `menu`, `special-menu`, `about`, `gallery`, `contact`).
16. `review_options`: Review tags/chips (`id`, `label`, `positive_only`, `ai_hint`, `is_visible`, `sort_order`).
17. `review_settings`: Review configuration (`google_review_url`).
18. `review_events`: Review funnel telemetry (`id`, `event_type`, `stars`, `option_ids`, `device_type`, `created_at`).

---

## 4. Environment Variables

| Variable | Scope | Purpose |
|---|---|---|
| `PORT` | Server | Express server port (default: 3001) |
| `ALLOWED_ORIGIN` | Server | CORS origin whitelist (default: http://localhost:5173) |
| `DATABASE_URL` | Server | Postgres connection string (if using Postgres); if omitted, dual-engine defaults to local SQLite `data/restaurant.db` |
| `ADMIN_EMAIL` | Server | Seed owner email on initial run |
| `ADMIN_INITIAL_PASSWORD` | Server | Seed owner password on initial run |
| `SESSION_SECRET` | Server | CSRF and session signature secret |
| `IP_HASH_SALT` | Server | Salt for anonymizing QR scan IPs in analytics |
| `CLOUDINARY_CLOUD_NAME` | Server | Cloudinary media upload cloud identifier |
| `CLOUDINARY_API_KEY` | Server | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Server | Cloudinary API secret |
| `GEMINI_API_KEY` | Server | Google Gemini API key for AI review polishing |
| `RATE_LIMIT_PER_MIN` | Server | AI Review polisher minute rate cap (default: 12) |
| `RATE_LIMIT_PER_DAY` | Server | AI Review polisher daily rate cap (default: 100) |

---

## 5. Report on Hardcoded Values Looking Dynamic

Per the Global Audit Rules:
1. **Google Rating Badge**: `"3.9 ★ on Google, 253 reviews"` located in `src/components/Testimonials/TestimonialsSection.tsx` (line 33). This is static in code and not currently driven by a live Google Places API.
2. **Guest Testimonials Carousel**: The 3 testimonial cards in `src/siteConfig.ts` (`TESTIMONIALS` array: Rahul Sharma, Priya Patil, Amit Deshmukh) are static in code.
3. **Hero Header & Subtitle**: `"Pure Vegetarian Culinary Excellence in Solapur"` in `src/components/Hero/Hero.tsx` is static in code (as specified in Global Rules: hero text remains static).
4. **Our Story Narrative**: Text in `src/components/About/AboutSection.tsx` is static in code (frozen per spec).
