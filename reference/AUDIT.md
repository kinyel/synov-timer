# Audit before v4

6 October 2026. This covers the current build (this repo, deployed at https://synov-timer.pages.dev/), the primetrack.rw hero, and the old site at ralestonconsulting.com.

**What was captured**

| Folder | Contents |
|---|---|
| `reference/before/` | 14 scroll points of the current build, each at 1440×900 (`desktop-*`) and 390×844 (`mobile-*`): 28 screenshots |
| `reference/primetrack/` | The primetrack.rw hero at 15 scroll steps: `d-00` to `d-14` (desktop) and `m-00` to `m-14` (mobile) |
| `reference/old-site/` | Text, titles and links from `/`, `/about-us` and `/blog` as JSON, plus every image at full size in `images/` |

The deployed page and the local build are the same: they have the same `<title>`, and the screenshots were taken from a production build.

---

## 1. Titles and labels with no real explanation

The whole current site has about **970 words**, and that count includes the navigation and the labels that appear twice (once as a 3D tag, once on a card). Every practice, stage and sector gets one sentence or less.

| Where | What the visitor sees | What's missing |
|---|---|---|
| Hero | "Architecting digital empires with ServiceNow." Below it: "Certified architects for ITSM, ITOM, IT Asset Management, scoped applications and enterprise architecture. Each building on this campus is one of those practices." | Acronyms are never expanded. The hero never says which building is which, or what Raleston actually does for a client. |
| Craft | Kinetic type "MASTER CRAFTSMEN / NOT JUST CONFIGURATORS". Three cards: "Architect-led excellence", "Lightning results: Value in weeks, not months", "Empire building: Platforms that scale with your ambitions" | "Architect-led" is never explained in practice: who leads, what they do, how it differs from other firms. "Value in weeks" has nothing behind it. "Empire building" is a slogan. |
| Expertise, 3D tags | "App Engine: Custom apps, built to order" · "ITSM: Service desk and change" · "ITAM: Every asset accounted for" · "ITOM: Problems caught early" · "Integration: Systems that share data" · "Ent. Arch.: Structure that scales" | Taglines only. |
| Expertise, cards | A place name, the practice name and one sentence. For example: "The asset warehouse / ITAM / Hardware and software tracked from purchase to retirement..." | No definition. No why-it-matters. No deliverables, no AI, no link to more. "ITAM" is never expanded. |
| X-ray | "Six practices. One platform." "The scan shows what sits inside each building: shared data, common standards and the integrations..." | It never says what the shared data is (the CMDB), or why it matters. |
| Services (staircase) | "From roadmap to run." Four stages, one line each, for example "Advisory & Strategy: A roadmap and priorities that reduce complexity and maximize ROI." | What happens at each stage, what you get, how long it takes, who is involved. |
| Industries, 3D tags | "Finance: Audit-ready operations" · "Healthcare: Clinical systems kept running" · "Government: Services built to policy" · "Tech: Room to scale" · "Manufacturing: Plant and asset workflows" · "Energy: Field service at scale" | Taglines only. |
| Industries, cards | Eyebrows describe the model, not the business ("Glass towers", "Hospital and helipad", "The ring campus"). One sentence per sector. | No ServiceNow use cases for any sector. |
| Industries, intro and outro | "Six districts. One platform." · "Every district, connected. At dusk the whole city is lit by the same network..." | A metaphor with no information in it. |
| Impact | "What architect-led delivery changes." 40% and 60%. A band reading "VALUE IN WEEKS, NOT MONTHS". | The stats are real and stay. The band is unexplained. The counters are tied to scroll position, so they can stop mid-count: the mobile capture shows **58%** (`mobile-13-impact.png`). |
| Contact | "Let's architect your empire." plus one line, email, phone | No form, and nothing about what happens after you get in touch. |
| Nav flyouts | Practice and sector names with the same taglines | Every link jumps to a scroll position on one page. There are no pages to link to. |
| Footer | "© Raleston Consulting · ServiceNow architects · Ottawa" | No sitemap, no links, no CTA band. |

**Missing entirely**
- **CMDB.** It is the founder's signature strength, and ITSM, ITOM and ITAM all depend on it.
- **ITAM detail:** SPM, and HAM/SAM/EAM as separate things.
- **AI:** Now Assist (now ServiceNow Otto), skills, AI agents and MCP.
- **TCPWave.**
- **Proof and people:** FAQs, case studies, About and the founder, careers.
- **Other pages:** blog, glossary.

## 2. Sections that say too little about what Raleston does

- **One page only.** There is one title and one meta description, and no page targets "ServiceNow ITOM implementation", "CMDB health assessment" or "ServiceNow partner Canada".
- **Hero.** It never states the offer in plain words: "we design, implement, integrate and support ServiceNow".
- **Expertise.** One sentence per practice is not enough for a buyer who doesn't know ServiceNow, and gives a technical buyer nothing.
- **Services.** No process, deliverables, durations or roles.
- **Industries.** No sector-specific use cases.
- **Proof.** The only proof is the two stats. There is no founder, no "who you will work with" and no case studies or reference offer.
- **Next step.** There is no contact form and no description of the first conversation.

## 3. Too many 3D scenes

| Scene | v4 |
|---|---|
| Hero campus | **Replace** with the request journey (SVG, not 3D) |
| Craft orbit around HQ | **Remove** the building backdrop. Keep the kinetic type and explain "architect-led" under it. |
| Six expertise buildings | **Keep three:** ITSM, ITOM and ITAM, on a new CMDB slab |
| X-ray | **Keep.** Remap it so each building's internals land on the CMDB slab: records, relationships, discovery. |
| Spiral staircase (CSS 3D) | **Keep and recolour** |
| Industries floating city | **Remove.** Photo-led industry cards instead. |
| Contact at dusk (campus) | **Remove** (my recommendation). The brief says one page has too many scenes, and the final CTA works as a navy glow band. |

## 4. What is worth keeping

- **Performance architecture.**
  - One fixed canvas and one GSAP ticker.
  - A layout cache instead of per-frame reads.
  - Scissor-banded rendering, with a still sliver that rests.
  - GPU tiers that drop quality only while off screen, and ignore battery frame caps.
  - Idle precompile and a warm render.
  - Measured result: the hero is fully built in 2.7 s on desktop and 3.1 s on a phone with 4× CPU throttling.
- **The procedural campus kit.** `Kit`, the building generators, and materials with the build, x-ray and scan uniforms. The ITSM, ITOM and ITAM buildings, trees, vans and people all carry over and get restyled.
- **The spiral staircase.** Geometry, choreography, the mobile framing and the entry and exit blends. Only the colours change.
- **Navigation.**
  - Sticky header with no twitch.
  - Condense hysteresis.
  - Flyouts and the mobile sheet.
  - It gains real page links and a persistent "Talk to an architect" button.
- **Motion system.**
  - Lenis and ScrollTrigger on one clock.
  - Split-text reveals and magnetic buttons.
  - Reduced-motion and no-WebGL fallbacks.
- **Verification scripts:** budget, twitch, navstable, widths, seam, visual-complete.
- **Contact details** with copy-to-clipboard buttons.
- **Real content:**
  - the 40% and 60% stats
  - the four service names
  - the six industries
  - the values and the founder bio

---

## 5. primetrack.rw hero: how it behaves

**Desktop (1440×900)**

1. **Screen one**
   - **Background:** near-black, with a soft warm orange radial wash, low and to the right.
   - **Left column:**
     - an orange eyebrow behind a short double rule
     - a two-line H1
     - a lead paragraph
     - two CTAs: solid orange "Talk to an expert" and a dark outline "Explore solutions"
   - **Top right:** one small glowing orange dot marks where the route will start. No route is visible yet.
2. **First scroll**
   - The hero copy scrolls away normally.
   - The report block rises and **pins**. It has an eyebrow ("What a PrimeTrack unit reports"), an H2, a paragraph and two big stats ("5 m location accuracy", "10 s update interval").
   - The eyebrow's rule runs to a **01 / 04 counter** at the right, and the rule fills as a progress meter.
3. **The route (right side)**
   - It is an SVG (`viewBox 0 0 360 1000`, one cubic S-curve) that **draws itself downward**.
   - A dark base track (3 px, `rgb(27,31,38)`) sits under a glowing orange trace. The trace has a gradient that fades toward its tail and a blur glow filter, and it is drawn with `pathLength` and a dash offset.
   - The glowing **dot** rides the head of the trace.
4. **Waypoints.** Four white nodes sit on the route, each with a small side label (Position and route, Fuel, Driver behaviour, Video). The labels alternate sides.
5. **The list (left)**
   - Under the pinned block, the active row is bright ("01 · POSITION AND ROUTE / You know where it is." plus one line).
   - The rows below it sit on a **drum**:
     - tilted back about 17°, 34° and 51°
     - pushed back 152, 304 and 456 px
     - faded to about 1, 0.2, 0.1 and 0 opacity
   - Each time the dot reaches a node, the list **glides up one row** and the counter steps.
6. **Length.** The section is 3300 px tall at 1440×900 (about 3.7 screens). The "spiral" section follows it.

**Mobile (390×844)**
- There is no route at all. The same content simply stacks: the hero, then the report block with stats, then the four numbered rows with icons.
- The warm glow sits on the right edge.
- The v4 brief asks for more than this: a slim glowing rail on the left edge, with the dot travelling it.

**What we take:** the structure, the timing and the drum list, retold for ServiceNow with five steps.

**What we leave:** their orange, their content and their code. The palette becomes navy with indigo, violet and azure glows, and a Gold route.

---

## 6. Old site (ralestonconsulting.com): content and images

**Copy to reuse (tightened, not pasted)**
- the H1 and intro
- the four service paragraphs
- the ITSM tab's three bullets
- the value props
- the four "Why Raleston" points
- the stats
- the industries
- the five FAQ questions
- from About: mission, evolution, four values with their kickers, and the founder bio
- the contact details

**Errors to fix**
- The footer `mailto:` goes to **info@ralestonsconulting.com**, a typo for ralestonconsulting.
- The About page title says **"Ralestone Consulting"**.
- The About footer says © 2025; Home says © 2026.
- The five FAQs have **no answers**.
- The Blog page ("ServiceNow Insights from the Field") has **no posts**.
- `/services`, `/contact-us` and `/contact` return 404. The only real paths are `/`, `/about-us` and `/blog`, and those must keep working (or redirect).

**Images** (downloaded at full size to `reference/old-site/images/`)

| File | Size | What it is | Treatment | Planned use | Rights |
|---|---|---|---|---|---|
| `logo.png` | 596×280 | Gold "R" mark and wordmark | Rebuild the wordmark as SVG next to the existing `mark.svg` | Header, footer, OG | Client's own |
| `navy-wave.png` | 1440×1583 | Abstract navy wave | Use as is | Section background | Confirm |
| `team-datacentre.png` | 1856×1100 | Team standing in a data centre | **Crop the baked gold-to-navy frame** | Why Raleston, About | Confirm (looks like stock) |
| `engineers-racks.png` | 1899×1100 | Two engineers at server racks | **Crop the frame** | ITOM and ITAM pages | Confirm |
| `ai-chat.png` | 1899×1100 | ServiceNow "Powered by AI agents" art with a chat bubble | **Crop the frame** | AI section, **only if rights are confirmed** | **High risk: ServiceNow marketing** |
| `man-desk.png` | 1899×1100 | Man at a desk | Framed duplicate of `about-1.png`; use `about-1` | Careers or Contact | Confirm |
| `woman-desk.png` | 960×540 | Woman at a desk | No frame. Small, so use it in a card or mask, not full-bleed. | Contact, Careers | Confirm |
| `team-glass-icons.png` | 3840×2160 | Team with floating glass icons | Highest resolution of the set | Industries or AI section | Confirm |
| `about-1.png` | 960×540 | Unframed copy of `man-desk` | Small | Card | Confirm |
| `about-2.png` | 705×829 | **Founder, Charles**, on a white background | Cut-out or duotone | Founder spotlight | Client's own (confirm) |
| `any-cloud.webm` | 17 s, 1920×1080 | ServiceNow "any AI, any data, any workflow, any cloud" with third-party logos | None | **Recommend not using:** third-party trademarks, and it's ServiceNow's message, not Raleston's | High risk |

Most photos top out around 1900×1100. They will look soft full-bleed on a 2× display at 1920 px wide, so they belong in masks, cards and split layouts. Every reused image will be listed in the README for rights confirmation.

---

## 7. Terminology flags (details in `content/RESEARCH.md`, section 1)

1. **Now Assist is being renamed ServiceNow Otto** (announced May 2026; ServiceNow says Otto "is replacing the Now Assist name"). Recommended wording: "ServiceNow Otto (formerly Now Assist)". This changes the hero lead and step 01.
2. **"Skills"**
   - The Now Assist Skill Kit is now the **AI Skill Kit**.
   - Hero step 02 says "Skills ... send it to the right team", but generative skills don't route tickets. Routing is done by AI agents, Predictive Intelligence and assignment rules.
   - The reworded step is in RESEARCH.md, section 8.
3. **MCP**
   - The MCP Server has been generally available since 5 May 2026, as part of Action Fabric.
   - Step 04 ("AI agents pull context from other tools") uses the **MCP Client**, which needs the Zurich release or later.
   - Both are governed by AI Control Tower.
4. **"ServiceNow consulting partner"** in the eyebrow needs confirming. If Raleston isn't in the ServiceNow Partner Program, it should say "ServiceNow consultancy".
5. **TCPWave.** TCPWave's own material doesn't mention CMDB sync, so that line is marked "proposed: confirm with client".

---

## 8. Plan (steps 2 to 6)

1. **Colour system and hero journey** (next checkpoint)
   - **Tokens:**
     - in the CSS `@theme`
     - in a shared `palette.ts` that Three.js reads too
     - checked with a contrast script that tests every text and background pair for AA
   - **Fonts:** self-hosted.
   - **Hero, HTML first:**
     - an SVG route with a glow filter and a Gold gradient trace
     - a pinned left column with a 01/05 counter, a meter and the drum list
     - on mobile, a slim glowing rail on the left
     - with reduced motion or no JavaScript, a stacked list
   - **Proof:** Playwright frames at several scroll points on desktop and mobile, plus a short recording.
2. **CMDB section and staircase**
   - ITSM, ITOM and ITAM restyled (white and grey-100 facades, navy glass with Azure light, Gold trim with bloom) on a glowing CMDB slab with Azure data lines.
   - The x-ray maps onto the slab.
   - Glass panels with the full explanation and a "For technical teams" expander.
   - Loaded lazily, so the hero's text is the largest contentful paint (LCP).
   - The staircase recoloured: navy and indigo steps, Gold edges, an Azure to Violet to Gold light path.
   - Mobile parity.
3. **Everything else**
   - The remaining Home sections.
   - The pages:
     - 8 product pages and 4 delivery pages
     - a services overview
     - Case Studies (collection; 3 drafts)
     - About + Careers (roles collection)
     - Blog (MDX, RSS; 3 draft posts)
     - Glossary
     - Contact (form, Turnstile, a Pages Function, env vars)
     - TCPWave (placeholders)
   - A `_redirects` file for `/about-us`.
4. **SEO and Lighthouse**
   - JSON-LD, the sitemap, `robots.txt`, canonical URLs, Open Graph images built per page, favicons and the manifest.
   - Lighthouse on every page, with fixes until everything meets the targets.
5. **README**
   - Run, build and deploy to Cloudflare Pages.
   - The form's environment variables.
   - How to add case studies, posts and roles.
   - Inputs still needed from the client:
     - TCPWave content
     - real case studies
     - image rights
     - team photos
     - partner status
