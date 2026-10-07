// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

/** A Latin-subset Alegreya Sans file from the @fontsource package. */
const alegreya = (/** @type {string} */ v) => `./node_modules/@fontsource/alegreya-sans/files/alegreya-sans-latin-${v}.woff2`;

export default defineConfig({
  site: 'https://ralestonconsulting.com',
  output: 'static',
  // Inline every stylesheet: no render-blocking CSS requests on a slow first visit.
  build: { inlineStylesheets: 'always' },
  integrations: [
    mdx(),
    // Share cards (/og/…) and error pages are not pages to index.
    sitemap({ filter: (page) => !page.includes('/og/') && !page.endsWith('/404/') }),
  ],
  devToolbar: { enabled: false },
  // Alegreya Sans (SIL Open Font License), Latin subset, served from this site.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Alegreya Sans',
      cssVariable: '--font-alegreya',
      fallbacks: ['Helvetica Neue', 'Arial', 'sans-serif'],
      options: {
        variants: [
          { weight: 400, style: 'normal', src: [alegreya('400-normal')] },
          { weight: 400, style: 'italic', src: [alegreya('400-italic')] },
          { weight: 500, style: 'normal', src: [alegreya('500-normal')] },
          { weight: 700, style: 'normal', src: [alegreya('700-normal')] },
          { weight: 800, style: 'normal', src: [alegreya('800-normal')] },
        ],
      },
    },
  ],
  vite: {
    plugins: [tailwindcss()],
    // cssTarget includes Safari 16, so the minifier adds -webkit- prefixes (backdrop-filter) itself.
    // Write only the standard property in source: a hand-written prefixed copy after it makes the
    // minifier drop the standard one, which Chrome needs.
    build: { assetsInlineLimit: 0, cssTarget: ['chrome107', 'edge107', 'firefox104', 'safari16'] },
  },
});
