# Amol Veg Resto: Website Spec (Picture-Perfect Build)

> **Source of truth:** `Amol_Veg_Resto_Landing_Page.png` (the full desktop Home design). Build the website to match it **exactly**: same sections, order, text, positions, spacing, colors, fonts, icons and button behavior.
>
> **Do NOT add anything that is not in the design.** No extra sections, copy, floating buttons (WhatsApp, back-to-top), bars, popups, loading screens, cookie banners, page transitions or search. **The only animation is the hero scroll sequence (section 7.2.2).** The design image shows the hero at the **end** of that sequence.
>
> Where this document and the image disagree on *visuals*, the image wins. Where they disagree on *business data* (phone, address), `site.config` (section 3) wins.

**Measurement note:** the design image is 793 px wide. All px values below assume a **1440 px desktop canvas** (scale ×1.816) and are approximations read from the image. Percentages are of the canvas width. Always compare your render side by side with the image.

---

## 1. Project Overview

**Business:** Amol Veg Resto (अमोल वेज रेस्टो), a pure vegetarian restaurant in Sakhar Peth, Solapur.
**Tagline:** "Pure veg food, fresh and served fast."
**Services:** Dine-in · Takeaway · Order online (Google Maps lists them; no visible UI for them in this design).

**Pages**

| Route | Page | Design status |
|---|---|---|
| `/` | Home | **Fully designed** (this spec) |
| `/about` | About | No design yet, build as stub (section 10) |
| `/gallery` | Gallery | No design yet, build as stub (section 10) |
| `/contact` | Contact | No design yet, build as stub (section 10) |
| `/privacy` | Privacy Policy | Stub (section 10) |
| `/terms` | Terms & Conditions | Stub (section 10) |
| 404 | Not found | Stub (section 10) |

**Menu page:** not built. "Full menu coming soon." is shown on Home.

---

## 2. Tech & Build Rules

- **Framework:** Next.js (latest stable, App Router, TypeScript)
- **Styling:** Tailwind CSS v4 with `@theme` tokens (section 4)
- **Fonts (`next/font/google`):** Playfair Display (headings, nav links, prices, quotes, italic notes, tagline) and Poppins (labels, body, buttons). These are the closest matches to the design.
- **Images:** `next/image`. Icons are inline SVG (see section 4.6).
- **Carousels:** plain CSS scroll-snap plus prev/next buttons. No carousel library, no animation library.
- **Hero sequence:** HTML5 canvas driven by a passive scroll listener + `requestAnimationFrame`. No library (no framer-motion, no Lenis, no GSAP).
- **Single source of data:** all text, links and contact info come from `site.config.ts` (section 3). Nothing is hardcoded in components.
- **Structure:** one component per section (`Navbar`, `Hero`, `PopularDishes`, `AboutSnippet`, `GalleryPreview`, `Testimonials`, `Footer`) plus small shared parts (`SectionDivider`, `SectionHeading`, `OutlineButton`, `PrimaryPill`, `IconCircleButton`).
- **Interactions allowed:** only hover/focus states (section 8.3), smooth in-page scroll for "Explore Menu", the two carousels, and the hero scroll sequence (7.2.2).

---

## 3. `site.config.ts` (single source of truth)

```ts
export const site = {
  nameEn: "Amol Veg Resto",
  taglineHeader: "PURE VEG FOOD, FRESH AND SERVED FAST.", // navbar, uppercase small
  taglineFooter: "Pure veg food, fresh and served fast.", // footer, italic
  phoneDisplay: "+91 72496 64983",
  phoneTel: "tel:+917249664983",
  whatsapp: "https://wa.me/917249664983",
  mapsUrl: "https://maps.app.goo.gl/zp7RDvhrkJNiTKri9",
  address: "Gala No 2, Markandeya Yentramag Society, near Uphar Bakery, Sakhar Peth, Solapur, Maharashtra 413006",
  hours: "Opens 12 PM",
  ratingText: "3.9 ★ on Google",
  reviewCount: "253 reviews",
  instagram: "#",   // [TO BE ADDED]
  facebook: "#",    // [TO BE ADDED]
  youtube: "#",     // [TO BE ADDED]
  fssai: "[TO BE ADDED]",
  agencyName: "Nirvanaa Studios",
  agencyUrl: "#",   // [TO BE ADDED]
  heroSequence: {
    totalFrames: 240,
    basePath: "/images/hero-sequence", // files: 1.jpg … 240.jpg
    ext: "jpg",
    scrollVhDesktop: 250, // scroll distance that plays the sequence
    scrollVhMobile: 200,
  },
};
```

> **Placeholder values in the design:** the footer "Visit Us" block in the image shows a placeholder-looking address (starting "123, Station Road…") and a placeholder phone number (+91 98765 43210), which differ from the navbar number and the real Google Maps listing. **Use the real values above everywhere** (the footer address simply wraps to as many lines as needed within the same column). The dish names, descriptions and prices ("Dish 1"–"Dish 4", ₹120/₹100/₹110/₹150) ARE shown exactly as in the design.

