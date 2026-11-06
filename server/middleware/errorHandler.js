import { env } from '../config/env.js';

/**
 * 404 Not Found Middleware
 */
export function notFoundHandler(req, res, next) {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: `API route not found: ${req.method} ${req.path}` });
  }
  next();
}

/**
 * Centralized Error Handling Middleware (OWASP A5 / A9)
 * Sanitizes internal details so sensitive stack traces are never leaked in production.
 */
export function errorHandler(err, req, res, next) {
  // If headers already sent, delegate to Express default error handler
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.status || err.statusCode || 500;
  const isCORS = err.message && err.message.includes('CORS');

  if (isCORS) {
    return res.status(403).json({ error: 'Access forbidden: Origin not allowed.' });
  }

  // Log error responsibly
  if (statusCode >= 500) {
    console.error(`[Server Error] ${req.method} ${req.originalUrl}:`, err);
  } else {
    console.warn(`[Client Error ${statusCode}] ${req.method} ${req.originalUrl}: ${err.message}`);
  }

  const responsePayload = {
    error: statusCode === 500 && env.isProd ? 'An internal server error occurred.' : err.message || 'Unknown error',
  };

  if (!env.isProd && err.stack) {
    responsePayload.stack = err.stack;
  }

  return res.status(statusCode).json(responsePayload);
}

