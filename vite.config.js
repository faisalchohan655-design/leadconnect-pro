import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: './',          // ✅ Explicitly set the root directory
  server: {
    port: 5173
  }
});