---

## 4. Design Tokens

### 4.1 Colors (approximate; sample exact values from the image with an eyedropper)

| Token | Approx. value | Used for |
|---|---|---|
| `--cream` | `#F8EBD8` | Page background (paper texture, see 4.4) |
| `--cream-card` | `#FBF1E3` | Dish cards, review cards |
| `--orange` | `#D4561A` | Accent words in headings, labels, prices, primary buttons, active nav link, short underlines, quote marks |
| `--brown-dark` | `#2B170B` | Headings, nav links, button outlines and text |
| `--brown-text` | `#6B5545` | Paragraphs, descriptions, secondary text |
| `--brown-footer` | `#3A2012` | Footer bottom bar, footer icon circles, "Get Directions" button, logo disc |
| `--placeholder` | `#D3C8BB` | Empty image placeholder tiles |
| `--peach` | `#F1D3B0` | Rotated back card behind the About image |
| `--line` | `#E6D5BF` | Hairline borders (navbar bottom, card edges) |
| `--olive` | `#6B7A3A` | Hero leaf sprigs |

### 4.2 Typography (approx., at 1440 canvas)

| Role | Font | Size / weight | Notes |
|---|---|---|---|
| Hero title (3 lines) | Playfair Display | ~48 px / 700, line-height 1.2 | Line 2 in orange |
| Hero right heading | Playfair Display | ~35 px / 700 | Dark brown |
| Section heading (Popular Dishes, Guests Say, Gallery) | Playfair Display | ~54 px / 700 | Two-tone, see each section |
| "Our Story" heading | Playfair Display | ~64 px / 700 | "Story" in orange |
| Nav links | Playfair Display | ~17 px / 500 | |
| Brand name (navbar) | Playfair Display | ~26 px / 700 | |
| Small caps labels | Poppins | ~12–13 px / 500, uppercase, letter-spacing ~0.2em | "PURE VEG. PURE TASTE.", "GOOD FOOD", "SINCE 1990.", "ALWAYS AMOL.", "ABOUT US", "GALLERY", section subtitle |
| Body paragraphs | Poppins | ~17 px / 400, line-height ~1.65 | `--brown-text` |
| Card title | Poppins | ~18 px / 600 | |
| Card description | Poppins | ~13 px / 400 | `--brown-text` |
| Price | Playfair Display | ~24 px / 700 | Orange |
| Buttons | Poppins | ~13–14 px / 500–600 | |
| Italic notes ("Full menu coming soon.", footer tagline) | Playfair Display italic | ~17 px | |
| Footer text | Poppins | ~11–12 px | |

### 4.3 Shape & shadow
- Dish and review cards: radius ~14 px (dish) / ~12 px (review), shadow `0 4px 14px rgba(60,30,10,0.10)`.
- Image placeholders: radius ~12 px (gallery tiles), ~28 px (About image).
- Outline buttons: 1 px `--brown-dark` border, radius ~6 px, transparent background.
- Primary pill (Explore Menu): fully rounded.
- Icon circle buttons (carousel arrows, footer socials): perfect circles.

### 4.4 Page background
`base background.png` (paper texture) as a full-page cover/repeat background in `--cream`. The navbar and all sections sit directly on it (no section background colors except where noted).

### 4.5 Section divider (lotus)
Used above "Our Popular Dishes" and above "What Our Guests Say". A centered row: thin 1 px orange-brown line (~95 px wide) · small orange lotus line icon (~28 px) · thin line (~95 px), with ~14 px gaps. Lines vertically centered on the icon.

### 4.6 Icons (inline SVG, thin line style, color per context)
phone (in orange circle) · arrow-right · arrow-left · external-link (arrow up-right) · home · user · image · phone · map-pin · clock · file-text · Instagram · Facebook · WhatsApp · YouTube · quote mark (large, light orange `#F1B98A`) · lotus · leaf sprig (olive).

---

## 5. Assets (file names exactly as in your folder)

Copy into `public/images/`. Rename to kebab-case if desired, but keep the mapping below.

