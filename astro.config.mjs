import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

import cloudflare from '@astrojs/cloudflare';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Dominio final necesario para sitemap/canonical
  site: 'https://fortitudeins.us',
  output: 'static',

  integrations: [react(), tailwind(), sitemap()],

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: {
        prefixDefaultLocale: false // / para inglés, /es/ para español
    }
  },

  adapter: cloudflare({
    // Habilita el proxy para simular el entorno de Cloudflare correctamente
    platformProxy: {
      enabled: true,
    },
  }),

  // SOLUCIÓN DEL ERROR 500:
  vite: {
    resolve: {
      alias: {
        // Forza a las librerías a usar el módulo nativo soportado por 'nodejs_compat'
        stream: "node:stream",
      }
    }
  }
});