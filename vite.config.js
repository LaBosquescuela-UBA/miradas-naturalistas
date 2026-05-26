import { defineConfig } from 'vite';

export default defineConfig({
  base: '/miradas-naturalistas/app/',
  build: {
    outDir: '../app/miradas-naturalistas/app',
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