| File | Use |
|---|---|
| `logo.png` | Circular brown logo ("tasty made for you", amol veg resto, EST. 1990). Used in the navbar (~127 px) and the footer (~167 px) |
| `base background.png` | Page background texture (4.4) |
| `ezgif-6b64a8c72c352624-jpg/` (240 JPG frames) | **Hero scroll sequence**: frames go from all dishes covered to lids lifted and floating. Copy into `public/images/hero-sequence/` and rename to `1.jpg … 240.jpg` in numeric order (`ls \| sort -V`). **Frame 240 = the hero shown in the design** |
| `last frame idea 1.png` | Static fallback hero image (`prefers-reduced-motion`, no JavaScript). Same picture as frame 240 |
| `footer background.png`, `footer background2.png` | Footer illustration backdrop (two versions). Use the one that matches the design (see 7.6 for what it must contain) |
| `interrior.jpg`, `interior2.jpg`, `main front.jpg` | Real restaurant photos. **Not shown in this design** (About and Gallery slots are empty placeholders). Keep them in `public/images/` for later |
| `first frame idea 1.png`, `first frame.png`, `last frame.png`, `video 1.mp4` | Source files the sequence was made from. **Not used on the page**; the 240 frames above replace them |
| `Amol Veg Resto Mobile Homepage.png` | **Mobile design reference** (≤ 768 px). Follow it for the mobile layout (section 11) |
| `landing page.png` (`lanmding page.png`), `navbar design.png`, `hero section design.png`, `Our Popular Dishes section design.png`, `about section design.png`, `gallary section design.png`, `review section design.png`, `foter design.png` | **Reference mockups only.** These contain baked-in text. Never use them as on-page images |
| Dish photos (Dish 1–4) | Four food photos shown in the dish cards (dosa with chutneys, idli plate on banana leaf, fried-rice bowl, thali with rice, curry and papad). Supply as `public/images/dishes/dish-1.jpg … dish-4.jpg` |

**Hero leaf sprigs:** the olive-green leaf sprigs at the far left and right edges of the hero are decorative. If they are not already part of the hero image, export them from the hero mockup as `leaf-left.png` and `leaf-right.png`.

---

## 6. Global Layout

Vertical order of the Home page:

1. Navbar
2. Hero
3. Popular Dishes
4. About ("Our Story")
5. Gallery
6. Testimonials ("What Our Guests Say")
7. Footer (illustrated, with bottom bar)

Container: content centered, side padding ~5% (the dish row spans ~4.5%–95.5%, the review row ~9.5%–91%, About and Gallery as described below). No max-width cap below 1440 px; above 1440 px, center the 1440 px canvas.

---

## 7. Home Page, Section by Section

Each section lists **layers from back (L0) to front** and the position of every element.

### 7.1 Navbar (on every page)

Height ≈ 136 px. Cream (paper texture). 1 px bottom border `--line`. **Sticky at the top** (`position: sticky; top: 0`, opaque paper background, high z-index; no other visual change, no blur, no shrinking). It stays sticky only so navigation remains reachable during the hero scroll sequence. Measure its height with a `ResizeObserver` and expose it as the CSS variable `--nav-h`.

| Layer | Element | Position | Details |
|---|---|---|---|
| L0 | Background | Full width | Paper texture, bottom hairline |
| L1 | **Logo** (`logo.png`) | Left, x ≈ 5.7%–14.5%, vertically centered | Circular, ~127 px. Links to `/` |
| L1 | **Brand text** | Right of the logo (gap ~16 px), x ≈ 16%–37% | Line 1: "Amol Veg Resto" (Playfair, ~26 px, 700, `--brown-dark`). Line 2: "PURE VEG FOOD, FRESH AND SERVED FAST." (Poppins, ~10 px, uppercase, letter-spacing ~0.15em, `--brown-text`). Whole block links to `/` |
| L1 | **Nav links** | Centered in the space between the brand block and the CTA group (x ≈ 41%–70%) | In order: **Home** · **About** · **Gallery** · **Contact**, gaps ~56 px. Active page = orange text + 2 px orange underline (~6 px below the text). Home is active in the design |
| L1 | **Vertical divider** | x ≈ 74%, height ~50 px, centered | 1 px `--line` |
| L1 | **Call CTA group** | Right, x ≈ 78%–95% | Orange filled circle (~38 px) with white phone icon · "Call Now" (Poppins 500, ~14 px, `--brown-dark`) · thin `|` separator · "+91 72496 64983" (Poppins 400, ~14 px). The entire group is one link |

Implementation: flex row, `justify-content: space-between`, so the nav links sit centered between brand and CTA.

### 7.2 Hero

Design height ≈ 660 px (from the navbar bottom). The design image shows the hero at the **end of the scroll sequence** (frame 240). The pinned behavior is defined in 7.2.2. Cream paper background.

| Layer | Element | Position | Details |
|---|---|---|---|
| L0 | Page background | Full width | Paper texture |
| L1 | **Hero visual: canvas showing the frame sequence** (frames `1.jpg … 240.jpg`) | Centered, x ≈ 9%–93% (~84% width), top aligned just under the navbar | Frame aspect ratio (≈ 548 px tall at 1440). Edges blend into the cream background. No border or extra shadow. Frame 240 = the design |
| L2 | **Leaf sprigs** (left, right) | Left: x 0–6%, hero y ≈ 5%–45%, partially cropped by the viewport edge. Right: x 94–100%, hero y ≈ 40%–60% | Olive-green botanical sprigs, decorative only |
| L3 | **Left text block** | x ≈ 5.3%–26%, top ≈ 6% of hero height, left-aligned | See below |
| L3 | **Right text block** | Center-aligned, centered at x ≈ 88.7% (x ≈ 79%–98%), top ≈ 5% of hero height | See below |

