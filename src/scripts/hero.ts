import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * The hero (markup and styles in src/components/sections/Hero.astro).
 *
 * One pinned stage, driven by scroll progress `p` (0..1 across the section):
 *   0 → INTRO   the headline steps aside and the request starts to fall
 *   INTRO → END five levels: the request dwells at each plate, then moves on
 *   END → 1     the plates close up into one lit platform
 *
 * The stack turns from diamonds to squares as soon as the visitor scrolls,
 * and back to diamonds once the last level is done (--turn, a timed tween,
 * so it is smooth however fast the page is scrolled).
 *
 * The request's position is a station `s`: -1 above the first plate, 0..4 at
 * the plates, fractions in between. The plates are CSS 3D; the thread, the
 * spark, the leader line and the level marks are drawn in screen space over them, from
 * plate positions measured on load and resize (never per frame), in both the
 * diamond and the square pose, and mixed by the turn.
 * The plate the request has reached is marked is-active; its words turn level
 * to the reader in CSS (see .lvl in Hero.astro).
 */
type Pt = { x: number; y: number };

const INTRO = 0.08;
const END = 0.86;
const DWELL = 1;
const TRAVEL = 1.1;
/** How far the plates close up at the end (1 = exploded). */
const CLOSED = 0.15;

export function initHero(reduced: boolean) {
  const root = document.querySelector<HTMLElement>('[data-hero]');
  if (!root || reduced) return;
  const one = <T extends Element>(sel: string) => root.querySelector<T>(sel)!;
  const all = <T extends Element>(sel: string) => [...root.querySelectorAll<T>(sel)];

  const intro = one<HTMLElement>('[data-intro]');
  const platform = one<HTMLElement>('[data-platform]');
  const stack = one<HTMLElement>('[data-stack]');
  const plates = all<HTMLElement>('[data-plate]');
  const notesBox = one<HTMLElement>('[data-notes]');
  const notes = all<HTMLElement>('[data-note]');
  const noteEnd = one<HTMLElement>('[data-note-end]');
  const datums = all<HTMLElement>('[data-datum]');
  const base = one<SVGPathElement>('[data-beam-base]');
  const lit = all<SVGPathElement>('[data-beam-lit]');
  const grad = one<SVGLinearGradientElement>('[data-beam-grad]');
  const spark = one<SVGGElement>('[data-spark]');
  const sparkInner = one<SVGGElement>('[data-spark-inner]');
  const flares = all<SVGGElement>('[data-flare]');
  const leader = one<SVGPathElement>('[data-leader]');
  const leaderEnd = one<SVGCircleElement>('[data-leader-end]');
  const dust = one<HTMLCanvasElement>('[data-dust]');
  const steps = all<HTMLElement>('[data-progress-steps] i');
  const N = plates.length;
  /** Each plate's glass layers (top face and edges): what fades when it is not the one in focus. */
  const layers = plates.map((pl) => [...pl.querySelectorAll<HTMLElement>('.plate-top, .plate-edge')]);
  /** What stays of a plate while it is out of focus: a faint outline. */
  const outlines = plates.map((pl) => pl.querySelector<HTMLElement>('[data-outline]')!);
  const ease = gsap.parseEase('power2.inOut');
  const clamp = gsap.utils.clamp(0, 1);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const mix = (a: Pt, b: Pt, t: number): Pt => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
  const phone = () => innerWidth < 1024;

  // ── Measured geometry (platform-relative px) ───────────────────────────
  type Pose = { c: Pt[]; r: Pt[]; l: Pt[]; f: Pt[] };
  const empty = (): Pose => ({ c: [], r: [], l: [], f: [] });
  /** Diamonds: open (exploded) and shut (closed up). */
  let open = empty();
  let shut = empty();
  /** Squares: open and shut. */
  let openSq = empty();
  let shutSq = empty();
  /** The stack's turn: 0 diamonds, 1 squares. Written as an inline transform (no inherited variables, so it is cheap). */
  const turn = { v: 0 };
  let turnTo = 0;
  const deg = (name: string) => parseFloat(getComputedStyle(root).getPropertyValue(name)) || 0;
  const pose = (t: number) => {
    stack.style.transform = `rotateX(${deg('--tilt')}deg) rotateZ(${(deg('--spin') * (1 - t)).toFixed(3)}deg)`;
  };
  let noteAt: Pt[] = [];
  let introShift: Pt = { x: 0, y: 0 };
  let plateSize = 0;

  const measure = () => {
    // Measure the resting pose: no shift, no float, plates not mid-arrival.
    platform.style.transform = 'none';
    const drops = plates.map((pl) => pl.style.getPropertyValue('--drop'));
    for (const pl of plates) pl.style.setProperty('--drop', '0px');
    const o = platform.getBoundingClientRect();
    const at = (el: Element | null): Pt => {
      const r = el!.getBoundingClientRect();
      return { x: r.left - o.left, y: r.top - o.top };
    };
    const read = () => ({
      c: plates.map((p) => at(p.querySelector('[data-anchor="c"]'))),
      r: plates.map((p) => at(p.querySelector('[data-anchor="r"]'))),
      l: plates.map((p) => at(p.querySelector('[data-anchor="l"]'))),
      f: plates.map((p) => at(p.querySelector('[data-anchor="f"]'))),
    });
    stack.style.setProperty('--spread', '1');
    pose(0);
    open = read();
    pose(1);
    openSq = read();
    stack.style.setProperty('--spread', String(CLOSED));
    shutSq = read();
    pose(0);
    shut = read();
    pose(turn.v);
    stack.style.setProperty('--spread', String(spread));
    plates.forEach((pl, i) => (drops[i] ? pl.style.setProperty('--drop', drops[i]!) : pl.style.removeProperty('--drop')));
    plateSize = plates[0]!.offsetWidth;

    // Where each note's leader starts: just after its level row (desktop), or above the note (phone).
    noteAt = notes.map((li) => {
      const box = li.getBoundingClientRect();
      const row = li.querySelector<HTMLElement>('[data-note-level]')!;
      const last = row.lastElementChild as HTMLElement;
      if (phone()) return { x: box.left - o.left + 18, y: box.top - o.top - 10 };
      return { x: Math.max(box.right - o.left, box.left - o.left + last.offsetLeft + last.offsetWidth) + 12, y: box.top - o.top + row.offsetTop + row.offsetHeight / 2 };
    });
    // Screen one: the platform sits further right (desktop), or waits below the fold (phone).
    introShift = phone() ? { x: 0, y: innerHeight * 0.78 } : { x: innerWidth * 0.05, y: innerHeight * 0.03 };
  };

  // ── Scroll → station ───────────────────────────────────────────────────
  const UNITS = N * DWELL + (N - 1) * TRAVEL;
  const station = (q: number) => {
    let u = q * UNITS;
    for (let k = 0; k < N; k++) {
      if (u <= DWELL || k === N - 1) return k;
      u -= DWELL;
      if (u <= TRAVEL) return k + ease(u / TRAVEL);
      u -= TRAVEL;
    }
    return N - 1;
  };

  // ── State and per-frame writes ─────────────────────────────────────────
  let p = 0;
  let spread = 1;
  let shift: Pt = { x: 0, y: 0 };
  let float = 0;
  let active = -2;
  let note = -2;
  let leaderOn = false;
  const leaderDraw = { v: 0 };
  /** The plate the leader points at, and where its note starts. */
  let leaderPlate = -1;
  let leaderFrom: Pt | null = null;
  let lastKey = '';

  const fire = (i: number) => {
    const f = flares[i];
    if (!f) return;
    f.classList.remove('is-firing');
    void f.getBoundingClientRect();
    f.classList.add('is-firing');
  };

  let wasClosing = false;
  const setActive = (next: number, closing: boolean) => {
    if (next === active && closing === wasClosing) return;
    if (next > active && next >= 0) fire(next);
    active = next;
    wasClosing = closing;
    plates.forEach((pl, i) => {
      pl.classList.toggle('is-active', closing || i === next);
      pl.classList.toggle('is-passed', closing || i < next);
    });
    datums.forEach((d, i) => {
      d.classList.toggle('is-active', i === next);
      d.classList.toggle('is-passed', i < next);
    });
  };

  const setNote = (next: number) => {
    if (next === note) return;
    note = next;
    notes.forEach((li, i) => li.classList.toggle('is-active', i === next));
    noteEnd.classList.toggle('is-active', next === N);
  };

  /** A point on plate i, between its diamond and square poses (and open or shut). */
  const at = (key: keyof Pose, i: number, closing = 0): Pt =>
    mix(mix(open[key][i]!, shut[key][i]!, closing), mix(openSq[key][i]!, shutSq[key][i]!, closing), turn.v);
  /** Where the leader ends: the plate's top corner (desktop) or front corner (phone). */
  const corner = (i: number): Pt => at(phone() ? 'f' : 'l', i);

  const drawLeader = () => {
    if (!leaderFrom || leaderPlate < 0) return;
    // Leader start is fixed on screen; the platform moves under it.
    const a = { x: leaderFrom.x - shift.x, y: leaderFrom.y - shift.y - float };
    const b = corner(leaderPlate);
    const elbow = phone() ? { x: a.x, y: a.y - 18 } : { x: a.x + 26, y: a.y };
    const seg1 = Math.hypot(elbow.x - a.x, elbow.y - a.y);
    const seg2 = Math.hypot(b.x - elbow.x, b.y - elbow.y);
    const len = seg1 + seg2;
    leader.setAttribute('d', `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} L ${elbow.x.toFixed(1)} ${elbow.y.toFixed(1)} L ${b.x.toFixed(1)} ${b.y.toFixed(1)}`);
    leader.style.strokeDasharray = `${(len * leaderDraw.v).toFixed(1)} ${len.toFixed(1)}`;
    leaderEnd.setAttribute('cx', b.x.toFixed(1));
    leaderEnd.setAttribute('cy', b.y.toFixed(1));
    leaderEnd.style.opacity = leaderDraw.v > 0.95 ? '1' : '0';
  };

  const render = () => {
    // A page reloaded part-way down scrolls before the plates are measured: wait for them.
    if (!open.c.length) return;
    const tIntro = clamp(p / INTRO);
    const closing = ease(clamp((p - END) / (1 - END)));
    const s = p < INTRO ? tIntro - 1 : station((p - INTRO) / (END - INTRO));

    // Close the plates up at the end.
    const nextSpread = lerp(1, CLOSED, closing);
    if (Math.abs(nextSpread - spread) > 1e-4) {
      spread = nextSpread;
      stack.style.setProperty('--spread', spread.toFixed(4));
    }
    // Squares from the first scroll until the last level is done; diamonds before and after.
    const want = p > 0.004 && closing === 0 ? 1 : 0;
    if (want !== turnTo) {
      turnTo = want;
      gsap.to(turn, {
        v: want,
        duration: 1.2,
        ease: 'power3.inOut',
        overwrite: true,
        onUpdate: () => {
          pose(turn.v);
          lastKey = '';
          render();
        },
      });
    }
    const C = open.c.map((_, i) => at('c', i, closing));
    const R = open.r.map((_, i) => at('r', i, closing));

    // Screen one → journey: the headline steps aside, the notes come in.
    shift = mix(introShift, { x: 0, y: 0 }, ease(tIntro));
    intro.style.opacity = String(clamp(1 - tIntro * 2.4));
    intro.style.transform = `translate3d(${(-tIntro * 40).toFixed(1)}px, ${phone() ? (-tIntro * 60).toFixed(1) : '0'}px, 0)`;
    intro.style.visibility = tIntro >= 0.99 ? 'hidden' : '';
    notesBox.style.opacity = String(clamp((tIntro - 0.55) / 0.45));

    // The thread: from above the first plate down through every plate's centre.
    const top: Pt = { x: C[0]!.x, y: C[0]!.y - plateSize * 0.42 };
    const pts = [top, ...C];
    const d = pts.map((pt, i) => `${i ? 'L' : 'M'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ');
    let total = 0;
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push((total += Math.hypot(pts[i]!.x - pts[i - 1]!.x, pts[i]!.y - pts[i - 1]!.y)));
    const u = Math.max(0, Math.min(N, s + 1));
    const k = Math.min(N - 1, Math.floor(u));
    const head = mix(pts[k]!, pts[k + 1]!, u - k);
    const drawn = cum[k]! + (cum[k + 1]! - cum[k]!) * (u - k);
    const key = `${d}|${drawn.toFixed(1)}|${R.map((r) => `${r.x.toFixed(0)},${r.y.toFixed(0)}`).join(';')}`;
    if (key !== lastKey) {
      lastKey = key;
      base.setAttribute('d', d);
      for (const l of lit) {
        l.setAttribute('d', d);
        l.style.strokeDasharray = `${drawn.toFixed(1)} ${(total + 50).toFixed(1)}`;
      }
      grad.setAttribute('y1', (head.y - 260).toFixed(1));
      grad.setAttribute('y2', (head.y + 6).toFixed(1));
      spark.setAttribute('transform', `translate(${head.x.toFixed(1)} ${head.y.toFixed(1)})`);
      flares.forEach((f, i) => f.setAttribute('transform', `translate(${C[i]!.x.toFixed(1)} ${C[i]!.y.toFixed(1)})`));
      datums.forEach((dt, i) => {
        dt.style.transform = `translate3d(${(R[i]!.x + 6).toFixed(1)}px, ${(R[i]!.y - 11).toFixed(1)}px, 0)`;
      });
    }
    spark.style.opacity = String(1 - closing);
    // Progress segments: each fills as the request travels to its level.
    steps.forEach((seg, i) => {
      const f = closing > 0 ? 1 : clamp(s + 1 - i);
      const v = f.toFixed(3);
      if (seg.style.getPropertyValue('--f') !== v) seg.style.setProperty('--f', v);
    });

    // Which plate is lit, and which note shows.
    const here = s < -0.2 ? -1 : Math.max(0, Math.min(N - 1, Math.floor(s + 0.2)));
    setActive(closing > 0.25 ? N - 1 : here, closing > 0.25);
    stack.classList.toggle('is-closing', closing > 0);
    // One plate at a time: each plate (and its level mark) fades to a faint outline with the
    // spark's distance from it, so the old one fades as the spark leaves and the next comes
    // in as it arrives, in step with the scroll. Before the first level and from the close
    // on, every plate is back.
    const smooth = (x: number) => x * x * (3 - 2 * x);
    const focus = smooth(clamp((s + 0.6) / 0.6)) * (1 - smooth(clamp(closing * 4)));
    const marks = clamp((tIntro - 0.4) / 0.6) * (1 - closing);
    plates.forEach((_, i) => {
      const near = smooth(clamp(1 - Math.abs(s - i)));
      const vis = 1 - focus * (1 - near);
      const v = vis > 0.999 ? '' : vis.toFixed(3);
      for (const layer of layers[i]!) if (layer.style.opacity !== v) layer.style.opacity = v;
      const o = (1 - vis).toFixed(3);
      if (outlines[i]!.style.opacity !== o) outlines[i]!.style.opacity = o;
      const m = (marks * vis).toFixed(3);
      if (datums[i]!.style.opacity !== m) datums[i]!.style.opacity = m;
    });
    setNote(closing > 0.35 ? N : Math.max(0, here));

    // The leader ties the note to its plate while the request dwells there.
    const dwelling = here >= 0 && Math.abs(s - here) < 0.03 && closing === 0 && tIntro >= 1;
    if (dwelling !== leaderOn || (dwelling && leaderPlate !== here)) {
      leaderOn = dwelling;
      if (dwelling) {
        leaderPlate = here;
        leaderFrom = noteAt[here]!;
        gsap.fromTo(leaderDraw, { v: 0 }, { v: 1, duration: 0.9, delay: 0.25, ease: 'power3.out', overwrite: true });
      } else gsap.to(leaderDraw, { v: 0, duration: 0.25, ease: 'power2.in', overwrite: true });
    }
  };

  // Every frame: the platform's gentle float, and the leader that follows it.
  let visible = true;
  const tick = (time: number) => {
    if (!visible) return;
    float = Math.sin(time * 0.9) * (phone() ? 3 : 4.5);
    platform.style.transform = `translate3d(${shift.x.toFixed(1)}px, ${(shift.y + float).toFixed(1)}px, 0)`;
    if (leaderDraw.v > 0.001) drawLeader();
    else if (leader.style.strokeDasharray !== '0 1') {
      leader.style.strokeDasharray = '0 1';
      leaderEnd.style.opacity = '0';
    }
  };
  gsap.ticker.add(tick);

  // ── Dust in the light ──────────────────────────────────────────────────
  const ctx = dust.getContext('2d');
  type Mote = { x: number; y: number; r: number; a: number; vx: number; vy: number; t: number; warm: boolean };
  let motes: Mote[] = [];
  let dw = 0;
  let dh = 0;
  let dpr = 1;
  const sizeDust = () => {
    dpr = Math.min(1.5, devicePixelRatio || 1);
    dw = dust.clientWidth;
    dh = dust.clientHeight;
    dust.width = Math.round(dw * dpr);
    dust.height = Math.round(dh * dpr);
    const count = phone() ? 34 : 70;
    const cx = phone() ? 0.5 : 0.64;
    motes = Array.from({ length: count }, () => {
      const y = Math.random();
      const spreadX = 0.08 + y * 0.32;
      return {
        x: (cx + (Math.random() - 0.5) * 2 * spreadX) * dw,
        y: y * dh,
        r: Math.random() < 0.12 ? 2.5 + Math.random() * 5 : 0.5 + Math.random() * 1.3,
        a: 0.12 + Math.random() * 0.4,
        vx: (Math.random() - 0.5) * 0.08,
        vy: -(0.05 + Math.random() * 0.16),
        t: Math.random() * Math.PI * 2,
        warm: Math.random() < 0.22,
      };
    });
  };
  const drawDust = () => {
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, dw, dh);
    ctx.globalCompositeOperation = 'lighter';
    for (const m of motes) {
      m.t += 0.012;
      m.x += m.vx + Math.sin(m.t) * 0.06;
      m.y += m.vy;
      if (m.y < -10) {
        m.y = dh + 10;
        m.x = (phone() ? 0.5 : 0.64) * dw + (Math.random() - 0.5) * dw * 0.5;
      }
      const tw = 0.6 + 0.4 * Math.sin(m.t * 2.3);
      const alpha = m.a * tw * (m.r > 2 ? 0.18 : 1);
      // Mostly cool motes, a few warm ones from the request's light.
      ctx.fillStyle = m.warm ? `rgba(255, 226, 122, ${alpha.toFixed(3)})` : `rgba(196, 202, 255, ${(alpha * 0.85).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  let dusting = false;
  const startDust = () => {
    if (dusting || !ctx) return;
    dusting = true;
    gsap.ticker.add(drawDust);
  };
  const stopDust = () => {
    dusting = false;
    gsap.ticker.remove(drawDust);
  };
  sizeDust();
  ScrollTrigger.addEventListener('refreshInit', sizeDust);
  startDust();

  // Created last: a page reloaded part-way down fires these at once, so everything they use must exist.
  ScrollTrigger.create({
    trigger: root,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (st) => {
      p = st.progress;
      render();
    },
    onToggle: (st) => {
      visible = st.isActive;
      if (visible) startDust();
      else stopDust();
    },
    onRefresh: (st) => {
      measure();
      p = st.progress;
      lastKey = '';
      active = -2;
      note = -2;
      wasClosing = false;
      leaderOn = false;
      render();
    },
  });

  // ── Arrival: the plates settle into place one after another ────────────
  measure();
  render();
  if (scrollY < innerHeight * 0.4) {
    const tl = gsap.timeline({ delay: 0.1 });
    tl.from(plates, { '--drop': '260px', '--fade': 0, duration: 1.5, ease: 'expo.out', stagger: 0.12 }, 0);
    tl.from(base, { opacity: 0, duration: 1.2 }, 0.9);
    tl.from(sparkInner, { scale: 0, transformOrigin: '50% 50%', duration: 1.2, ease: 'expo.out' }, 1.0);
  }
}
