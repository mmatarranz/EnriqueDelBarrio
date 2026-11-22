import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://enriquedelbarrio.es',
  base: '/prueba',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