**Left text block (top to bottom):**
1. Label: "PURE VEG. PURE TASTE." (small caps, `--brown-dark`)
2. Heading (one `<h1>`, three lines, Playfair 700 ~48 px):
   - Line 1: "Authentic" (dark brown)
   - Line 2: "Flavours" (**orange**)
   - Line 3: "Feel Like Home" (dark brown)
3. ~40 px gap, then small caps: "ALWAYS AMOL." (`--brown-text`, letter-spacing ~0.25em)

The text sits **above** the hero image layer (z-index): "Feel Like Home" ends just where the leftmost floating lid begins.

**Right text block (top to bottom, centered):**
1. Olive leaf-sprig icon (~34 px)
2. Label: "GOOD FOOD" (small caps)
3. Heading (Playfair 700 ~35 px, dark brown, two lines): "Brings" / "People Together"
4. Short orange line (~45 px × 2 px, centered)
5. Label: "SINCE 1990." (small caps)
6. **Button "EXPLORE MENU"** (see 7.2.1)

#### 7.2.1 Explore Menu button
Orange pill, ~209 × 51 px. Text "EXPLORE MENU" (Poppins 600, ~13 px, uppercase, letter-spacing ~0.08em, white) left-aligned with ~26 px left padding. At the right end, a white circle (~35 px) containing an orange arrow-right icon, inset ~8 px from the pill edge.
**Action:** smooth-scrolls to the "Our Popular Dishes" section (`#popular-dishes`), since there is no Menu page yet.

#### 7.2.2 Hero scroll sequence (the only animation on the site)

**Concept:** frames 1 → 240 show the copper dome lids starting covered over the dishes, then lifting and floating. Scrolling down plays the frames forward; scrolling up reverses them. Home only.

**Structure**
- `runway` (the hero `<section>`, `id="hero"`): height = `stage height + scrollVh` (250svh on desktop, 200svh on mobile, from `site.heroSequence`).
- `stage` (inside the runway): `position: sticky; top: var(--nav-h); height: var(--stage-h); overflow: hidden`, where `--stage-h: max(calc(100svh - var(--nav-h)), 46vw)`.
- Layers inside the stage (back → front): paper background → canvas (frames) → leaf sprigs → left and right text blocks and the Explore Menu pill. **Text, buttons and leaves are static during the whole sequence.**
- When the runway ends, the stage scrolls away and "Our Popular Dishes" follows immediately, exactly as in the design.

**Mechanics**
- Progress: `progress = clamp((navH - runway.top) / (runway.height - stage.height), 0, 1)`; `frame = round(progress * 239)` → draw `${n}.jpg` where `n = frame + 1`.
- Canvas: width ≈ 84% of the stage, height from the frame aspect ratio (set before any frame loads, so there is no layout shift). Draw each frame to fill the canvas exactly. High-DPI: scale by `devicePixelRatio`. Redraw only when the frame index changes.
- Events: passive `scroll` listener, throttled by one `requestAnimationFrame`; `ResizeObserver` for size changes; clean up on unmount. No React state updates per scroll tick.
- Loading: **no loader UI.** Load frame 1 first, then frame 240, then the rest in order (about 6 at a time). If the target frame isn't loaded yet, draw the nearest loaded frame.
- Start state: frame 1 (all dishes covered). End state: frame 240, identical to the design's hero.

**Blending:** the frames are JPG, so their background must merge into the paper texture with **no visible rectangle**. Use `mix-blend-mode: multiply` on the canvas plus a feathered edge mask (~6% fade on each edge). Compare with the design. If the frame background tone still differs from the page, sample the frame's edge color and tint the stage background to match, with a soft fade into the paper texture.

**Fallbacks:** with `prefers-reduced-motion: reduce` or without JavaScript, show the static `last frame idea 1.png` (same as frame 240) and set the runway height equal to the stage height (no extra scroll).

**Mobile:** same logic; layout per `Amol Veg Resto Mobile Homepage.png`; runway 200svh; the canvas fits the width and keeps the frame aspect ratio.

**Explore Menu:** smooth-scrolls to `#popular-dishes`; the sequence simply plays through while scrolling.

### 7.3 Our Popular Dishes (`id="popular-dishes"`)

