import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'framer-motion': ['framer-motion'],
          'lucide': ['lucide-react'],
        }
      }
    },
    chunkSizeWarningLimit: 600
  },
  server: {
    port: 3000,
    host: true
  }
});
