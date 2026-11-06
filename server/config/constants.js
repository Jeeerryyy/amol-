export const SESSION_COOKIE_NAME = 'amol_admin_session';
export const SESSION_TTL_DAYS = 7;
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export const CLOUDINARY_ALLOWED_FOLDERS = [
  'restaurant/menu',
  'restaurant/dishes',
  'restaurant/gallery',
  'restaurant/popular',
  'restaurant/seo',
];

export const RATE_LIMITS = {
  LOGIN_MAX_ATTEMPTS: 5,
  LOGIN_LOCKOUT_MS: 15 * 60 * 1000,
  QR_SCANS_PER_MIN: 30,
  REVIEW_EVENTS_PER_MIN: 30,
};

export const SECURITY_HEADERS = {
  CSP_ADMIN: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com; connect-src 'self' https://api.cloudinary.com https://generativelanguage.googleapis.com; media-src 'self' blob: https://res.cloudinary.com https://videos.pexels.com;",
};

