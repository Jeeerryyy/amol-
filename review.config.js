/**
 * AI Review System - Central Configuration
 * All business details, timeouts, option definitions, and UI copy strings live here.
 */

export const REVIEW_CONFIG = {
  // Restaurant Information
  RESTAURANT_NAME: "Amol Veg Resto",
  AREA: "Sakhar Peth",
  CITY: "Solapur",

  // Target Google Review URL (Replace ChIJs1lJkU3bxTsRjoXzzGxpTGw with your real Google Place ID)
  GOOGLE_REVIEW_URL: "https://search.google.com/local/writereview?placeid=PLACE_ID_TODO",

  // API endpoint for AI review polishing
  API_ENDPOINT: "/api/generate-review",

  // Timing thresholds (milliseconds)
  DEBOUNCE_MS: 700,
  FIRST_TOKEN_TIMEOUT_MS: 3000,
  HARD_TIMEOUT_MS: 6000,

  // 1-5 Star descriptions
  STAR_LABELS: ["Poor", "Fair", "Good", "Very good", "Excellent"],

  // Review Aspects / Options (id, label, positiveOnly)
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
    { id: "pureveg", label: "Pure veg", positiveOnly: true },
  ],

  // UI Strings
  UI: {
    pageTitle: "Share Your Experience | Amol Veg Resto",
    ratingHeading: "How was your visit?",
    positiveAspectsHeading: "What did you like?",
    improveAspectsHeading: "What could we improve?",
    reviewBoxLabel: "Your review (you can edit it)",
    reviewPlaceholder: "Enter your review",
    regenerateButtonText: "Regenerate",
    polishingIndicator: "Polishing with AI...",
    submitButtonText: "Submit to Google Review",
    submitDisclaimer: "Your review is copied automatically and Google opens next.",
    reviewCopiedState: {
      heading: "Review copied!",
      instructions: "On Google: tap the review box, paste your review, and post.",
      copyAgainText: "Copy again",
      openGoogleAgainText: "Open Google again",
      copiedSuccessToast: "Copied to clipboard!",
    },
    backToHomeText: "Back to Home",
  },

  // Server-side default environment settings
  SERVER: {
    DEFAULT_MODEL: "gemini-2.5-flash",
    RATE_LIMIT_PER_MIN: 12,
    RATE_LIMIT_PER_DAY: 100,
  },
};

