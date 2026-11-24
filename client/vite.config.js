import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev server binds 0.0.0.0 so the live preview proxy can reach it.
// /api requests are proxied to the Express backend (no CORS needed in dev).
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true, // allow sandbox preview host
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
});
