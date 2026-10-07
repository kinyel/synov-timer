# Raleston Consulting website

The marketing site for Raleston Consulting, a ServiceNow consultancy in Ottawa. Static Astro with CSS 3D models in the hero and most sections (no WebGL, no canvas), and a contact form that runs as a Cloudflare Pages Function.

**Stack:** Astro 7 (static output, strict TypeScript), GSAP with ScrollTrigger, Lenis, Tailwind CSS 4, MDX. Fonts are self-hosted (Alegreya Sans).

## Run, build, deploy

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # astro check + tsc + static build to dist/
npm run preview    # dist/ plus the contact function, via wrangler (reads .dev.vars)
npm run deploy     # build, then wrangler pages deploy dist
```

**Cloudflare Pages (Git integration):** build command `npm run build`, output directory `dist`, Node 20 or newer. The `functions/` folder is picked up automatically, so `/api/contact` deploys with the site.

`public/_headers` sets cache headers. `public/_redirects` keeps the old site's paths working (`/about-us`, `/contact-us`, `/careers`).

## Environment variables

None are secrets in the repository. Copy `.env.example` to `.env` and `.dev.vars.example` to `.dev.vars` for local work; both real files are git-ignored.

| Name | When | What |
|---|---|---|
| `PUBLIC_TURNSTILE_SITE_KEY` | build | Cloudflare Turnstile site key for the contact form. Without it the form posts with no spam check, which the function then refuses (unless `EMAIL_PROVIDER=log`). |
| `PUBLIC_SHOW_DRAFTS` | build | `true` shows draft posts, case studies and roles. Use it for preview branches only: such a build is noindex everywhere. |
| `TURNSTILE_SECRET_KEY` | runtime (secret) | Turnstile secret, verified on every submission. |
| `EMAIL_PROVIDER` | runtime | `resend`, `postmark`, `sendgrid`, or `log` (prints the message, sends nothing; local only). |
| `EMAIL_API_KEY` | runtime (secret) | API key for that provider. |
| `CONTACT_TO` | runtime | Where enquiries go, for example `info@ralestonconsulting.com`. |
| `CONTACT_FROM` | runtime | Sender on a domain verified with the provider, for example `Raleston website <web@ralestonconsulting.com>`. |

For local testing, Cloudflare's published test keys always pass: site key `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA`.

### The contact form

`src/pages/contact/index.astro` and `src/scripts/contact.ts` validate in the browser, load Turnstile on first focus, and send without leaving the page. `functions/api/contact.ts` validates again, checks Turnstile, drops honeypot submissions silently, and sends a plain-text email with Reply-To set to the visitor. Without JavaScript the form still posts and gets a small HTML reply. `?topic=itsm` (any service slug, `references`, `careers`, `tcpwave`) preselects "What do you need?"; the options live in `src/data/topics.ts`.

## Where to change things

| What | Where |
|---|---|
| Colours (CSS, Tailwind and the 3D) | `src/styles/tokens.css`; check pairs with `npm run contrast` |
| Contact details, stats, founder | `src/data/site.ts` |
| Every service page, and the service cards across the site | `src/data/services.ts` |
| Industries | `src/data/industries.ts` |
| Home FAQs | `src/data/faqs.ts` |
| Glossary | `src/data/glossary.ts` |
| Hero journey (the five levels) | `src/lib/journey.ts` |
| Home sections | `src/components/sections/` |
| Navigation and footer | `src/components/chrome/` |
| Font | `fonts` in `astro.config.mjs` |

Copy rule for this site: short. A headline, one line, a few short points. Depth goes behind a toggle. No em dashes.

## Adding content

All three collections are Markdown in `src/content/`. Anything with `draft: true` shows in `npm run dev` and in `PUBLIC_SHOW_DRAFTS=true` builds, and never in production.

- **Blog post:** `src/content/blog/<slug>.mdx` with `title`, `description`, `date`, `category` (CMDB, ITSM, ITOM, ITAM, AI, Architecture or Integrations), `tags`, optional `updated`, and `draft`. Category and tag pages, related posts, the RSS feed (`/rss.xml`) and the share image are generated.
- **Case study:** `src/content/case-studies/<slug>.md` with `title`, `summary`, `clientType`, `industry`, `challenge`, `approach[]`, `modules[]`, `results[]`, optional `quote`, and `draft`. Publish only what the client has approved, and only numbers they have measured. While none are published, the home page and `/case-studies/` show "coming soon" and offer references.
- **Job opening:** `src/content/roles/<slug>.md` with `title`, `location`, `type`, `summary`, `draft`. It appears on `/about/#careers`.

The three blog posts, three case studies and one role in the repository are drafts for review.

## SEO

