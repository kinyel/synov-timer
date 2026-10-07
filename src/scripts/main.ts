import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { $introDone, $progress, $reducedMotion, $scene, live, type SceneId } from '../lib/store';
import { initScroll } from './scroll';
import { initNav } from './nav';
import { initHero } from './hero';
import { initScenes } from './scenes';
import { rectOf, track } from '../lib/layout';

gsap.registerPlugin(ScrollTrigger, SplitText);
// Mobile address bars resize the viewport while scrolling; re-measuring every
// trigger then would shift pinned content mid-gesture.
ScrollTrigger.config({ ignoreMobileResize: true });

const html = document.documentElement;
const reduced = html.classList.contains('reduced-motion');
$reducedMotion.set(reduced);
const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];

/* ── Smooth scroll (native touch scrolling kept on mobile) ─────────────── */
let lenis: Lenis | null = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.085, syncTouch: false, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}
const { closeMenu } = initNav(lenis, reduced);
for (const a of $$<HTMLAnchorElement>('a[href^="#"]:not([data-nav-jump]), a[href^="/#"]:not([data-nav-jump])')) {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href')!;
    if (href.startsWith('/#') && location.pathname !== '/') return;
    const target = $(href.replace(/^\//, ''));
    if (!target) return;
    e.preventDefault();
    closeMenu();
    if (lenis) lenis.scrollTo(target, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else target.scrollIntoView();
  });
}

/* ── Scroll velocity, for skew / flow effects ──────────────────────────── */
let lastY = scrollY;
gsap.ticker.add(() => {
  const v = scrollY - lastY;
  lastY = scrollY;
  live.velocity = v;
  const target = Math.min(1, Math.abs(v) / 45);
  live.speed += (target - live.speed) * (target > live.speed ? 0.25 : 0.06);
});

/* ── Hero headline: split-line reveal ──────────────────────────────────── */
const lines = $$('[data-hero-title] [data-line] > span');
const kicker = $('[data-hero-kicker]');
const intro = $('[data-hero-intro]');
const ctas = $$('[data-hero-ctas] > *');
const cue = $('[data-journey-cue]');
// Text must be readable at once (it is the LCP element), so this only plays on first paint.
// Reduced motion: nothing is split or animated; the text simply sits there.
const title = $('[data-hero-title]');
if (!reduced) {
  // aria: 'none' keeps the words as plain text (aria-label is not allowed on a bare span).
  const splits = lines.map((l) => new SplitText(l, { type: 'words', wordsClass: 'inline-block', aria: 'none' }));
  title?.classList.add('is-revealing');
  gsap
    .timeline({ defaults: { ease: 'expo.out' } })
    .call(() => title?.classList.remove('is-revealing'), [], 1.75)
    .from(lines, { yPercent: 108, rotate: 3, duration: 1.4, stagger: 0.11 }, 0)
    .from(splits.flatMap((s) => s.words), { letterSpacing: '0.04em', duration: 1.6, stagger: 0.04 }, 0)
    .from(kicker, { opacity: 0, y: 14, duration: 1 }, 0.15)
    .from(intro, { opacity: 0, y: 18, duration: 1.1 }, 0.45)
    .from(ctas, { opacity: 0, y: 18, duration: 1, stagger: 0.08 }, 0.6)
    .from($$('[data-hero-stats] > div'), { opacity: 0, y: 16, duration: 1, stagger: 0.08 }, 0.8)
    .from(cue, { opacity: 0, duration: 1.2 }, 1.1);
}
// There is no curtain any more: the page is ready as soon as it paints.
$introDone.set(true);

/* ── Scroll choreography (sections, staircase, nav theme) ──────────────── */
initScroll(reduced, lenis);
initHero(reduced);
initScenes(reduced);
for (const section of $$('[data-scene]')) {
  const id = section.dataset.scene as SceneId;
  ScrollTrigger.create({ trigger: section, start: 'top 55%', end: 'bottom 55%', onToggle: (s) => s.isActive && $scene.set(id) });
}
// Nav colours follow whichever section is under the nav (themes can change mid-section).
// Positions come from the layout cache: no layout reads in the frame loop.
const themed = $$('[data-scene]');
for (const s of themed) track(s);
gsap.ticker.add(() => {
  for (const section of themed) {
    const r = rectOf(section);
    if (r.top <= 40 && r.bottom > 40) {
      const theme = section.dataset.theme ?? 'light';
      if (html.dataset.theme !== theme) html.dataset.theme = theme;
      break;
    }
  }
});
ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => $progress.set(s.progress) });

