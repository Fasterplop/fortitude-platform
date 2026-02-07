import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  // Dominio final necesario para sitemap/canonical
  site: 'https://fortitudeins.us',

  integrations: [react(), tailwind()],

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: {
        prefixDefaultLocale: false // / para inglés, /es/ para español
    }
  },

  adapter: cloudflare()
});