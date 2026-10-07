import { gsap } from 'gsap';
import type Lenis from 'lenis';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { live } from '../lib/store';
import { onRefresh, rectOf, track as trackLayout, viewport } from '../lib/layout';
import { anchors, scroll, type Anchor, type World } from '../webgl/scroll';

/**
 * Home page choreography: clips the 3D canvas to the section that uses it,
 * turns panel positions into camera progress for the foundation section,
 * places the 3D labels, turns the services staircase, and drifts the kinetic
 * words in "Why Raleston".
 */
export function initScroll(reduced: boolean, lenis: Lenis | null) {
  const $ = <T extends HTMLElement = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
  const $$ = <T extends HTMLElement = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];
  const canvasWrap = $('#webgl');

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
  /** Position a label at its projected anchor; hidden labels are left alone. */
  const placeLabel = (el: HTMLElement, a: Anchor) => {
    const w = Math.max(0, a.weight * 1.4 - 0.4);
    setStyle(el, 'opacity', w.toFixed(3));
    if (w === 0) return;
    setStyle(el, 'transform', `translate3d(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px, 0)`);
    setStyle(el, '--w', w.toFixed(3));
  };

  // ── Foundation: camera progress follows the panel in the middle of the screen ──
  const steps = $$('[data-fstep]');
  for (const s of steps) trackLayout(s);
  gsap.ticker.add(() => {
    if (!steps.length) return;
    const mid = viewport.height / 2;
    // Desktop: a panel's station is its centre. Phones: the gap above each panel,
    // so the camera has reached the building before its panel arrives.
    const phone = viewport.width < 1024;
    const centres = steps.map((s) => {
      const r = rectOf(s);
      return phone ? r.top + viewport.height * 0.3 : (r.top + r.bottom) / 2;
    });
    let k = 0;
    while (k < centres.length - 1 && centres[k + 1]! <= mid) k++;
    const a = centres[k]!;
    const b = centres[k + 1] ?? a + 1;
    const s = k + gsap.utils.clamp(0, 1, (mid - a) / (b - a));
    scroll.foundation = gsap.utils.clamp(0, 1, s / (steps.length - 1));
  });
  const flabels = $$('[data-flabel]');
  const xlabels = $$('[data-xlabel]');
  const hidden = { weight: 0, x: 0, y: 0 };
  gsap.ticker.add(() => {
    const off = scroll.world === 'none';
    flabels.forEach((el, i) => placeLabel(el, off ? hidden : anchors.foundation[i]!));
    xlabels.forEach((el, i) => placeLabel(el, off ? hidden : anchors.xray[i]!));
  });

  // ── Canvas clip: the 3D only paints over the sections that use it ───────
  let lastClip = '';
  const webglSections = $$('[data-webgl]');
  for (const s of webglSections) trackLayout(s);
  gsap.ticker.add(() => {
    const vh = viewport.height;
    let top = vh;
    let bottom = 0;
    let world: World = 'none';
    for (const s of webglSections) {
      const r = rectOf(s);
      const t = Math.max(0, r.top);
      const b = Math.min(vh, r.bottom);
      if (b - t < 1) continue;
      world = s.dataset.webgl as World;
      top = Math.min(top, t);
      bottom = Math.max(bottom, b);
    }
    scroll.world = world;
    scroll.coverage = world === 'none' ? 0 : (bottom - top) / vh;
    scroll.bandTop = world === 'none' ? 0 : top;
    scroll.bandBottom = world === 'none' ? 0 : bottom;
    if (!canvasWrap) return;
    // Soft edges where the 3D meets the sections above and below.
    const T = Math.round(world === 'none' ? vh : top);
    const B = Math.round(world === 'none' ? vh : bottom);
    const feather = Math.round(Math.min(160, vh * 0.18));
    const mask =
      world === 'none'
        ? ''
        : `linear-gradient(to bottom, transparent ${T}px, #000 ${T + (T > 0 ? feather : 0)}px, #000 ${B - (B < vh ? feather : 0)}px, transparent ${B}px)`;
    const clip = world === 'none' ? 'inset(100% 0 0 0)' : 'none';
    const key = clip + mask;
    if (key === lastClip) return;
    lastClip = key;
    canvasWrap.style.clipPath = clip;
    canvasWrap.style.maskImage = mask;
    canvasWrap.style.webkitMaskImage = mask;
  });

  // ── Services: the spiral staircase turns and climbs with scroll ─────────
  const stair = $('[data-stair-section]');
  if (stair && !reduced) {
    const ring = $('[data-stair-ring]', stair)!;
    const cards = $$('[data-stair-card]', stair);
    const treads = $$('[data-tread]', stair).map((el) => ({ el, t: Number(el.dataset.tread) }));
    const links = $$('[data-stair-link]', stair);
    const count = $('[data-stair-count]', stair);
    const rail = $('[data-stair-rail]', stair);
    const path = $$('[data-stair-light]', stair);
    const N = cards.length;
    const PER = 6;
    let progress = 0;
    let c = 0;
    let active = -1;
    const st = ScrollTrigger.create({ trigger: stair, start: 'top top', end: 'bottom bottom', onUpdate: (s) => (progress = s.progress) });
    links.forEach((link, k) =>
      link.addEventListener('click', () => {
        const y = st.start + (0.06 + (k / (N - 1)) * 0.88) * (st.end - st.start);
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
      cards.forEach((card, k) => {
        const rel = ((k - c) * Math.PI) / 2;
        const facing = Math.max(0, Math.cos(rel));
        const near = Math.max(0, 1 - Math.abs(k - c) * 1.6);
        const op = (0.1 + 0.9 * facing * facing).toFixed(3);
        const blur = near > 0.6 ? 'none' : `blur(${((1 - facing) * 3).toFixed(2)}px)`;
        const edge = (0.1 + 0.6 * near).toFixed(3);
        const key = op + blur + edge;
        if (lastCard.get(card) === key) return;
        lastCard.set(card, key);
        card.style.opacity = op;
        card.style.filter = blur;
        card.style.setProperty('--edge', edge);
        card.toggleAttribute('inert', near < 0.5);
      });
      // Treads light up as the climb reaches them: the light path runs azure → violet → gold.
      const climbed = c * PER + 1;
      for (const { el, t } of treads) {
        const rel = ((t * 15 - c * 90) * Math.PI) / 180;
        const front = Math.max(0, Math.cos(rel));
        const height = Math.exp(-Math.abs(t - c * PER) / 9);
        const lit = (0.22 + 0.78 * front * front * height).toFixed(3);
        const on = t <= climbed ? '1' : '0';
        const key = lit + on;
        if (lastLit.get(el) === key) continue;
        lastLit.set(el, key);
        el.style.setProperty('--lit', lit);
        el.style.setProperty('--on', on);
      }
      for (const p of path) setStyle(p, '--climb', (c / (N - 1)).toFixed(3));
      const k = Math.round(c);
      if (k !== active) {
        active = k;
        if (count) count.textContent = String(k + 1).padStart(2, '0');
        links.forEach((l, i) => l.setAttribute('aria-current', String(i === k)));
      }
      if (rail) setStyle(rail, 'transform', `scaleX(${(c / (N - 1)).toFixed(3)})`);
    });
  }

  // ── Why Raleston: the kinetic words drift with the section and skew with speed ──
  const kineticA = $('[data-kinetic-a]');
  const kineticB = $('[data-kinetic-b]');
  const why = $('#why');
  if (kineticA && kineticB && why && !reduced) {
    let p = 0;
    ScrollTrigger.create({ trigger: why, start: 'top bottom', end: 'bottom top', onUpdate: (s) => (p = s.progress) });
    const skewA = gsap.quickTo(kineticA, 'skewX', { duration: 0.5, ease: 'power3.out' });
    const skewB = gsap.quickTo(kineticB, 'skewX', { duration: 0.5, ease: 'power3.out' });
    gsap.ticker.add(() => {
      const r = rectOf(why);
      if (r.bottom < 0 || r.top > viewport.height) return;
      gsap.set(kineticA, { xPercent: 8 - p * 40 });
      gsap.set(kineticB, { xPercent: -40 + p * 36 });
      const sk = gsap.utils.clamp(-10, 10, live.velocity * -0.3);
      skewA(sk);
      skewB(-sk);
    });
  }
}
