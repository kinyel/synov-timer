// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

/**
 * The /lab scene tuner is injected only for `astro dev`, so it never ships
 * in a production build.
 * @returns {import('astro').AstroIntegration}
 */
function labRoute() {
  return {
    name: 'raleston:lab',
    hooks: {
      'astro:config:setup': ({ command, injectRoute }) => {
        if (command === 'dev') injectRoute({ pattern: '/lab', entrypoint: './src/lab/lab.astro' });
      },
    },
  };
}

export default defineConfig({
  site: 'https://ralestonconsulting.com',
  output: 'static',
  integrations: [labRoute()],
  devToolbar: { enabled: false },
  vite: {
    plugins: [tailwindcss()],
    // The WebGL chunk (three + postprocessing) is ~320 KB gzipped and loads after first paint by design.
    build: { assetsInlineLimit: 0, chunkSizeWarningLimit: 1100 },
  },
});
