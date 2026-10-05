import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { $introDone, $loadProgress, $progress, $reducedMotion, $scene, $sceneReady, $webgl, live, SCENES, type SceneId } from '../lib/store';
import { reportLoad } from '../lib/loader';
import { initScroll } from './scroll';
import { initNav } from './nav';

gsap.registerPlugin(ScrollTrigger, SplitText);

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

/* ── Pointer (desktop) and touch-drag (mobile) ─────────────────────────── */
addEventListener(
  'pointermove',
  (e) => {
    if (e.pointerType !== 'mouse') return;
    live.pointer.x = (e.clientX / innerWidth) * 2 - 1;
    live.pointer.y = -(e.clientY / innerHeight) * 2 + 1;
    live.pointerActive = true;
  },
  { passive: true },
);
document.addEventListener('mouseleave', () => (live.pointerActive = false));
// touchmove keeps firing during native scrolling, so the tower can follow the finger.
let touch: { x: number; y: number } | null = null;
addEventListener('touchstart', (e) => (touch = e.touches[0] ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null), { passive: true });
addEventListener(
  'touchmove',
  (e) => {
    const t = e.touches[0];
    if (!t || !touch) return;
    live.drag.x += ((t.clientX - touch.x) / innerWidth) * 2;
    live.drag.y = gsap.utils.clamp(-1, 1, live.drag.y + ((t.clientY - touch.y) / innerHeight) * 1.5);
    touch = { x: t.clientX, y: t.clientY };
  },
  { passive: true },
);
addEventListener('touchend', () => {
  touch = null;
  gsap.to(live.drag, { y: 0, duration: 1.2, ease: 'elastic.out(1, 0.4)' });
});

/* ── Hero headline: split-line reveal ──────────────────────────────────── */
const lines = $$('[data-hero-title] [data-line] > span');
const kicker = $('[data-hero-kicker]');
const intro = $('[data-hero-intro]');
const ctas = $$('[data-hero-ctas] > *');
const heroCard = $('[data-hero-card]');
// Text must be readable at once (it is the LCP element): reveal on first paint, not on WebGL.
// Reduced motion: nothing is split or animated; the text simply sits there.
if (!reduced) {
  const splits = lines.map((l) => new SplitText(l, { type: 'words', wordsClass: 'inline-block' }));
  const headlineIn = gsap.timeline({ defaults: { ease: 'expo.out' } });
  headlineIn
    .from(lines, { yPercent: 108, rotate: 4, duration: 1.4, stagger: 0.11 }, 0)
    .from(splits.flatMap((s) => s.words), { letterSpacing: '0.04em', duration: 1.6, stagger: 0.04 }, 0)
    .from(kicker, { opacity: 0, y: 14, duration: 1 }, 0.15)
    .from(intro, { opacity: 0, y: 18, duration: 1.1 }, 0.45)
    .from(ctas, { opacity: 0, y: 18, duration: 1, stagger: 0.08 }, 0.6);
  if (heroCard && innerWidth < 768) headlineIn.from(heroCard, { opacity: 0, y: 30, duration: 1.2 }, 0);
}

/* ── Preloader → hero ──────────────────────────────────────────────────── */
const pre = $('#preloader');
const preCount = $('[data-pre-count]');
const preBar = $('[data-pre-bar]');
const preLabel = $('[data-pre-label]');
document.fonts.ready.then(() => reportLoad('fonts', 1));

if (pre && preCount && preBar) {
  const shown = { v: 0 };
  let exiting = false;
  const render = () => {
    preCount.textContent = String(Math.round(shown.v * 100)).padStart(3, '0');
    gsap.set(preBar, { scaleX: shown.v });
  };
  $loadProgress.subscribe((p) =>
    gsap.to(shown, { v: p, duration: 0.55, ease: 'power2.out', overwrite: true, onUpdate: render, onComplete: maybeExit }),
  );
  const exit = () => {
    if (exiting) return;
    exiting = true;
    gsap
      .timeline({ onComplete: () => pre.remove() })
      .to([preCount, preLabel], { yPercent: -30, opacity: 0, duration: 0.45, ease: 'power3.in', stagger: 0.04 })
      .call(() => $introDone.set(true), [], 0.35)
      .to(pre, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.15, ease: 'expo.inOut' }, 0.3);
  };
  function maybeExit() {
    if (shown.v >= 0.999 && $sceneReady.get()) exit();
  }
  $sceneReady.subscribe((r) => r && maybeExit());
  $webgl.subscribe((w) => w === 'unavailable' && exit());
  // Never hold the page hostage.
  setTimeout(() => !exiting && ($loadProgress.set(1), exit()), 10000);
}

/* ── WebGL: its own chunk, requested after the DOM has painted ─────────── */
const canvas = $<HTMLCanvasElement>('#webgl canvas');
if (canvas) requestAnimationFrame(() => requestAnimationFrame(() => import('../webgl/boot').then((m) => m.boot(canvas))));

/* ── Scroll choreography (sections, canvas clip, nav theme) ───────────── */
initScroll(reduced, lenis);
for (const section of $$('[data-scene]')) {
  const id = section.dataset.scene as SceneId;
  ScrollTrigger.create({ trigger: section, start: 'top 55%', end: 'bottom 55%', onToggle: (s) => s.isActive && $scene.set(id) });
}
// Nav colours follow whichever section is under the nav (themes can change mid-section).
gsap.ticker.add(() => {
  for (const section of $$('[data-scene]')) {
    const r = section.getBoundingClientRect();
    if (r.top <= 40 && r.bottom > 40) {
      const theme = section.dataset.theme ?? 'light';
      if (html.dataset.theme !== theme) html.dataset.theme = theme;
      break;
    }
  }
});
ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => $progress.set(s.progress) });

/* ── Progress indicator ────────────────────────────────────────────────── */
const progressEl = $('[data-progress]');
if (progressEl) {
  const idx = $('[data-progress-index]', progressEl)!;
  const label = $('[data-progress-label]', progressEl)!;
  const bar = $('[data-progress-bar]', progressEl)!;
  $introDone.subscribe((d) => d && gsap.to(progressEl, { opacity: 1, duration: 1, delay: 1.6 }));
  $scene.subscribe((id) => {
    const i = SCENES.findIndex((s) => s.id === id);
    idx.textContent = String(i + 1).padStart(2, '0');
    label.textContent = SCENES[i]?.label ?? '';
    gsap.fromTo(label, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'expo.out' });
  });
  $progress.subscribe((p) => gsap.set(bar, { scaleX: p }));
}

/* ── Custom cursor (fine pointers) ─────────────────────────────────────── */
const dot = $('[data-cursor-dot]');
const ring = $('[data-cursor-ring]');
if (html.classList.contains('has-cursor') && dot && ring) {
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
    __raleston?: { live: typeof live; lenis: Lenis | null; ready: () => boolean; introDone: () => boolean };
  }
}
window.__raleston = { live, lenis, ready: () => $sceneReady.get(), introDone: () => $introDone.get() };
