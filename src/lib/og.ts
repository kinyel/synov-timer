/**
 * Every page's share card (1200×630, /og/<page path>.png), drawn at build
 * time with satori and sharp. Base.astro points each page's og:image here,
 * so a new page needs an entry in `ogPages()`.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { getCollection } from 'astro:content';
import { SERVICES } from '../data/services';
import { visible } from './drafts';
import { posts, slugify } from './blog';

export interface OgPage {
  /** Page path without slashes at either end; "home" for /. */
  slug: string;
  eyebrow: string;
  title: string;
  /** Words of the title set in light iris, as on the page. */
  lit?: string;
}

export async function ogPages(): Promise<OgPage[]> {
  const all = await posts();
  const cases = (await getCollection('caseStudies')).filter(visible);
  const pages: OgPage[] = [
    { slug: 'home', eyebrow: 'ServiceNow consultancy · Ottawa', title: 'Architecting digital empires with ServiceNow', lit: 'digital empires' },
    { slug: 'services', eyebrow: 'Services', title: 'ServiceNow services, from roadmap to run', lit: 'roadmap to run' },
    ...SERVICES.map((s) => ({ slug: `services/${s.slug}`, eyebrow: s.kind === 'platform' ? `Platform · ${s.short}` : 'How we deliver', title: s.headline })),
    { slug: 'case-studies', eyebrow: 'Case studies', title: 'ServiceNow work we can show you', lit: 'show you' },
    ...cases.map((c) => ({ slug: `case-studies/${c.id}`, eyebrow: `Case study · ${c.data.industry}`, title: c.data.title })),
    { slug: 'about', eyebrow: 'About Raleston', title: 'The architects of excellence', lit: 'excellence' },
    { slug: 'blog', eyebrow: 'Blog', title: 'ServiceNow insights from the field', lit: 'from the field' },
    ...all.map((p) => ({ slug: `blog/${p.id}`, eyebrow: `Blog · ${p.data.category}`, title: p.data.title })),
    ...[...new Set(all.map((p) => p.data.category))].map((c) => ({ slug: `blog/category/${slugify(c)}`, eyebrow: 'Blog · Category', title: `${c} articles`, lit: c })),
    ...[...new Set(all.flatMap((p) => p.data.tags))].map((t) => ({ slug: `blog/tag/${slugify(t)}`, eyebrow: 'Blog · Tag', title: `${t} articles`, lit: t })),
    { slug: 'contact', eyebrow: 'Contact', title: 'Talk to a ServiceNow architect', lit: 'ServiceNow architect' },
    { slug: 'glossary', eyebrow: 'Glossary', title: 'ServiceNow terms, in plain English', lit: 'in plain English' },
    { slug: 'solutions/tcpwave', eyebrow: 'Integration spotlight', title: 'TCPWave and ServiceNow: network changes, automated', lit: 'network changes, automated' },
  ];
  return pages;
}

/* ── Drawing ───────────────────────────────────────────────────────────── */

type El = { type: string; props: { style?: Record<string, unknown>; children?: unknown; [k: string]: unknown } };
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): El => ({ type, props: { style, children, ...extra } });

const C = { night: '#040a16', navy: '#0a1d3b', iris: '#4247af', irisSoft: '#8e93f6', violet: '#a755f9', azure: '#2490f4', gold: '#ecbc04', goldGlow: '#ffe27a', white: '#ffffff', grey200: '#d3d7e2', grey400: '#9aa1b5' };

let assets: Promise<{ fonts: { name: string; data: Buffer; weight: 400 | 600 | 700; style: 'normal' }[]; mark: string }> | undefined;
const load = () =>
  (assets ??= (async () => {
    const font = (w: number) => readFile(join(process.cwd(), `node_modules/@fontsource/poppins/files/poppins-latin-${w}-normal.woff`));
    const [r, sb, b, mark] = await Promise.all([font(400), font(600), font(700), readFile(join(process.cwd(), 'public/brand/mark.svg'))]);
    return {
      fonts: [
        { name: 'Poppins', data: r, weight: 400, style: 'normal' },
        { name: 'Poppins', data: sb, weight: 600, style: 'normal' },
        { name: 'Poppins', data: b, weight: 700, style: 'normal' },
      ],
      mark: `data:image/svg+xml;base64,${mark.toString('base64')}`,
    };
  })());

