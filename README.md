# Amol Veg Resto - AI-Powered Review Us System

A compliant, privacy-first, and mobile-friendly AI review drafting system for **Amol Veg Resto** (Sakhar Peth, Solapur).

---

## 1. Setting Environment Variables

The AI API key lives **strictly on the server** in a `.env` file (which is gitignored and never exposed to the frontend bundle or client network responses).

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Configure your environment variables in `.env`:
   ```env
   # Google Gemini API key (or Anthropic API key)
   AI_API_KEY=your_api_key_here

   # Model name (default: gemini-2.5-flash or claude-haiku-5-5)
   AI_MODEL=gemini-2.5-flash

   # Frontend origin allowed to access the backend API
   ALLOWED_ORIGIN=http://localhost:5173

   # Rate limits
   RATE_LIMIT_PER_MIN=12
   RATE_LIMIT_PER_DAY=100

   # Server port
   PORT=3001
   ```

---

## 2. Finding Your Google Place ID & Setting `GOOGLE_REVIEW_URL`

1. Open the [Google Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id).
2. Search for **"Amol Veg Resto, Sakhar Peth, Solapur"**.
3. Copy the alphanumeric Place ID (for example, `ChIJ...`).
4. Open `review.config.js` in the project root and replace `PLACE_ID_TODO`:
   ```javascript
   GOOGLE_REVIEW_URL: "https://search.google.com/local/writereview?placeid=YOUR_ACTUAL_PLACE_ID",
   ```

---

## 3. Editing Review Options & Phrase Bank

### A. Editing Review Options (`review.config.js`)
All review aspects, rating descriptions, and copy strings live in `review.config.js`:
```javascript
OPTIONS: [
  { id: "taste", label: "Food taste", positiveOnly: false },
  { id: "freshness", label: "Freshness", positiveOnly: false },
  { id: "speed", label: "Service speed", positiveOnly: false },
  { id: "staff", label: "Staff", positiveOnly: false },
  { id: "cleanliness", label: "Cleanliness", positiveOnly: false },
  { id: "value", label: "Value for money", positiveOnly: false },
  { id: "portions", label: "Portion size", positiveOnly: false },
  { id: "ambience", label: "Ambience & seating", positiveOnly: false },
  { id: "family", label: "Family-friendly", positiveOnly: false },
  { id: "takeaway", label: "Takeaway", positiveOnly: false },
  { id: "pureveg", label: "Pure veg", positiveOnly: true }, // Hidden on 1-3 star ratings
]
```

### B. Editing Phrase Bank & Local Templates (`reviewTemplates.js`)
Local drafts are generated instantly (0 ms, offline-ready) without network calls.
- `PHRASE_BANK.positive` (Stars 4–5): Openers, closers, connectors, and per-option phrases praising the dining experience.
- `PHRASE_BANK.neutral` (Star 3): Balanced, fair openers, closers, and per-option variations.
- `PHRASE_BANK.negative` (Stars 1–2): Constructive, polite, mild feedback for each aspect without hostility or exaggerated claims.

---

## 4. Running & Testing

### Start Backend Server:
```bash
npm run server
# Runs Node Express server on http://localhost:3001
```

### Start Frontend Dev Server:
```bash
npm run dev
# Vite runs on http://localhost:5173
```

### Testing the System:
1. **0ms Offline Local Drafts:**
   - In browser DevTools, switch Network to **Offline**.
   - Tap 5 stars and select "Food taste" and "Freshness".
   - An instant draft appears in `< 50ms`.
2. **AI Background Polish:**
   - Turn Network back **Online**.
   - Watch the subtle "Polishing with AI..." indicator stream polished natural text into the textarea.
3. **Manual Edit Protection:**
   - Type your own sentence into the review textarea.
   - Toggle chips or tap "Regenerate" — custom user edits are never automatically overwritten.
4. **Google Policy & Submit Flow:**
   - Ratings 1 to 5 all display the exact same Submit button (no review gating).
   - Tapping Submit copies the review to clipboard and opens Google Review in a new tab.
   - Screen switches to the "Review copied" confirmation with "Copy again" and "Open Google again" actions.

