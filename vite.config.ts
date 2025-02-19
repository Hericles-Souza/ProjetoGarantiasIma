import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';


export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@utils': '/src/app/utils',
      '@shared': '/src/app/shared',
      '@services': '/src/app/services',
      '@model': '/src/app/model',
      '@store': '/src/app/store',
      '@app': '/src/app',
      '@env': '/src/environments',
      '@assets': '/src/assets',
    },
  },
  define: {
    'process.env.API_URL': JSON.stringify(process.env.API_URL),
  },
});
