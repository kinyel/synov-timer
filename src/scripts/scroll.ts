import { gsap } from 'gsap';
import type Lenis from 'lenis';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { live } from '../lib/store';
import { onRefresh, rectOf, track as trackLayout, viewport } from '../lib/layout';
import { anchors, scroll, type World } from '../webgl/scroll';

/**
 * Section choreography: writes section progress into `scroll` for the WebGL
 * scenes, clips the canvas to the sections that use 3D, and drives each
 * section's DOM layer (cards, labels, kinetic type).
 */
export function initScroll(reduced: boolean, lenis: Lenis | null) {
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

  /** Style writes that skip unchanged values, so a still page does no style work. */
  const written = new WeakMap<HTMLElement, Record<string, string>>();
  const setStyle = (el: HTMLElement | null, prop: string, value: string) => {
    if (!el) return;
    const rec = written.get(el) ?? {};
    if (rec[prop] === value) return;
    rec[prop] = value;
    written.set(el, rec);
    if (prop.startsWith('--')) el.style.setProperty(prop, value);
    else (el.style as unknown as Record<string, string>)[prop] = value;
  };
  /** Position a building label at its projected anchor; hidden labels are left alone. */
  const placeLabel = (el: HTMLElement, a: { x: number; y: number; weight: number }) => {
    const w = Math.max(0, a.weight * 1.4 - 0.4);
    setStyle(el, 'opacity', w.toFixed(3));
    if (w === 0) return;
    setStyle(el, 'transform', `translate3d(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px, 0)`);
    setStyle(el, '--w', w.toFixed(3));
  };

  // ── Camera owner, world, and canvas clip, every frame ──────────────────
  let lastClip = '';
  const sections = $$('[data-scene]');
  for (const s of sections) trackLayout(s);
  const webglSections = sections.filter((s) => s.dataset.webgl);
  gsap.ticker.add(() => {
    const innerHeight = viewport.height;
    const mid = innerHeight / 2;
    for (const s of sections) {
      const r = rectOf(s);
      if (r.top <= mid && r.bottom > mid) {
        const id = s.dataset.scene as typeof scroll.owner;
        if (s.dataset.webgl) scroll.owner = id;
        break;
      }
    }
    // Clip the canvas to the on-screen 3D sections of ONE world (the one with
    // the most screen area), so DOM-only sections (services, impact) between
    // two worlds are never painted over.
    type Span = { top: number; bottom: number; featherBottom: boolean; featherTop: boolean };
    const spans = new Map<World, Span>();
    for (const s of webglSections) {
      const r = rectOf(s);
      const t = Math.max(0, r.top);
      const b = Math.min(innerHeight, r.bottom);
      if (b - t < 1) continue;
      const w = s.dataset.webgl as World;
      const fb = r.bottom < innerHeight && (s.dataset.feather ?? '').includes('bottom');
      const ft = r.top > 0 && (s.dataset.feather ?? '').includes('top');
      const span = spans.get(w);
      if (!span) spans.set(w, { top: t, bottom: b, featherBottom: fb, featherTop: ft });
      else {
        if (t <= span.top) span.featherTop = ft;
        span.top = Math.min(span.top, t);
        if (b >= span.bottom) span.featherBottom = fb;
        span.bottom = Math.max(span.bottom, b);
      }
    }
    let world: World = 'none';
    let best: Span = { top: 0, bottom: 0, featherBottom: false, featherTop: false };
    for (const [w, span] of spans) {
      if (span.bottom - span.top > best.bottom - best.top) {
        world = w;
        best = span;
      }
    }
    scroll.world = world;
    scroll.coverage = world === 'none' ? 0 : (best.bottom - best.top) / innerHeight;
    scroll.bandTop = best.top;
    scroll.bandBottom = best.bottom;
    if (canvasWrap) {
      const { top, bottom, featherBottom, featherTop } = best;
      // Whole pixels, written only when they change, so a still page does no style work.
      const T = Math.round(top);
      const B = Math.round(bottom);
      let mask = '';
      let clip: string;
      if (world !== 'none' && (featherBottom || featherTop)) {
        // Soft edges: the 3D dissolves into the neighbouring section instead of being cut.
        const span = (B - T) / (featherBottom && featherTop ? 2 : 1);
        // Arriving from the dark staircase into a bright sky needs a long dissolve; a short one suffices below.
        const fTop = Math.round(Math.min(innerHeight * 0.45, span));
        const fBottom = Math.round(Math.min(260, innerHeight * 0.3, span));
        const a = featherTop ? T + fTop : T;
        const z = featherBottom ? B - fBottom : B;
        mask = `linear-gradient(to bottom, transparent ${T}px, #000 ${a}px, #000 ${z}px, transparent ${B}px)`;
        clip = 'none';
      } else clip = world === 'none' ? 'inset(100% 0 0 0)' : `inset(${T}px 0 ${Math.max(0, Math.round(innerHeight) - B)}px 0)`;
      const key = clip + mask;
      if (key !== lastClip) {
        lastClip = key;
        canvasWrap.style.clipPath = clip;
        canvasWrap.style.maskImage = mask;
        canvasWrap.style.webkitMaskImage = mask;
      }
    }
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
  const xrayWarm = $('[data-xray-warm]');
  const expSection = $('#expertise');
  gsap.ticker.add(() => {
    labels.forEach((el, i) => placeLabel(el, anchors.expertise[i]!));
    const x = gsap.utils.clamp(0, 1, (scroll.expertise - 0.735) / 0.05);
    setStyle(xrayBg, 'opacity', x.toFixed(3));
    setStyle(xrayWarm, 'opacity', gsap.utils.clamp(0, 1, (scroll.expertise - 0.9) / 0.1).toFixed(3));
    // The nav flips with the section's light/dark state.
    const expTheme = x > 0.5 ? 'dark' : 'light';
    if (expSection && expSection.dataset.theme !== expTheme) expSection.dataset.theme = expTheme;
  });

  // ── Services: the spiral staircase turns and climbs with scroll ─────────
  const stair = $('[data-stair-section]');
  const stairEntry = stair ? $('[data-stair-entry]', stair) : null;
  const stairExit = stair ? $('[data-stair-exit]', stair) : null;
  if (stair && stairEntry && stairExit) {
    gsap.ticker.add(() => {
      // Entry: 1 while the section top is still well below the viewport top, 0 once pinned.
      // Exit: 0 while pinned, rising to 1 as the section's bottom comes up the screen.
      const r = rectOf(stair);
      const vh = viewport.height;
      setStyle(stairEntry, 'opacity', gsap.utils.clamp(0, 1, r.top / (vh * 0.18)).toFixed(3));
      setStyle(stairExit, 'opacity', gsap.utils.clamp(0, 1, (vh - r.bottom) / (vh * 0.18)).toFixed(3));
    });
  }
  if (stair && !reduced) {
    const ring = $('[data-stair-ring]', stair)!;
    const cards = $$('[data-stair-card]', stair);
    const treads = $$('[data-tread]', stair).map((el) => ({ el, t: Number(el.dataset.tread) }));
    const links = $$('[data-stair-link]', stair);
    const count = $('[data-stair-count]', stair);
    const rail = $('[data-stair-rail]', stair);
    const N = cards.length;
    const PER = 6;
    const drawn = new Set<number>();
    let progress = 0;
    let c = 0;
    let active = -1;
    const st = ScrollTrigger.create({ trigger: stair, start: 'top top', end: 'bottom bottom', onUpdate: (s) => (progress = s.progress) });
    const draw = (k: number) => {
      if (drawn.has(k)) return;
      drawn.add(k);
      const svg = $('[data-glyph]', cards[k]!);
      if (!svg) return;
      const paths = [...svg.querySelectorAll<SVGPathElement>('path')];
      const pins = [...svg.querySelectorAll<SVGCircleElement>('[data-pin]')];
      gsap.fromTo(paths, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut', stagger: 0.1 });
      gsap.fromTo(pins, { scale: 0, transformOrigin: 'center' }, { scale: 1, duration: 0.6, ease: 'back.out(3)', stagger: 0.1, delay: 0.7 });
    };
    // Glyphs wait, undrawn, until their card reaches the front.
    for (const card of cards) for (const path of card.querySelectorAll<SVGPathElement>('[data-glyph] path')) gsap.set(path, { strokeDasharray: 1, strokeDashoffset: 1 });
    links.forEach((link, k) =>
      link.addEventListener('click', () => {
        const y = st.start + ((0.06 + (k / (N - 1)) * 0.88) * (st.end - st.start));
        lenis ? lenis.scrollTo(y, { duration: 1.4 }) : scrollTo({ top: y, behavior: 'smooth' });
      }),
    );
    let rise = 26;
    onRefresh(() => (rise = parseFloat(getComputedStyle(stair).getPropertyValue('--rise')) || 26));
    const lastLit = new Map<HTMLElement, string>();
    const lastCard = new Map<HTMLElement, string>();
    gsap.ticker.add((time) => {
      const rect = rectOf(stair);
      if (rect.bottom < 0 || rect.top > viewport.height) return;
      // Hold briefly at both ends so the first and last cards get a beat of their own.
      const raw = gsap.utils.clamp(0, 1, (progress - 0.06) / 0.88) * (N - 1);
      // Each card rests at the front for the middle of its stretch, then the stair turns on.
      const seg = Math.min(N - 2, Math.floor(raw));
      const f = gsap.utils.clamp(0, 1, (raw - seg - 0.3) / 0.4);
      const target = seg + f * f * (3 - 2 * f);
      c += (target - c) * 0.1;
      if (Math.abs(target - c) < 1e-4) c = target;
      const sway = Math.sin(time * 0.6) * 2.5;
      ring.style.transform = `translateY(${c * PER * rise}px) rotateY(${-c * 90 + sway}deg)`;
      // Card and tread styles depend only on c: once it settles, nothing is written.
      cards.forEach((card, k) => {
        const rel = ((k - c) * Math.PI) / 2;
        const facing = Math.max(0, Math.cos(rel));
        const near = Math.max(0, 1 - Math.abs(k - c) * 1.6);
        const op = (0.12 + 0.88 * facing * facing).toFixed(3);
        const blur = near > 0.6 ? 'none' : `blur(${((1 - facing) * 3).toFixed(2)}px)`;
        const edge = (0.1 + 0.6 * near).toFixed(3);
        const key = op + blur + edge;
        if (lastCard.get(card) === key) return;
        lastCard.set(card, key);
        card.style.opacity = op;
        card.style.filter = blur;
        card.style.setProperty('--edge', edge);
      });
      for (const { el, t } of treads) {
        const rel = ((t * 15 - c * 90) * Math.PI) / 180;
        const front = Math.max(0, Math.cos(rel));
        const height = Math.exp(-Math.abs(t - c * PER) / 9);
        const lit = (0.22 + 0.78 * front * front * height).toFixed(3);
        if (lastLit.get(el) === lit) continue;
        lastLit.set(el, lit);
        el.style.setProperty('--lit', lit);
      }
      const k = Math.round(c);
      if (k !== active) {
        active = k;
        if (count) count.textContent = String(k + 1).padStart(2, '0');
        links.forEach((l, i) => l.setAttribute('aria-current', String(i === k)));
        draw(k);
      }
      if (rail) rail.style.transform = `scaleX(${(c / (N - 1)).toFixed(3)})`;
    });
  }

  // ── Industries: sky follows the day cycle, labels follow districts, cards swap ──
  const sky = $('[data-sky]');
  const veil = $('[data-sky-veil]');
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
      setStyle(sky, 'background', `linear-gradient(180deg, ${mix(top, skyStops[2]![0], d)} 0%, ${mix(bot, skyStops[2]![1], d)} 100%)`);
    }
    // Arrival from the staircase: dark until the section pins, then gone by the end of the cloud descent.
    const v = 1 - sm(0.0, 0.085, p);
    setStyle(veil, 'opacity', v.toFixed(3));
    const indTheme = d > 0.5 || v > 0.5 ? 'dark' : 'light';
    if (indSection && indSection.dataset.theme !== indTheme) indSection.dataset.theme = indTheme;
    cityLabels.forEach((el, i) => placeLabel(el, anchors.industries[i]!));
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
    let w = 1;
    onRefresh(() => (w = band.scrollWidth / 6 || 1));
    const skew = gsap.quickTo(band, 'skewX', { duration: 0.4, ease: 'power3.out' });
    gsap.ticker.add((_, dt) => {
      const v = live.velocity;
      x -= (0.04 + Math.abs(v) * 0.02) * dt * (v < 0 ? -1 : 1);
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
