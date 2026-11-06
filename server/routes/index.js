import express from 'express';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';
import publicRoutes, { invalidatePublicCache } from './publicRoutes.js';
import { handleGenerateReview } from '../controllers/reviewGenController.js';

const router = express.Router();

// Robots.txt Route (Disallowing /admin and /special-menu)
router.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Disallow: /admin
Disallow: /admin/
Disallow: /api/admin/
Disallow: /special-menu
Disallow: /special-menu/
Disallow: /review
Disallow: /review/
Allow: /
Allow: /menu
Allow: /menu/
`);
});

// Cache invalidation hook on admin mutations
router.use('/api/admin', (req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    invalidatePublicCache();
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        invalidatePublicCache();
      }
    });
  }
  next();
});

// Mount modular sub-routers
router.use('/api/admin/auth', authRoutes);
router.use('/api/admin', authRoutes); // Allows /api/admin/login and /api/admin/logout directly
router.use('/api/admin', adminRoutes);
router.post('/api/generate-review', handleGenerateReview);
router.use('/', publicRoutes); // Dynamic QR redirect (/q/:code) and /api/public/*

export default router;