| Layer | Element | Position | Details |
|---|---|---|---|
| L0 | Background | Full width | Paper texture |
| L1 | **Lotus divider** | Centered, ~25 px below the hero | See 4.5 |
| L2 | **Heading** | Centered, ~35 px below the divider | "Our " (dark brown) + "Popular Dishes" (**orange**), Playfair 700 ~54 px |
| L2 | **Subtitle** | Centered, ~16 px below the heading | "SIMPLE INGREDIENTS, MEMORABLE FLAVOURS." small caps, `--brown-text` |
| L3 | **Cards row** | x ≈ 4.5%–95.5%, ~35 px below the subtitle | 4 equal-width cards, gap ~22 px, each ~312 × 400 px |
| L4 | **Note** | Centered, ~35 px below the cards | Italic Playfair "Full menu coming soon." between two thin lines (~95 px each, gap ~14 px) |

**Card anatomy:** `--cream-card` background, radius ~14 px, soft shadow, overflow hidden.
- Top: food photo, full card width, ~232 px tall, `object-fit: cover`.
- Bottom (padding ~24 px): title (Poppins 600), description (Poppins 400 gray-brown, 2 lines), price (Playfair 700, orange) at the bottom-left.
- Cards are **not clickable** (no link, no hover lift).

| # | Photo | Title | Description | Price |
|---|---|---|---|---|
| 1 | Dosa with chutney/sambar bowls | Dish 1 | A delicious and wholesome dish made with fresh ingredients. | ₹120 |
| 2 | Idli plate on banana leaf | Dish 2 | Soft, fluffy and served with our special chutney & sambar. | ₹100 |
| 3 | Fried-rice bowl | Dish 3 | A flavourful and light option perfect for any time of the day. | ₹110 |
| 4 | Thali (rice, curry, papad) | Dish 4 | A complete and satisfying meal made with fresh, pure veg ingredients. | ₹150 |

### 7.4 About ("Our Story")

Two columns. Section height ≈ 560 px.

| Layer | Element | Position | Details |
|---|---|---|---|
| L0 | Background | Full width | Paper texture |
| L1 | **Peach back card** | Behind the image card, offset ~25 px left and ~20 px down | `--peach`, same size as the image card, radius ~28 px, **rotated ≈ −5°** |
| L2 | **Image card (placeholder)** | Right column, x ≈ 51%–91%, ~440 px tall | `--placeholder` fill, radius ~28 px, centered light "picture" icon (~90 px). Renders a real image instead when `about.image` is provided in config |
| L3 | **Text column** | Left column, x ≈ 8.6%–41.6%, vertically centered against the image | See below |

**Text column (top to bottom, left-aligned):**
1. Label: "ABOUT US" (small caps, **orange**)
2. Heading: "Our " (dark brown) + "Story" (**orange**), Playfair 700 ~64 px
3. Short orange underline (~52 px × 2 px) ~12 px below the heading
4. Paragraph (~17 px, `--brown-text`, 5 lines at this width):
   "Amol Veg Resto is a pure vegetarian restaurant in Sakhar Peth, Solapur. We serve fresh, tasty food in a clean, comfortable space, whether you dine in or take it home. Even on our busiest days, we keep the quality high and the service quick."
5. **Button "Read More →"** (outline, ~210 × 54 px, text "Read More" + arrow-right icon). **Action:** go to `/about`.

### 7.5 Gallery Preview

| Layer | Element | Position | Details |
|---|---|---|---|
| L0 | Background | Full width | Paper texture |
| L1 | **Vertical timeline** | Far left, x ≈ 5.8%, from the section top to ~245 px down | 1 px dark-brown vertical line with 4 nodes (small dot · **"01" disc** · small dot · small dot). The "01" disc is ~32 px, `--brown-dark` fill, white "01" (Poppins, ~11 px) |
| L2 | **Text block** | x ≈ 11%–40% | See below |
| L3 | **Arrow buttons** | Top-right, x ≈ 88.5% and 93.8%, ~28 px below the section top | Two outline circles (~51 px): arrow-left, arrow-right |
| L4 | **Carousel** | x ≈ 43%–100% (bleeds past the right viewport edge, so the 4th tile is cut off) | Row of tiles, each ~242 × 272 px, gap ~16 px, radius ~12 px, `--placeholder` fill with a centered light picture icon |

**Text block (top to bottom):**
1. Label: "GALLERY" (small caps, orange)
2. Heading, two lines (Playfair 700 ~54 px, dark brown, **no orange**): "A Glimpse of" / "Amol Veg Resto"
3. Paragraph: "Moments from our kitchen, dining space and the food we love to serve." (~17 px, `--brown-text`, wraps to 2 lines)
4. **Button "See More →"** (outline, ~207 × 56 px). **Action:** go to `/gallery`.

**Carousel behavior:** tiles snap; arrow buttons scroll by one tile (tile width + gap). The "01" disc shows the zero-padded index of the first fully visible tile (shows 01 at rest). There are at least 4 placeholder tiles; tiles show real photos when images are provided in config.

### 7.6 Testimonials ("What Our Guests Say")

