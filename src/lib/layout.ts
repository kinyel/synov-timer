import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Layout cache. Section positions are measured once (on load, resize, font
 * load and ScrollTrigger refresh) and then derived from the scroll position
 * every frame, so per-frame code never calls getBoundingClientRect after a
 * style write. Interleaved reads and writes force a synchronous layout per
 * read, which is what made sticky content and the header stutter.
 */
interface Entry {
  top: number;
  height: number;
}
const entries = new Map<Element, Entry>();
const refreshers = new Set<() => void>();
export const viewport = { height: innerHeight, width: innerWidth };

export function track(el: Element) {
  if (!entries.has(el)) entries.set(el, { top: 0, height: 0 });
  measure(el);
}

function measure(el: Element) {
  const r = el.getBoundingClientRect();
  entries.set(el, { top: r.top + scrollY, height: r.height });
}

/** Viewport-relative top and bottom of a tracked element, from cached geometry. */
export function rectOf(el: Element): { top: number; bottom: number } {
  const e = entries.get(el);
  if (!e) {
    track(el);
    return rectOf(el);
  }
  const top = e.top - scrollY;
  return { top, bottom: top + e.height };
}

/** Run `fn` whenever layout is re-measured (to cache CSS values, widths…). */
export function onRefresh(fn: () => void) {
  refreshers.add(fn);
  fn();
}

export function refreshLayout() {
  viewport.height = innerHeight;
  viewport.width = innerWidth;
  for (const el of entries.keys()) measure(el);
  for (const fn of refreshers) fn();
}

let t = 0;
addEventListener('resize', () => {
  clearTimeout(t);
  t = window.setTimeout(refreshLayout, 120);
});
addEventListener('load', refreshLayout);
document.fonts?.ready.then(refreshLayout);
ScrollTrigger.addEventListener('refresh', refreshLayout);