export async function renderCard(page: OgPage): Promise<Buffer> {
  const { fonts, mark } = await load();
  const len = page.title.length;
  const size = len > 60 ? 46 : len > 40 ? 54 : 62;
  // Words inside the lit phrase are set in light iris.
  const from = page.lit ? page.title.indexOf(page.lit) : -1;
  const to = from + (page.lit?.length ?? 0);
  let at = 0;
  const words = page.title.split(' ').map((w) => {
    const start = page.title.indexOf(w, at);
    at = start + w.length;
    const lit = from >= 0 && start >= from && start < to;
    return h('span', { marginRight: Math.round(size * 0.24), color: lit ? C.irisSoft : C.white }, w);
  });

  // The hero's platform in cross-section: five plates on a thread of light.
  const plates = h(
    'div',
    { position: 'absolute', top: 70, right: 70, width: 300, height: 470, display: 'flex' },
    [
      h('div', { position: 'absolute', left: 149, top: 30, width: 2, height: 400, backgroundImage: `linear-gradient(180deg, ${C.gold}00, ${C.gold} 30%, ${C.goldGlow} 60%, ${C.gold}00)`, boxShadow: `0 0 14px ${C.gold}` }),
      ...[0, 1, 2, 3, 4].map((i) =>
        h('div', {
          position: 'absolute',
          left: 50,
          top: i * 72,
          width: 200,
          height: 200,
          borderRadius: 26,
          border: `2px solid ${i === 2 ? C.goldGlow : `${C.irisSoft}${i === 1 || i === 3 ? '66' : '3a'}`}`,
          backgroundColor: i === 2 ? `${C.gold}1f` : `${C.iris}${i === 1 || i === 3 ? '24' : '14'}`,
          boxShadow: i === 2 ? `0 0 40px ${C.gold}88` : 'none',
          transform: 'scaleY(0.42) rotate(45deg)',
        }),
      ),
      h('div', { position: 'absolute', left: 143, top: 237, width: 14, height: 14, borderRadius: 14, backgroundColor: C.goldGlow, boxShadow: `0 0 26px 8px ${C.gold}` }),
    ],
  );

  const tree = h(
    'div',
    {
      position: 'relative',
      width: 1200,
      height: 630,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '64px 72px 56px',
      fontFamily: 'Poppins',
      color: C.white,
      backgroundColor: C.night,
      backgroundImage: `radial-gradient(circle at 92% 0%, ${C.iris}88 0%, transparent 48%), radial-gradient(circle at 0% 100%, ${C.violet}44 0%, transparent 46%), linear-gradient(180deg, ${C.night} 0%, ${C.navy} 100%)`,
    },
    [
      plates,
      // Brand
      h('div', { display: 'flex', alignItems: 'center', gap: 18 }, [
        h('img', { width: 70, height: 60 }, undefined, { src: mark, width: 70, height: 60 }),
        h('div', { display: 'flex', flexDirection: 'column', lineHeight: 1.05 }, [
          h('span', { fontSize: 30, fontWeight: 700 }, 'Raleston'),
          h('span', { fontSize: 24, fontWeight: 400, color: C.grey400 }, 'Consulting'),
        ]),
      ]),
      // Eyebrow and title
      h('div', { display: 'flex', flexDirection: 'column', gap: 26 }, [
        h(
          'div',
          { display: 'flex', alignSelf: 'flex-start', padding: '8px 18px', borderRadius: 999, border: `1.5px solid ${C.irisSoft}66`, backgroundColor: `${C.iris}33`, color: C.irisSoft, fontSize: 22, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' },
          page.eyebrow,
        ),
        h('div', { display: 'flex', flexWrap: 'wrap', maxWidth: 700, fontSize: size, fontWeight: 600, lineHeight: 1.08, letterSpacing: -1 }, words),
      ]),
      // The gold thread, and the address
      h('div', { display: 'flex', alignItems: 'center', gap: 28 }, [
        h('div', { display: 'flex', width: 220, height: 4, borderRadius: 4, backgroundImage: `linear-gradient(90deg, ${C.gold}00 0%, ${C.gold} 55%, ${C.goldGlow} 100%)`, boxShadow: `0 0 18px ${C.gold}` }),
        h('div', { display: 'flex', width: 12, height: 12, borderRadius: 12, marginLeft: -34, backgroundColor: C.goldGlow, boxShadow: `0 0 22px 6px ${C.gold}` }),
        h('span', { fontSize: 22, fontWeight: 700, color: C.grey200, whiteSpace: 'nowrap' }, 'ralestonconsulting.com'),
        h('span', { marginLeft: 'auto', fontSize: 19, color: C.grey400, whiteSpace: 'nowrap' }, 'ServiceNow consultancy · Ottawa, Canada'),
      ]),
    ],
  );

  const svg = await satori(tree as unknown as Parameters<typeof satori>[0], { width: 1200, height: 630, fonts });
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