| Layer | Element | Position | Details |
|---|---|---|---|
| L0 | Background | Full width | Paper texture |
| L1 | **Lotus divider** | Centered at the top | See 4.5 |
| L2 | **Heading** | Centered, ~35 px below the divider | "What Our " (dark brown) + "Guests Say" (**orange**), Playfair 700 ~54 px |
| L2 | **Rating line** | Centered, ~14 px below the heading | "3.9 ★ on Google" in **orange** + " · 253 reviews" in `--brown-text` (Poppins, ~18 px) |
| L3 | **Review cards** | x ≈ 9.5%–91%, ~35 px below the rating line | 2 cards side by side, gap ~30 px, columns ≈ 1.12fr / 1fr, equal height (~272 px) |
| L4 | **Pager buttons** | Centered, ~30 px below the cards | Two circle buttons (~51 px), gap ~25 px: **prev** (outline, arrow-left, `--brown-dark`) and **next** (filled orange, white arrow-right) |
| L4 | **Google link** | Centered, ~28 px below the pager | "Read more reviews on Google" + external-link icon, Poppins ~14 px, `--brown-dark`, with a thin orange-brown underline |

**Review card anatomy:** `--cream-card`, radius ~12 px, soft shadow, padding ~35 px.
- Top-left: large light-orange quote mark (~40 px).
- Review text (Poppins ~17 px, `--brown-dark`).
- Bottom-left: short orange line (~45 px × 2 px), then attribution (Poppins ~12 px, `--brown-text`).

| Card | Text | Attribution |
|---|---|---|
| 1 | "Everything I ordered was fresh, tasty, and well prepared. The service was quick and attentive even when the place was busy. Great to have a pure veg restaurant that keeps up both quality and speed." | Google Review |
| 2 | "All dishes are tasty, it's a nice place and hygienic." | Pavan Bandi · Google Review |

**Pager behavior:** the cards are a 2-per-view slider over the reviews list. With only 2 reviews, both are visible and the buttons keep their designed look (prev outlined, next filled orange) and do nothing until more reviews are added. Do not add a disabled/gray state.
**"Read more reviews on Google" action:** opens the Google Maps link in a new tab.

### 7.7 Footer (illustrated) + Bottom Bar

The footer overlaps the lower padding of the testimonials section: the illustration's top edge starts level with the pager row; its top area is transparent so the page background shows through.

| Layer | Element | Position | Details |
|---|---|---|---|
| L0 | **Footer illustration** (`footer background.png` or `footer background2.png`) | Full width, behind everything, height ≈ 450 px | Must match the design: olive leaf branches in the top-left and top-right corners; a dosa on a banana leaf with small bowls at the bottom-left; a sun, palm trees and a south-Indian temple (gopuram) with a river/town skyline across the middle; a hill fort with palms on the right; a red-and-white striped awning stall with a hanging lantern at the top-right; food bowls at the bottom-right |
| L1 | **Brand block** | Left, x ≈ 17%–31% | Logo (`logo.png`, ~167 px circle) with the italic tagline "Pure veg food, fresh and served fast." centered below it (Playfair italic ~16 px) and a small curved ornament under the tagline. Logo links to `/` |
| L1 | **Column dividers** | At x ≈ 35%, 48%, 65.5%, 78.5% | 1 px `--line`, ~110 px tall, vertically aligned with the columns |
| L1 | **Columns** | Over the illustration's light central area (no panel behind them) | 4 columns, see below |
| L2 | **Bottom bar** | Full width, 36 px tall, flush with the page bottom | `--brown-footer` background, cream text (Poppins ~11 px) |

**Columns (each heading: Playfair 700 ~16 px with a short orange underline ~26 px, 6 px below):**

| Column | x range | Content |
|---|---|---|
| **Quick Links** | ≈ 37%–46% | Four rows, each with a small line icon + text: home icon **Home** (`/`) · user icon **About** (`/about`) · image icon **Gallery** (`/gallery`) · phone icon **Contact** (`/contact`). Row gap ~26 px |
| **Visit Us** | ≈ 50%–63% | Row 1: map-pin icon + address (3+ lines, ~11 px) · Row 2: clock icon + "Opens 12 PM" · Row 3: phone icon + phone number (tap to call) · below: **button "Get Directions"** (dark-brown `--brown-footer` fill, ~186 × 32 px, radius ~6 px, small pin icon on the left, text "Get Directions" in cream, external-link icon on the right) |
| **Follow Us** | ≈ 67.5%–77% | Four circular icon buttons (~30 px, `--brown-footer` fill, cream icons), gap ~12 px: Instagram · Facebook · WhatsApp · YouTube |
| **Legal** | ≈ 80%–90% | Two rows, each with a document icon: **Privacy Policy** · **Terms & Conditions** |

