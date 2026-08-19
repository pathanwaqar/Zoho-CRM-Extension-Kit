import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Widgets are static assets served from wherever you host `dist/` (e.g.
// Catalyst Web Client Hosting or any static host) and registered in CRM
// under Setup → Developer Space → Widgets with that URL.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
  },
});
