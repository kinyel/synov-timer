// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

/** A Latin-subset Poppins file from the @fontsource package. */
const poppins = (/** @type {string} */ v) => `./node_modules/@fontsource/poppins/files/poppins-latin-${v}.woff2`;

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
  // Poppins (SIL Open Font License), Latin subset, served from this site.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Poppins',
      cssVariable: '--font-poppins',
      fallbacks: ['Helvetica Neue', 'Arial', 'sans-serif'],
      options: {
        variants: [
          { weight: 400, style: 'normal', src: [poppins('400-normal')] },
          { weight: 400, style: 'italic', src: [poppins('400-italic')] },
          { weight: 500, style: 'normal', src: [poppins('500-normal')] },
          { weight: 600, style: 'normal', src: [poppins('600-normal')] },
          { weight: 700, style: 'normal', src: [poppins('700-normal')] },
          { weight: 800, style: 'normal', src: [poppins('800-normal')] },
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
