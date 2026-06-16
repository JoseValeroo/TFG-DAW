import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // El único chunk grande es Ant Design, que se carga de forma diferida (lazy)
    // solo en /profilePage — no afecta a la carga inicial de la home/login.
    chunkSizeWarningLimit: 600,
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: false,
  },
});
