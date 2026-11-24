import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-menu-html',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/menu' || req.url === '/menu/') {
            req.url = '/menu/index.html';
          } else if (req.url === '/special-menu' || req.url === '/special-menu/') {
            req.url = '/menu/index.html';
          }
          next();
        });
      },
    },
  ],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy-Report-Only': "default-src 'self'; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https: ws:; media-src 'self' https: blob:; frame-src 'self' https://www.google.com https://maps.google.com; require-trusted-types-for 'script';",
    },
    watch: {
      ignored: [
        '**/backup menu design/**',
        '**/.git/**',
        '**/*.mp4',
        '**/public/**/*.mp4',
        '**/assets/**/*.mp4',
        '**/public/hero-frames/**',
        '**/assets/ezgif-6b64a8c72c352624-jpg/**',
        '**/docs/**',
        '**/baseline-screenshots/**',
        '**/audit-artifacts/**',
      ],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/q': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/qr': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
