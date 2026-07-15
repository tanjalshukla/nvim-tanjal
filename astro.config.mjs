// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// TODO(owner): confirm the real domain (SPEC.md §14 item 1) and replace this
// placeholder before shipping — `site` feeds canonical URLs, sitemap, and OG tags.
const SITE_URL = 'https://tanjal.dev';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
