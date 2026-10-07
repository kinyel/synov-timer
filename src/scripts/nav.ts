import { gsap } from 'gsap';
import type Lenis from 'lenis';
import { $progress } from '../lib/store';

/**
 * Navigation behaviour: gliding hover highlight, the morphing Services
 * flyout, the dock drawing in on scroll (and its page-progress line), deep
 * links that land inside a pinned section, and the mobile sheet. The active
 * page is marked at build time. Styling lives in src/components/chrome/Nav.astro.
 */
export function initNav(lenis: Lenis | null, reduced: boolean) {
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  if (!nav) return { closeMenu: () => {} };
  const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = nav) => r.querySelector<T & Element>(s);
  const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = nav) => [...r.querySelectorAll<T & Element>(s)];
  const html = document.documentElement;
  const dur = reduced ? 0 : 1;

  // ── Deep links: land on a card inside a pinned section ──────────────────
  const jump = (section: string, p: number) => {
    const el = document.getElementById(section);
    if (!el) return;
    const top = el.getBoundingClientRect().top + scrollY;
    const y = top + Math.max(0, el.offsetHeight - innerHeight) * p;
    if (lenis) lenis.scrollTo(y, { duration: 1.6 * dur || 0.01, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
  };
  for (const a of $$<HTMLAnchorElement>('[data-nav-jump]', document)) {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      closeFlyout(true);
      closeMenu();
      jump(a.dataset.navJump!, Number(a.dataset.navP ?? 0));
    });
  }

  // ── Gliding hover highlight ─────────────────────────────────────────────
  const pill = $('[data-nav-pill]');
  const hover = $('[data-nav-hover]');
  const links = $$('.nav-link');
  const moveHover = (link: HTMLElement | null) => {
    if (!hover || !pill) return;
    if (!link) {
      gsap.to(hover, { opacity: 0, duration: 0.3 * dur });
      return;
    }
    const pr = pill.getBoundingClientRect();
    const lr = link.getBoundingClientRect();
    const first = Number(getComputedStyle(hover).opacity) < 0.05;
    gsap.to(hover, {
      x: lr.left - pr.left,
      width: lr.width,
      opacity: 1,
      duration: first ? 0 : 0.5 * dur,
      ease: 'expo.out',
      overwrite: 'auto',
    });
  };
  for (const l of links) {
    l.addEventListener('pointerenter', () => moveHover(l));
    l.addEventListener('focus', () => moveHover(l));
  }

  // ── Morphing flyout ─────────────────────────────────────────────────────
  const flyout = $('[data-nav-flyout]');
  const clip = $('[data-nav-clip]');
  const arrow = $('[data-nav-arrow]');
  const panes = new Map($$('[data-nav-pane]').map((p) => [p.dataset.navPane!, p]));
  const triggers = $$<HTMLButtonElement>('[data-nav-trigger]');
  let openId: string | null = null;
  let openTimer = 0;
  let closeTimer = 0;

  const placeFlyout = (trigger: HTMLElement, pane: HTMLElement, instant: boolean) => {
    if (!flyout || !clip || !pill) return;
    pane.hidden = false;
    const w = pane.offsetWidth;
    const h = pane.offsetHeight;
    const pr = pill.getBoundingClientRect();
    const tr = trigger.getBoundingClientRect();
    // Centre under the trigger, kept inside the viewport.
    const centre = tr.left + tr.width / 2;
    const left = gsap.utils.clamp(16, innerWidth - 16 - w, centre - w / 2);
    const t = instant ? 0 : 0.55 * dur;
    gsap.to(clip, { width: w, height: h, duration: t, ease: 'expo.out' });
    gsap.to(flyout, { x: left - pr.left, duration: t, ease: 'expo.out' });
    if (arrow) gsap.to(arrow, { x: centre - left - 5, duration: t, ease: 'expo.out' });
  };

  const openFlyout = (id: string) => {
    const trigger = triggers.find((t) => t.dataset.navTrigger === id);
    const pane = panes.get(id);
    if (!flyout || !trigger || !pane) return;
    clearTimeout(closeTimer);
    const wasOpen = openId !== null;
    if (openId === id) return;
    const prev = openId ? panes.get(openId) : null;
    openId = id;
    for (const t of triggers) t.setAttribute('aria-expanded', String(t === trigger));
    // Cross-fade panes: old one out, new one in (absolutely stacked while they swap).
    for (const p of panes.values()) {
      p.style.position = 'absolute';
      p.style.top = '0';
      p.style.left = '0';
    }
    if (prev && prev !== pane) {
      delete prev.dataset.shown;
      gsap.to(prev, { opacity: 0, duration: 0.2 * dur, onComplete: () => void (openId !== prev.dataset.navPane && (prev.hidden = true)) });
    }
    // Opening fresh: make sure no pane from an earlier visit is still showing.
    if (!wasOpen) for (const p of panes.values()) if (p !== pane) (p.hidden = true), delete p.dataset.shown;
    pane.hidden = false;
    gsap.fromTo(pane, { opacity: 0 }, { opacity: 1, duration: 0.3 * dur, delay: wasOpen ? 0.08 * dur : 0 });
    requestAnimationFrame(() => (pane.dataset.shown = ''));
    placeFlyout(trigger, pane, !wasOpen);
    flyout.dataset.open = '';
    moveHover(trigger);
  };

  function closeFlyout(now = false) {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
    const run = () => {
      if (!flyout || openId === null) return;
      delete flyout.dataset.open;
      const pane = panes.get(openId);
      if (pane) {
        delete pane.dataset.shown;
        gsap.delayedCall(0.4 * dur, () => void (openId === null && (pane.hidden = true)));
      }
      openId = null;
      for (const t of triggers) t.setAttribute('aria-expanded', 'false');
      moveHover(null);
    };
    if (now) run();
    else closeTimer = window.setTimeout(run, 180);
  }

  for (const t of triggers) {
    const id = t.dataset.navTrigger!;
    t.addEventListener('pointerenter', (e) => {
      if ((e as PointerEvent).pointerType !== 'mouse') return;
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
      openTimer = window.setTimeout(() => openFlyout(id), openId ? 0 : 90);
    });
    t.addEventListener('click', () => (openId === id ? closeFlyout(true) : openFlyout(id)));
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        openFlyout(id);
        $<HTMLAnchorElement>('.nav-item', panes.get(id))?.focus();
      }
    });
  }
  pill?.addEventListener('pointerleave', () => closeFlyout());
  pill?.addEventListener('pointerenter', () => clearTimeout(closeTimer));
  for (const l of links.filter((l) => !l.dataset.navTrigger)) l.addEventListener('pointerenter', () => closeFlyout(true));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (openId) {
      const t = triggers.find((x) => x.dataset.navTrigger === openId);
      closeFlyout(true);
      t?.focus();
    }
    closeMenu();
  });
  document.addEventListener('pointerdown', (e) => {
    if (openId && !pill?.contains(e.target as Node)) closeFlyout(true);
  });

  // ── Condense once scrolled (with hysteresis so it never flickers at the threshold).
  // The header stays visible everywhere; it never hides.
  let menuOpen = false;
  let condensed = false;
  gsap.ticker.add(() => {
    const y = scrollY;
    const next = condensed ? y > 24 : y > 80;
    if (next !== condensed) {
      condensed = next;
      nav.toggleAttribute('data-condensed', condensed);
    }
  });

  // ── Page progress along the foot of the dock ────────────────────────────
  const line = $('[data-nav-progress]');
  if (line) $progress.subscribe((p) => (line.style.transform = `scaleX(${p.toFixed(4)})`));

  // ── Mobile / tablet sheet ───────────────────────────────────────────────
  const sheet = $('[data-menu]');
  const toggle = $<HTMLButtonElement>('[data-menu-toggle]');
  function closeMenu() {
    if (!menuOpen || !sheet || !toggle) return;
    menuOpen = false;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    sheet.setAttribute('aria-hidden', 'true');
    sheet.inert = true;
    delete html.dataset.menuOpen;
    lenis?.start();
  }
  toggle?.addEventListener('click', () => {
    if (!sheet) return;
    if (menuOpen) return closeMenu();
    menuOpen = true;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    sheet.setAttribute('aria-hidden', 'false');
    sheet.inert = false;
    html.dataset.menuOpen = '';
    lenis?.stop();
    if (!reduced) gsap.fromTo($$('.nav-sheet-row, .nav-sheet .nav-cta', sheet), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger: 0.05, delay: 0.15 });
  });
  for (const b of $$<HTMLButtonElement>('[data-sheet-toggle]')) {
    b.addEventListener('click', () => b.setAttribute('aria-expanded', String(b.getAttribute('aria-expanded') !== 'true')));
  }
  for (const a of $$<HTMLAnchorElement>('.nav-sheet a:not([data-nav-jump])')) a.addEventListener('click', () => closeMenu());

  return { closeMenu };
}