/* ── Copy to clipboard (email, phone) ──────────────────────────────────── */
for (const btn of $$<HTMLButtonElement>('[data-copy]')) {
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy ?? '');
      btn.dataset.copied = '';
      const label = btn.getAttribute('aria-label') ?? '';
      btn.setAttribute('aria-label', 'Copied');
      setTimeout(() => {
        delete btn.dataset.copied;
        btn.setAttribute('aria-label', label);
      }, 1600);
    } catch {
      /* Clipboard blocked: the visible link still works. */
    }
  });
}

/* ── Reveals: content rises in as it enters ─────────────────────────────── */
// Only below the first screen, so nothing visible on load waits for script.
if (!reduced) {
  const items = $$('[data-reveal]').filter((el) => el.getBoundingClientRect().top > innerHeight);
  gsap.set(items, { opacity: 0, y: 28 });
  ScrollTrigger.batch(items, {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, overwrite: true }),
  });
}

/* ── Image parallax: photos drift a little inside their masks ─────────── */
if (!reduced) {
  for (const el of $$('[data-parallax]')) {
    const amount = Number(el.dataset.parallax) || 0.1;
    gsap.fromTo(
      el,
      { yPercent: -amount * 100 },
      { yPercent: amount * 100, ease: 'none', scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: true } },
    );
  }
}

/* ── Custom cursor (fine pointers) ─────────────────────────────────────── */
const dot = $('[data-cursor-dot]');
const ring = $('[data-cursor-ring]');
if (html.classList.contains('has-cursor') && dot && ring) {
  // Hidden until the pointer first moves, so it never sits in the corner.
  gsap.set([dot, ring], { opacity: 0 });
  addEventListener('pointermove', () => gsap.to([dot, ring], { opacity: 1, duration: 0.3 }), { once: true });
  const dx = gsap.quickTo(dot, 'x', { duration: 0.08 });
  const dy = gsap.quickTo(dot, 'y', { duration: 0.08 });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'expo.out' });
  const ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'expo.out' });
  addEventListener('pointermove', (e) => (dx(e.clientX), dy(e.clientY), rx(e.clientX), ry(e.clientY)));
  document.addEventListener('pointerover', (e) => {
    const target = e.target as Element;
    // Nav controls have their own hover states; the cursor steps back to a small ring there.
    const quiet = target.closest('[data-cursor="none"], [data-nav]');
    const over = !quiet && target.closest('a, button, [data-magnetic]');
    gsap.to(ring, { scale: quiet ? 0 : over ? 1.9 : 1, backgroundColor: over ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0)', duration: 0.45, ease: 'expo.out' });
    gsap.to(dot, { scale: over || quiet ? 0 : 1, duration: 0.3 });
  });
  document.addEventListener('mouseleave', () => gsap.to([dot, ring], { opacity: 0, duration: 0.3 }));
  document.addEventListener('mouseenter', () => gsap.to([dot, ring], { opacity: 1, duration: 0.3 }));
}

/* ── Magnetic buttons ──────────────────────────────────────────────────── */
if (!reduced && matchMedia('(pointer: fine)').matches) {
  for (const el of $$('[data-magnetic]')) {
    const x = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'elastic.out(1, 0.4)' });
    const y = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'elastic.out(1, 0.4)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * 0.35);
      y((e.clientY - (r.top + r.height / 2)) * 0.45);
    });
    el.addEventListener('pointerleave', () => (x(0), y(0)));
  }
}

/* ── Hooks for screenshot tooling ──────────────────────────────────────── */
declare global {
  interface Window {
    __raleston?: { live: typeof live; lenis: Lenis | null; introDone: () => boolean };
  }
}
window.__raleston = { live, lenis, introDone: () => $introDone.get() };