**Bottom bar content (centered row, three items separated by 1 px cream-30% vertical dividers, ~40 px gaps):**
1. "© 2026 Amol Veg Resto. All rights reserved."
2. "FSSAI Lic. No: [TO BE ADDED]"
3. "Website by Nirvanaa Studios" + small external-link icon

---

## 8. Buttons, Links & Behavior

### 8.1 Action table

| Where | Element | Action |
|---|---|---|
| Navbar | Logo, brand text | Go to `/` |
| Navbar | Home / About / Gallery / Contact | Go to `/`, `/about`, `/gallery`, `/contact` (client-side routing). Current page = orange + underline |
| Navbar | Call Now group (icon + "Call Now" + number) | `tel:+917249664983` |
| Hero | Scrolling the page | Plays / reverses the frame sequence (7.2.2), no click action |
| Hero | EXPLORE MENU | Smooth scroll to `#popular-dishes` |
| Popular Dishes | Cards | Not clickable |
| About | Read More → | Go to `/about` |
| Gallery | See More → | Go to `/gallery` |
| Gallery | Arrow-left / arrow-right | Scroll the carousel one tile back / forward |
| Gallery | Tiles | Not clickable on Home |
| Testimonials | Pager prev / next | Slide the review list back / forward |
| Testimonials | Read more reviews on Google ↗ | Open the Google Maps link, **new tab** |
| Footer | Logo | Go to `/` |
| Footer | Quick Links (Home, About, Gallery, Contact) | Go to `/`, `/about`, `/gallery`, `/contact` |
| Footer | Phone number | `tel:+917249664983` |
| Footer | Address text | Plain text (no link) |
| Footer | Get Directions ↗ | Open the Google Maps link, **new tab** |
| Footer | Instagram / Facebook / YouTube | Open the configured URL, new tab (placeholders until supplied) |
| Footer | WhatsApp | Open `https://wa.me/917249664983`, new tab |
| Footer | Privacy Policy / Terms & Conditions | Go to `/privacy` / `/terms` |
| Footer | Website by Nirvanaa Studios ↗ | Open the agency URL, new tab (placeholder until supplied) |
| Footer | FSSAI Lic. No | Plain text |

External links use `target="_blank" rel="noopener noreferrer"`. Phone links use `tel:`.

### 8.2 Redirect flow

```
Navbar (every page) ──► Home / About / Gallery / Contact
                   └──► Call Now ──► tel:

Home
 ├─ Explore Menu ──► (scroll) Popular Dishes
 ├─ Read More ──► /about
 ├─ See More ──► /gallery
 ├─ Read more reviews on Google ──► Google Maps (new tab)
 └─ Footer
     ├─ Quick Links ──► /, /about, /gallery, /contact
     ├─ Get Directions ──► Google Maps (new tab)
     ├─ Social icons ──► external (new tab)
     ├─ Privacy Policy ──► /privacy
     ├─ Terms & Conditions ──► /terms
     └─ Website by Nirvanaa Studios ──► external (new tab)
```

### 8.3 Hover & focus (minimal, same style language)
- Nav links: orange text + underline on hover.
- Orange pill and orange circles: slightly darker orange.
- Outline buttons: fill with `--brown-dark`, text turns cream.
- Dark footer buttons and icon circles: slightly lighter brown.
- Text links (Google link, footer links): underline on hover.
- All interactive elements have a visible keyboard focus ring in orange.

---

## 9. Page Titles & Technical (invisible to the design)

| Route | `<title>` |
|---|---|
| `/` | Amol Veg Resto \| Pure Veg Restaurant in Sakhar Peth, Solapur |
| `/about` | About Us \| Amol Veg Resto, Solapur |
| `/gallery` | Gallery \| Amol Veg Resto, Solapur |
| `/contact` | Contact & Location \| Amol Veg Resto, Solapur |
| `/privacy` | Privacy Policy \| Amol Veg Resto |
| `/terms` | Terms & Conditions \| Amol Veg Resto |

- Add a meta description per page, `lang="en"`, favicon from `logo.png`.
- Exactly one `<h1>` per page. On Home it is the hero heading "Authentic Flavours Feel Like Home".
- `Restaurant` JSON-LD on Home: name, address, telephone, priceRange `₹200–400`, servesCuisine (Indian, Vegetarian), url, hasMap. **Do not add ratings or reviews to the schema.**
- `robots.txt` and `sitemap.xml` listing all six routes.
- Alt text: logo "Amol Veg Resto logo"; dish photos use the dish title; decorative leaves, lotus and ornaments are `alt=""`.

---

## 10. Other Pages (no visual design provided yet)

Build each as a simple stub that reuses the **same Navbar, Footer, tokens and components** as Home. No new visual ideas. Each page: Navbar → page title block (centered `SectionHeading` with the lotus divider above, Playfair ~54 px, two-tone where natural) → content → Footer.

