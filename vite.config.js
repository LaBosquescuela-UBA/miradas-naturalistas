import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 4096,
    rollupOptions: {
      input: 'index.html'
    }
  },
  server: {
    port: 5173,
    open: true
  }
});
