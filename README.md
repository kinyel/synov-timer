# Raleston Consulting website

A scroll-driven 3D marketing site in the style of an architect's white model: one Raleston campus, one gold accent, navy type.

**Stack:** Astro (static output) with strict TypeScript, vanilla Three.js, `postprocessing` with N8AO, GSAP with ScrollTrigger, Lenis and Tailwind. Everything 3D is procedural code, so there are no model files to manage.

## Run, build and deploy

```bash
npm install
npm run dev          # http://localhost:4321  (dev-only tuning page: /lab)
npm run build        # astro check + tsc + static build to dist/
npm run preview      # serve dist/ locally with Cloudflare's wrangler
npm run deploy       # build, then `wrangler pages deploy dist`
```

**Cloudflare Pages (Git integration):**
- Build command: `npm run build`
- Output directory: `dist`
- Node version: 20 or newer

`public/_headers` sets long cache headers for hashed assets.

## Where to change things

| What | Where |
|---|---|
| Colours (DOM) | `src/styles/global.css` → `@theme` |
| Colours (3D palette) | `src/lib/palette.ts` |
| Colours (model materials: clay, glass, gold, copper, trees, roads) | `src/webgl/scenes/campus/materials.ts` |
| Hero copy | `src/components/sections/Hero.astro` |
| Craft value props | `src/components/sections/Craft.astro` |
| Expertise names and one-liners | `src/components/sections/Expertise.astro` |
| Services | `src/components/sections/Services.astro` |
| Industry names, short labels and one-liners | `src/webgl/scenes/city/districts.ts` (`DISTRICTS`) |
| Stats and the band text | `src/components/sections/Impact.astro` |
| Contact details | `src/components/sections/Contact.astro` and the JSON-LD in `src/layouts/Base.astro` |
| SEO title and description | `src/pages/index.astro` |
| Share image | `public/og.png` (regenerate with `node scripts/og.mjs` while `npm run dev` runs) |

## How it fits together

- **One canvas.** `#webgl` is one transparent canvas fixed behind the page.
- **Layers, bottom to top:**
  1. Section backgrounds and giant type (`.layer-bg`, z 0)
  2. The canvas (z 10)
  3. Readable copy (`.layer-copy`, z 20)
- **Clipping.** `src/scripts/scroll.ts` clips the canvas to whichever 3D sections are on screen (`data-webgl="campus" | "city"`). Services and Impact are page-only, so the canvas never paints over them.
- **Worlds.**
  - `src/webgl/scenes/campus/` is the campus. It drives the hero, the Craft orbit, the Expertise tour and x-ray, and Contact at dusk.
  - `src/webgl/scenes/city/` is the floating city used by Industries.
  - Camera framings are "shots" (`src/webgl/core/shots.ts`), blended by section progress.
- **Scroll to 3D.** DOM ScrollTriggers write progress into `src/webgl/scroll.ts`, and the scenes read it every frame.
- **Quality tiers.** `src/lib/tier.ts` maps detect-gpu results to a tier. Tiers scale DPR, shadow size, AO and bloom resolution; the look stays the same. Force a tier with `?tier=0` to `?tier=3`.
- **Fallbacks.**
  - `prefers-reduced-motion`: no smooth scroll, no intro or headline animation, and no handheld camera drift.
  - No WebGL: a complete static page with the logo as hero art.

## Performance notes

- **One loop.** The 3D renders from GSAP's ticker, after Lenis has moved the scroll and the DOM choreography has run, so page and 3D never drift a frame apart.
- **No layout reads per frame.** Section positions come from `src/lib/layout.ts` (measured on load and resize, then derived from the scroll position), and style writes skip unchanged values.
- **First viewport first.** Only the campus is built and compiled before the curtain lifts. The x-ray lines and the Industries city are built, compiled with their own lights, and drawn once off-screen in idle time (or on demand).
- **GPU follows what's visible.** When only part of the screen shows 3D (section boundaries), the scene, AO and output passes are confined to that band; a still sliver stops re-rendering entirely.
- **Quality tiers** (`src/lib/tier.ts`) cap DPR at 1.5, skip SMAA where the canvas is already supersampled, and only step down for real GPU slowness (a steady 30 fps from energy saver doesn't count), applied when it can't be seen.

## Checking your work

These need a server running (`npm run dev`, or `npm run build && npx astro preview --port 4322` with `URL=http://localhost:4322/`). Add `?debug` to the page URL to expose the engine in production builds.

```bash
node scripts/shots.mjs                  # hero intro and scroll frames, desktop and phone, plus video
node scripts/visual-complete.mjs        # cold load: first text and hero fully built (fast 4G)
node scripts/budget.mjs desktop         # per-frame CPU and GPU ms across Services → Industries
node scripts/twitch.mjs mobile 0.12     # stop with 12% of Industries visible; prints stability
node scripts/navstable.mjs              # header position through the Services transition
node scripts/section.mjs industries 0.1 0.5 0.95   # one section at chosen progress points
node scripts/widths.mjs                 # overflow check at 360–1920 px
```

Screenshots land in `shots/`, which git ignores.

## Not built yet

- **Contact form.** Contact is copy-to-clipboard plus `mailto:` and `tel:` links. If you want a form, add a Cloudflare Pages Function (`functions/api/contact.ts`) with Turnstile.
- **Blog and About pages.** The current site has them; they're out of scope here.
