// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// `site` feeds canonical URLs, sitemap, and OG tags.
const SITE_URL = 'https://tanjalshukla.com';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
