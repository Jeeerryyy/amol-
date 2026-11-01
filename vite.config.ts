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
    watch: {
      ignored: [
        '**/backup menu design/**',
        '**/.git/**',
        '**/*.mp4',
        '**/public/**/*.mp4',
        '**/assets/**/*.mp4',
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
    },
  },
});

