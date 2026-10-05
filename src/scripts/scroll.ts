import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { live } from '../lib/store';
import { anchors, scroll, type World } from '../webgl/scroll';

/**
 * Section choreography: writes section progress into `scroll` for the WebGL
 * scenes, clips the canvas to the sections that use 3D, and drives each
 * section's DOM layer (cards, labels, kinetic type).
 */
export function initScroll(reduced: boolean) {
  const $ = <T extends HTMLElement = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
  const $$ = <T extends HTMLElement = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];
  const html = document.documentElement;
  const canvasWrap = $('#webgl');

  // ── Progress per section ──────────────────────────────────────────────
  const track = (sel: string, key: 'hero' | 'craft' | 'expertise' | 'industries' | 'contact', start: string, end: string) => {
    if (!$(sel)) return;
    ScrollTrigger.create({ trigger: sel, start, end, onUpdate: (s) => (scroll[key] = s.progress) });
  };
  track('#hero', 'hero', 'top top', 'bottom top');
  track('#craft', 'craft', 'top top', 'bottom bottom');
  track('#expertise', 'expertise', 'top top', 'bottom bottom');
  track('#industries', 'industries', 'top top', 'bottom bottom');
  track('#contact', 'contact', 'top bottom', 'top top');

  // ── Camera owner, world, and canvas clip, every frame ──────────────────
  const sections = $$('[data-scene]');
  const webglSections = sections.filter((s) => s.dataset.webgl);
  gsap.ticker.add(() => {
    const mid = innerHeight / 2;
    for (const s of sections) {
      const r = s.getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) {
        const id = s.dataset.scene as typeof scroll.owner;
        if (s.dataset.webgl) scroll.owner = id;
        break;
      }
    }
    // Clip the canvas to the on-screen 3D sections of ONE world (the one with
    // the most screen area), so DOM-only sections (services, impact) between
    // two worlds are never painted over.
    const spans = new Map<World, { top: number; bottom: number }>();
    for (const s of webglSections) {
      const r = s.getBoundingClientRect();
      const t = Math.max(0, r.top);
      const b = Math.min(innerHeight, r.bottom);
      if (b - t < 1) continue;
      const w = s.dataset.webgl as World;
      const span = spans.get(w);
      spans.set(w, span ? { top: Math.min(span.top, t), bottom: Math.max(span.bottom, b) } : { top: t, bottom: b });
    }
    let world: World = 'none';
    let top = 0;
    let bottom = 0;
    for (const [w, span] of spans) {
      if (span.bottom - span.top > bottom - top) {
        world = w;
        top = span.top;
        bottom = span.bottom;
      }
    }
    scroll.world = world;
    if (canvasWrap) canvasWrap.style.clipPath = world === 'none' ? 'inset(100% 0 0 0)' : `inset(${top}px 0 ${Math.max(0, innerHeight - bottom)}px 0)`;
  });

  // ── Hero copy lifts away ───────────────────────────────────────────────
  if (!reduced) {
    gsap.to('[data-hero-card]', {
      yPercent: -14,
      opacity: 0,
      ease: 'power1.in',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom 30%', scrub: 1 },
    });
  }

  // ── Card stacks: clip-path swap as progress crosses each step ─────────
  const cardStack = (cards: HTMLElement[], index: () => number) => {
    let current = -2;
    gsap.ticker.add(() => {
      const i = index();
      if (i === current) return;
      const prev = current;
      current = i;
      cards.forEach((c, k) => {
        if (k === i) gsap.fromTo(c, { clipPath: 'inset(100% 0% 0% 0% round 1.4rem)' }, { clipPath: 'inset(0% 0% 0% 0% round 1.4rem)', duration: 0.9, ease: 'expo.out', overwrite: true });
        else if (k === prev) gsap.to(c, { clipPath: 'inset(0% 0% 100% 0% round 1.4rem)', duration: 0.6, ease: 'expo.in', overwrite: true });
        else gsap.set(c, { clipPath: 'inset(100% 0% 0% 0% round 1.4rem)' });
      });
    });
  };

  // ── Craft: kinetic words + value cards ─────────────────────────────────
  const wordsA = $('[data-craft-a]');
  const wordsB = $('[data-craft-b]');
  if (wordsA && wordsB) {
    const skewA = gsap.quickTo(wordsA, 'skewX', { duration: 0.5, ease: 'power3.out' });
    const skewB = gsap.quickTo(wordsB, 'skewX', { duration: 0.5, ease: 'power3.out' });
    gsap.ticker.add(() => {
      const p = scroll.craft;
      gsap.set(wordsA, { xPercent: 12 - p * 55 });
      gsap.set(wordsB, { xPercent: -48 + p * 50 });
      const sk = gsap.utils.clamp(-12, 12, live.velocity * -0.35);
      skewA(sk);
      skewB(-sk);
    });
  }
  const craftCards = $$('[data-craft-card]');
  if (craftCards.length) cardStack(craftCards, () => Math.min(2, Math.floor(scroll.craft * 3.0001)));

  // ── Expertise: labels follow their buildings, cards swap, x-ray darkens ──
  const expCards = $$('[data-exp-card]');
  if (expCards.length) {
    cardStack(expCards, () => {
      const p = scroll.expertise;
      if (p >= 0.74) return 6;
      return Math.min(5, Math.floor((p / 0.72) * 6 + 0.2));
    });
  }
  const labels = $$('[data-label]');
  const xrayBg = $('[data-xray-bg]');
  const expSection = $('#expertise');
  gsap.ticker.add(() => {
    labels.forEach((el, i) => {
      const a = anchors.expertise[i]!;
      el.style.transform = `translate3d(${a.x}px, ${a.y}px, 0)`;
      el.style.opacity = String(Math.max(0, a.weight * 1.4 - 0.4));
    });
    const x = gsap.utils.clamp(0, 1, (scroll.expertise - 0.735) / 0.05);
    if (xrayBg) xrayBg.style.opacity = String(x);
    // The nav flips with the section's light/dark state.
    if (expSection) expSection.dataset.theme = x > 0.5 ? 'dark' : 'light';
  });

  // ── Services: glyphs draw themselves in; cards tilt (desktop) / press (touch) ──
  for (const svg of $$('[data-glyph]')) {
    const paths = [...svg.querySelectorAll<SVGPathElement>('path')];
    const pins = [...svg.querySelectorAll<SVGCircleElement>('[data-pin]')];
    if (reduced) continue;
    gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(pins, { scale: 0, transformOrigin: 'center' });
    gsap
      .timeline({ scrollTrigger: { trigger: svg, start: 'top 85%', once: true } })
      .to(paths, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', stagger: 0.12 })
      .to(pins, { scale: 1, duration: 0.6, ease: 'back.out(3)', stagger: 0.1 }, '-=0.5');
  }
  for (const el of $$('[data-reveal]')) {
    if (reduced) continue;
    gsap.from(el, { y: 24, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  }
  const fine = matchMedia('(pointer: fine)').matches;
  for (const card of $$('[data-tilt]')) {
    if (reduced) continue;
    if (fine) {
      const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' });
      const ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' });
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 14);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 12);
      });
      card.addEventListener('pointerleave', () => (rx(0), ry(0)));
    } else {
      card.addEventListener('touchstart', () => gsap.to(card, { scale: 0.97, duration: 0.25, ease: 'power2.out' }), { passive: true });
      card.addEventListener('touchend', () => gsap.to(card, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' }), { passive: true });
    }
  }

  // ── Industries: sky follows the day cycle, labels follow districts, cards swap ──
  const sky = $('[data-sky]');
  const indSection = $('#industries');
  const cityLabels = $$('[data-city-label]');
  const cityCards = $$('[data-city-card]');
  const skyStops = [
    ['#e7f0fb', '#f6f9fc'],
    ['#fbe1c0', '#f8efe4'],
    ['#2a3168', '#0a1030'],
  ].map(([a, b]) => [gsap.utils.splitColor(a!), gsap.utils.splitColor(b!)] as const);
  const mix = (a: number[], b: number[], t: number) => `rgb(${a.map((v, i) => Math.round(v + (b[i]! - v) * t)).join(' ')})`;
  const sm = (a: number, b: number, x: number) => {
    const t = gsap.utils.clamp(0, 1, (x - a) / (b - a));
    return t * t * (3 - 2 * t);
  };
  gsap.ticker.add(() => {
    const p = scroll.industries;
    const g = sm(0.25, 0.55, p);
    const d = sm(0.62, 0.9, p);
    if (sky) {
      const top = skyStops[0]![0].map((v, i) => v + (skyStops[1]![0][i]! - v) * g);
      const bot = skyStops[0]![1].map((v, i) => v + (skyStops[1]![1][i]! - v) * g);
      sky.style.background = `linear-gradient(180deg, ${mix(top, skyStops[2]![0], d)} 0%, ${mix(bot, skyStops[2]![1], d)} 100%)`;
    }
    if (indSection) indSection.dataset.theme = d > 0.5 ? 'dark' : 'light';
    cityLabels.forEach((el, i) => {
      const a = anchors.industries[i]!;
      el.style.transform = `translate3d(${a.x}px, ${a.y}px, 0)`;
      el.style.opacity = String(Math.max(0, a.weight * 1.4 - 0.4));
    });
  });
  if (cityCards.length) {
    cardStack(cityCards, () => {
      const p = scroll.industries;
      if (p >= 0.88) return 7;
      if (p < 0.1) return 0;
      // The camera spends the first 40% of each segment travelling; swap the card mid-travel.
      return 1 + Math.max(0, Math.min(5, Math.floor(((p - 0.1) / 0.76) * 6 - 0.2)));
    });
  }

  // ── Impact: counters count with scroll, band drifts with velocity, streaks race ──
  for (const el of $$('[data-count]')) {
    const target = Number(el.dataset.count);
    if (reduced) continue;
    const o = { v: 0 };
    el.textContent = '0%';
    gsap.to(o, {
      v: target,
      ease: 'power2.out',
      onUpdate: () => (el.textContent = `${Math.round(o.v)}%`),
      scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 40%', scrub: 0.6 },
    });
  }
  const band = $('[data-band]');
  if (band && !reduced) {
    let x = 0;
    const skew = gsap.quickTo(band, 'skewX', { duration: 0.4, ease: 'power3.out' });
    gsap.ticker.add((_, dt) => {
      const v = live.velocity;
      x -= (0.04 + Math.abs(v) * 0.02) * dt * (v < 0 ? -1 : 1);
      const w = band.scrollWidth / 6;
      x = ((x % w) - w) % w;
      gsap.set(band, { x });
      skew(gsap.utils.clamp(-10, 10, -v * 0.3));
    });
  }
  const streaks = $$('[data-streak]');
  if (streaks.length && !reduced) {
    const tls = streaks.map((s, i) =>
      gsap.fromTo(s, { xPercent: -120 }, { xPercent: 360, duration: 2.6 + (i % 4) * 0.9, ease: 'none', repeat: -1, delay: -i * 0.7 }),
    );
    gsap.ticker.add(() => tls.forEach((t) => t.timeScale(1 + live.speed * 5)));
  }

  // ── Contact: copy to clipboard ─────────────────────────────────────────
  for (const btn of $$<HTMLButtonElement>('[data-copy]')) {
    const hint = $('[data-copy-hint]', btn);
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy ?? '');
        if (hint) hint.textContent = 'Copied';
      } catch {
        if (hint) hint.textContent = 'Select';
      }
      setTimeout(() => hint && (hint.textContent = 'Copy'), 1800);
    });
  }
}
