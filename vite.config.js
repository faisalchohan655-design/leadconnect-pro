import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: './',
  server: {
    port: 5173
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: new URL('./index.html', import.meta.url).pathname
      }
    }
  }
});
