import { env } from '../config/env.js';
import { SECURITY_HEADERS } from '../config/constants.js';

/**
 * Standard OWASP Top 10 Security Headers Middleware (A5 Security Misconfiguration)
 */
export function securityHeadersMiddleware(req, res, next) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // HSTS in production
  if (env.isProd) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Admin CSP for admin pages and admin API
  if (req.path.startsWith('/admin') || req.path.startsWith('/api/admin')) {
    res.setHeader('Content-Security-Policy', SECURITY_HEADERS.CSP_ADMIN);
  }

  next();
}

export { securityHeadersMiddleware as securityHeaders };
export default securityHeadersMiddleware;

