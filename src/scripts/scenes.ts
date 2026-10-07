/**
 * Drives every CSS 3D scene ([data-s3d]): --p is the scene's scroll progress
 * (0 as it enters, 1 once it is in place), smoothed; --tx and --ty tilt it a
 * few degrees towards the pointer. Scenes off screen are paused, and their
 * looping animations stop. With reduced motion, --p stays 1 and nothing moves.
 *
 * Optional attributes on the scene:
 *   data-s3d-start / data-s3d-end   ScrollTrigger positions (defaults below)
 *   data-s3d-tilt="0"               no pointer tilt
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface Scene {
  el: HTMLElement;
  target: number;
  p: number;
  tx: number;
  ty: number;
  tilt: boolean;
  live: boolean;
  last: string;
}

export function initScenes(reduced: boolean) {
  const els = [...document.querySelectorAll<HTMLElement>('[data-s3d]')];
  if (!els.length || reduced) return;

  const scenes: Scene[] = els.map((el) => ({ el, target: 0, p: 0, tx: 0, ty: 0, tilt: el.dataset.s3dTilt !== '0', live: false, last: '' }));
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const s = scenes.find((x) => x.el === e.target);
        if (!s) continue;
        s.live = e.isIntersecting;
        s.el.classList.toggle('is-off', !s.live);
      }
    },
    { rootMargin: '10% 0px' },
  );
  for (const s of scenes) {
    s.el.style.setProperty('--p', '0');
    s.el.classList.add('is-off');
    io.observe(s.el);
    ScrollTrigger.create({
      trigger: s.el,
      start: s.el.dataset.s3dStart ?? 'top 92%',
      end: s.el.dataset.s3dEnd ?? 'center 52%',
      onUpdate: (t) => (s.target = t.progress),
      onRefresh: (t) => (s.target = t.progress),
    });
  }

  // Pointer tilt, desktop only.
  let mx = 0;
  let my = 0;
  if (matchMedia('(pointer: fine)').matches) {
    addEventListener(
      'pointermove',
      (e) => {
        mx = e.clientX / innerWidth - 0.5;
        my = e.clientY / innerHeight - 0.5;
      },
      { passive: true },
    );
  }

  gsap.ticker.add(() => {
    for (const s of scenes) {
      if (!s.live) continue;
      s.p += (s.target - s.p) * 0.1;
      if (Math.abs(s.target - s.p) < 0.0005) s.p = s.target;
      if (s.tilt) {
        s.tx += (mx * 9 - s.tx) * 0.05;
        s.ty += (-my * 5 - s.ty) * 0.05;
      }
      const key = `${s.p.toFixed(3)}|${s.tx.toFixed(2)}|${s.ty.toFixed(2)}`;
      if (key === s.last) continue;
      s.last = key;
      s.el.style.setProperty('--p', s.p.toFixed(3));
      s.el.style.setProperty('--tx', `${s.tx.toFixed(2)}deg`);
      s.el.style.setProperty('--ty', `${s.ty.toFixed(2)}deg`);
    }
  });
}