**`/about`:** title "About Us". Content: the same "Our Story" paragraph as Home; then three short value blocks (**Pure Vegetarian**, **Hygiene First**, **Fresh Ingredients**) as cream cards; then an outline button "Visit Us" → `/contact`.

**`/gallery`:** title "Gallery". Content: a responsive grid of placeholder tiles (same tile style as the Home carousel); the tile array comes from config so photos can be added later.

**`/contact`:** title "Contact Us". Content: two columns. Left: address, phone (tap to call), opening time ("Opens 12 PM"), buttons **Call Now** (`tel:`) and **Get Directions** (Google Maps, new tab). Right: enquiry form with Name, Phone, Message, button "Send Message". Below: full-width embedded Google Map for the address with a fallback link "Open in Google Maps". Form is front-end only for now: validate (Name: "Please enter your name." · Phone: "Please enter a valid 10-digit phone number." · Message: "Please enter your message."), then show "Thank you! We'll get back to you soon." (error text: "Something went wrong. Please call us at +91 72496 64983.").

**`/privacy`:** title "Privacy Policy". Short sections: What we collect (name, phone and message sent through the Contact form) · How we use it (only to reply; never sold or shared) · Third-party links (Google Maps and social links have their own policies) · Contact · Last updated `[DATE]`. *Placeholder copy; owner to review.*

**`/terms`:** title "Terms & Conditions". Short sections: Use of website · Prices and timings may change · Content ownership · Contact · Last updated `[DATE]`. *Placeholder copy; owner to review.*

**404:** Navbar → heading "Page not found" → "Sorry, the page you're looking for doesn't exist or has moved." → outline button "Back to Home" → `/` → Footer.

---

## 11. Responsive

- **Desktop (≥ 1024 px):** exactly as designed above.
- **Mobile (≤ 768 px):** follow `Amol Veg Resto Mobile Homepage.png` section by section. Use the same text, colors, fonts and components; only the layout changes.
- **Tablet (769–1023 px):** scale the desktop layout; stack the About and Gallery columns; dish cards 2 × 2; review cards stacked; footer columns wrap to 2 × 2 under the brand block.
- Navbar on small screens: logo + brand on the left, a hamburger on the right opening a panel with Home, About, Gallery, Contact and the Call Now group.
- Never let the page scroll horizontally. The only intentionally clipped element is the gallery carousel's 4th tile.
- Hero sequence on mobile: same logic, layout per the mobile design, runway 200svh (see 7.2.2).

---

## 12. Visual QA Checklist (compare against the image)

- [ ] Section order and vertical spacing match the image.
- [ ] Every heading is two-tone **exactly** as listed: Authentic / **Flavours** / Feel Like Home · Our **Popular Dishes** · Our **Story** · A Glimpse of Amol Veg Resto (all dark) · What Our **Guests Say**.
- [ ] Hero text sits above the hero canvas; the right block is center-aligned with the leaf icon above "GOOD FOOD".
- [ ] Page load shows frame 1 (all dishes covered); scrolling plays the frames smoothly, and scrolling back reverses them.
- [ ] At the end of the runway the hero matches the design exactly (frame 240), and "Our Popular Dishes" follows right after.
- [ ] No visible rectangle or color mismatch around the frames, no loading screen, no layout shift.
- [ ] Navbar stays visible (sticky) during the whole sequence.
- [ ] Dish cards: 4 equal cards, photo on top, title/description/price below, price orange, no links.
- [ ] About image is a placeholder with a rotated peach card behind it.
- [ ] Gallery: timeline with the "01" disc on the left, tiles bleeding off the right edge, arrow buttons top-right.
- [ ] Reviews: prev outlined, next filled orange; Google link underlined with the external icon.
- [ ] Footer: illustration visible behind the columns, four columns with dividers, bottom bar with three items.
- [ ] All links and buttons behave as in section 8.1.
- [ ] No extra elements that are not in the design.

---

## 13. Open Items (confirm before launch)

- [ ] Instagram, Facebook and YouTube URLs.
- [ ] Nirvanaa Studios URL for the credit link.
- [ ] FSSAI license number.
- [ ] Final dish names, descriptions and prices (the design uses "Dish 1–4" placeholders).
- [ ] Real photos for the About image and the Gallery tiles (`interrior.jpg`, `interior2.jpg`, `main front.jpg` are available).
- [ ] Confirm +91 72496 64983 is correct (Google flags the number as possibly incorrect) and that it works on WhatsApp.
- [ ] Hero leaf sprigs: confirm whether they are baked into the hero image or supplied separately.
- [ ] Hero frames: confirm the frame background blends into the paper texture (no visible box). If not, re-export with a matching or transparent background.
- [ ] Hero frames: if each JPG is heavier than about 150 KB, compress them (about 1600 px wide, quality 80).
- [ ] Designs for About, Gallery, Contact, Privacy and Terms pages.
