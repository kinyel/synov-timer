import { gsap } from 'gsap';
import type Lenis from 'lenis';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { live } from '../lib/store';
import { onRefresh, rectOf, viewport } from '../lib/layout';

/**
 * Home page choreography: turns the services staircase, and drifts the
 * kinetic words in "Why Raleston".
 */
export function initScroll(reduced: boolean, lenis: Lenis | null) {
  const $ = <T extends HTMLElement = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
  const $$ = <T extends HTMLElement = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];

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
    const PER = 3;
    const STEP = 30;
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
      const climbed = c * PER + 0.5;
      for (const { el, t } of treads) {
        const rel = ((t * STEP - c * 90) * Math.PI) / 180;
        const front = Math.max(0, Math.cos(rel));
        const height = Math.exp(-Math.abs(t - c * PER) / 4.5);
        const lit = (0.4 + 0.6 * front * height).toFixed(3);
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
