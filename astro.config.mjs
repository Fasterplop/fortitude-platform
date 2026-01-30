import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://fortitudeins.us', // Dominio final necesario para sitemap/canonical
  integrations: [react(), tailwind()],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: {
        prefixDefaultLocale: false // / para inglés, /es/ para español
    }
  }
});