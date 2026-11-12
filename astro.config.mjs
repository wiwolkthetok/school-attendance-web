// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

import react from '@astrojs/react';

export default defineConfig({
  output: 'server',

  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },

  adapter: vercel(),

  server: {
    host: true,
    port: 4321,
  },

  devToolbar: {
    enabled: false,
  },

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['@libsql/client', 'jspdf', 'jspdf-autotable'],
    },
  },

  integrations: [react()],
});