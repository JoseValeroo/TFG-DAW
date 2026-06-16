import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      css: {
        additionalData: `@import "@nextui-org/react/dist/css/nextui.css";`
      },
    },
  },
});