- Every page has its own title and description, a canonical URL, Open Graph and Twitter tags, and JSON-LD (`src/layouts/Base.astro`): ProfessionalService and WebSite on every page, BreadcrumbList on inner pages, plus Service and FAQPage on service pages, BlogPosting, ContactPage, DefinedTermSet (glossary) and Person (founder).
- **Share images** are drawn at build time (`src/lib/og.ts`, served at `/og/<page path>.png`). A new page needs an entry in `ogPages()`.
- `sitemap-index.xml` (`@astrojs/sitemap`), `robots.txt` (`src/pages/robots.txt.ts`) and the RSS feed are generated.
- **Favicons and app icons** come from `public/brand/mark.svg`: run `npm run icons` after changing it.

## How the 3D works

- **The foundation** (ITSM, ITOM, ITAM on the CMDB) is deliberately plain: flat boxes in `Foundation.astro`.
- **The hero and the other sections (CSS 3D).** Pure HTML and CSS, so the text stays crisp:
  - The hero is in `Hero.astro` with `src/scripts/hero.ts`. On the first scroll the stack turns from diamonds to squares (an eased tween on `--turn`); the plate the request reaches turns its words level to the reader (`.lvl`, `--lv`); after the last level the stack turns back to diamonds and closes up.
  - The staircase of square tiles is `Services.astro`, driven from `src/scripts/scroll.ts`.
  - The small models (platform board, AI layer, case files, industry ring, assembling cube, TCPWave flow, and the plate stack on inner-page headers) are built from the `.s3d` / `.blk` primitives at the end of `src/styles/global.css`. `src/scripts/scenes.ts` drives their scroll progress (`--p`) and pointer tilt, and pauses them off screen. To make a new one, put blocks (`blk()` from `src/lib/iso.ts`) inside `<div class="s3d" data-s3d><div class="s3d-world">…</div></div>` and animate with `--p`.
- **Reduced motion:** no smooth scroll, no animation; every model shows in its finished state.

## Quality checks

```bash
npm run check      # astro check + tsc
npm run qa         # every page, desktop and phone: errors, broken links, overflow, one H1, titles, alt text, share image
npm run fps        # frame pacing down the home page (`npm run fps -- mobile` for a 4x-slowed phone)
npm run contrast   # WCAG AA for every colour pair
```

`npm run qa` and `npm run fps` need a server: `npx astro preview --port 4322` (or set `URL`). Other helpers in `scripts/`: `hero.mjs`, `herofps.mjs`, `herovideo.mjs`, `home.mjs`, `section.mjs`, `widths.mjs`, `tour.mjs`, `pixelcontrast.mjs`, `images.mjs`.

**Lighthouse (7 October 2026, local production build, Lighthouse 13):**

| | Performance | Accessibility | Best practices | SEO | LCP |
|---|---|---|---|---|---|
| Mobile, all 20 pages | 97 to 99 | 100 | 100 | 100 | 2.0 to 2.3 s |
| Desktop, all 20 pages | 100 | 100 | 100 | 100 | 0.5 s |

CLS is under 0.02 everywhere. Home page frame pacing: 60 fps on desktop through every section.

## Images: rights to confirm

Reused from the old site (originals in `reference/old-site/images/`, prepared by `scripts/images.mjs`):

| File | Used on | Rights |
|---|---|---|
| `about-2.png` | About: founder photo | Client's own; confirm |
| `team-datacentre.png` | About: team photo | Looks like stock; confirm the licence |
| `woman-desk.png` | Contact | Confirm the licence |

Not used: `ai-chat.png` and `any-cloud.webm` (ServiceNow marketing material with third-party logos), and the other old-site photos. Everything else on the site (3D models, icons, share images) is drawn in code for this project.

## Needed from the client before launch

- **Accounts:** a Turnstile site and secret key, and an email provider account with a verified sending domain (see Environment variables).
- **Case studies:** real, client-approved engagements to replace the drafts.
- **TCPWave:** Raleston's own TCPWave work (the LinkedIn post), and whether the implementation keeps network data aligned with the CMDB (TCPWave's own material does not cover it; its guide is from February 2021). Placeholders show in development only.
- **Confirm the typical durations:** advisory and strategy 2 to 6 weeks; implementation 8 to 16 weeks per release; integration 2 to 6 weeks per integration; support ongoing, with each upgrade 4 to 8 weeks.
- **Confirm the proposed offerings** marked "proposed: confirm with client" in `content/RESEARCH.md` (for example CSDM alignment, App Engine governance, AI agent design).
- **Image rights** (table above), and team photos if real ones exist.
- **Blog:** review and publish (or replace) the three draft posts.
- **Privacy:** a privacy policy page; the form promises to use details only to reply.

Integrity rules this site follows: no invented clients, case studies or numbers; the only figures are "up to 40% faster deployment" and "up to 60% higher user adoption"; Raleston is described as an independent ServiceNow consultancy, never a partner.
