import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { itam, itom, itsm, type Building } from './buildings';
import { buildXray } from './xray';
import { hash } from '../../shaders/chunks';
import { TOKENS } from '../../../lib/tokens';
import { AZURE, GOLD, TREE, buildingMaterials, createCampusUniforms, type BuildUniforms, type CampusUniforms } from './materials';

/**
 * The foundation: three practice buildings (ITSM, ITOM, ITAM) standing on one
 * glowing CMDB slab. The slab is navy glass printed with an azure grid of
 * configuration records; relationship lines run between the buildings and
 * gold data packets travel along them. Lines from the slab's edges are the
 * data coming in (Discovery, connectors). It is how the page explains, in one
 * picture, why the CMDB matters: everything stands on it.
 */
export const SLAB = { w: 15, d: 9.6, h: 0.34 };
const SCALE = 1.35;

export interface Placed {
  building: Building;
  group: THREE.Group;
  build: BuildUniforms;
  position: THREE.Vector3;
  /** Footprint half-extents in world units (after scaling). */
  half: THREE.Vector2;
  /** Ring on the slab that lights up when this building is the subject. */
  ring: THREE.Mesh;
  /** World point above the roof where its label's leader line starts. */
  anchor: THREE.Vector3;
}

/** Order on the page: ITSM, ITOM, ITAM. */
const LAYOUT: [() => Building, number, number][] = [
  [itsm, -4.9, 1.5],
  [itom, 0.2, -2.3],
  [itam, 5.0, 1.4],
];

/** Relationship lines (between buildings) and feeds (from the slab edge in). Manhattan paths on the slab. */
const LINKS: [number, number][][] = [
  [[-4.9, 1.5], [-4.9, -2.3], [0.2, -2.3]],
  [[0.2, -2.3], [5.0, -2.3], [5.0, 1.4]],
  [[-4.9, 1.5], [-4.9, 3.75], [5.0, 3.75], [5.0, 1.4]],
];
const FEEDS: [number, number][][] = [
  [[-7.5, 1.5], [-4.9, 1.5]],
  [[0.2, -4.8], [0.2, -2.3]],
  [[7.5, 1.4], [5.0, 1.4]],
  [[-2.4, 4.8], [-2.4, 3.75]],
  [[2.6, -4.8], [2.6, -2.3]],
];

/** The slab: navy glass, a grid of records that twinkle, brighter under each building, a glowing azure rim. */
function slabMaterial(uniforms: CampusUniforms, pads: THREE.Vector4[]): THREE.MeshStandardMaterial {
  const m = new THREE.MeshStandardMaterial({ color: TOKENS.navy, roughness: 0.32, metalness: 0.35 });
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms, {
      uPads: { value: pads },
      uAzure: { value: new THREE.Color(AZURE) },
      uIris: { value: new THREE.Color(TOKENS.iris) },
    });
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vW;\nvarying vec3 vWN;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvW = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvWN = normalize(mat3(modelMatrix) * objectNormal);');
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>\nvarying vec3 vW;\nvarying vec3 vWN;\nuniform float uTime, uXray;\nuniform vec3 uAzure, uIris;\nuniform vec4 uPads[3];\n${hash}`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        /* glsl */ `#include <emissivemap_fragment>
        vec2 p = vW.xz;
        float top = step(0.5, vWN.y);
        // How close this point is to a building footprint (records there are busier).
        float near = 0.0;
        for (int i = 0; i < 3; i++) {
          vec2 d = abs(p - uPads[i].xy) - uPads[i].zw;
          near = max(near, 1.0 - smoothstep(0.0, 1.6, length(max(d, 0.0))));
        }
        // Grid of record cells, two per world unit.
        vec2 q = p * 2.0;
        vec2 gl = abs(fract(q - 0.5) - 0.5) / fwidth(q);
        float grid = 1.0 - min(min(gl.x, gl.y), 1.0);
        vec2 cell = floor(q);
        float rnd = hash21(cell);
        vec2 f = fract(q) - 0.5;
        float rec = 1.0 - smoothstep(0.1, 0.14, max(abs(f.x), abs(f.y)));
        float on = step(0.55 - near * 0.3, rnd);
        float tw = 0.45 + 0.55 * sin(uTime * (0.6 + rnd * 1.6) + rnd * 40.0);
        float edge = 1.0 - smoothstep(0.0, 0.6, min(${(SLAB.w / 2).toFixed(2)} - abs(p.x), ${(SLAB.d / 2).toFixed(2)} - abs(p.y)));
        vec3 glow = uAzure * (grid * (0.05 + near * 0.08) + rec * on * tw * (0.35 + near * 1.6) * (1.0 + uXray * 1.5));
        glow += uIris * edge * 0.12;
        // Sides: a bright azure line along the top edge, fading down the side.
        float side = 1.0 - top;
        float rim = side * (1.0 - smoothstep(0.0, 0.07, -vW.y));
        glow = glow * top + uAzure * (rim * 3.2 + side * 0.08);
        totalEmissiveRadiance += glow;`,
      );
  };
  m.customProgramCacheKey = () => 'foundation-slab';
  return m;
}

/** Relationship lines on the slab: azure, with pulses running along them. Additive, so they glow. */
function lineMaterial(uniforms: CampusUniforms) {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: uniforms.uTime, uXray: uniforms.uXray, uColor: { value: new THREE.Color(AZURE) } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute float aT;
      attribute float aFeed;
      varying float vT;
      varying float vFeed;
      varying vec2 vUv;
      void main() {
        vT = aT;
        vFeed = aFeed;
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime, uXray;
      uniform vec3 uColor;
      varying float vT;
      varying float vFeed;
      varying vec2 vUv;
      void main() {
        float across = 1.0 - abs(vUv.y * 2.0 - 1.0);
        float core = smoothstep(0.35, 1.0, across);
        float pulse = smoothstep(0.85, 1.0, fract(vT * 0.35 - uTime * (vFeed > 0.5 ? 0.55 : 0.32)));
        float base = 0.55 + uXray * 0.9;
        vec3 c = uColor * (core * base + pulse * core * 2.6 + across * 0.25);
        gl_FragColor = vec4(c, across * (0.55 + pulse * 0.45));
      }
    `,
  });
}

/** Flat ribbon along a polyline, lying on the slab. aT = distance along it. */
function ribbon(points: [number, number][], width: number, y: number, feed: number) {
  const pos: number[] = [];
  const uv: number[] = [];
  const t: number[] = [];
  const f: number[] = [];
  const idx: number[] = [];
  let run = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const [ax, az] = points[i]!;
    const [bx, bz] = points[i + 1]!;
    const len = Math.hypot(bx - ax, bz - az);
    const nx = -(bz - az) / len;
    const nz = (bx - ax) / len;
    const base = pos.length / 3;
    // Extend each segment by half a width so corners overlap cleanly.
    const ex = ((bx - ax) / len) * (width / 2);
    const ez = ((bz - az) / len) * (width / 2);
    const a = [ax - ex, az - ez];
    const b = [bx + ex, bz + ez];
    pos.push(a[0]! + nx * width, y, a[1]! + nz * width, a[0]! - nx * width, y, a[1]! - nz * width, b[0]! + nx * width, y, b[1]! + nz * width, b[0]! - nx * width, y, b[1]! - nz * width);
    uv.push(0, 0, 0, 1, 1, 0, 1, 1);
    t.push(run, run, run + len, run + len);
    f.push(feed, feed, feed, feed);
    idx.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
    run += len;
  }
  return { pos, uv, t, f, idx };
}

function delays(count: number, fn: (i: number) => number) {
  return new THREE.InstancedBufferAttribute(Float32Array.from({ length: count }, (_, i) => fn(i)), 1);
}

/** Instanced material whose instances grow in, and shrink away in x-ray (trees, people). */
function growMaterial(xray: THREE.IUniform<number>, color: string, roughness = 0.8, metalness = 0, emissive?: string, emissiveIntensity = 0) {
  const uniforms = { uGrow: { value: 2 }, uXray: xray };
  const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, emissive: emissive ?? '#000000', emissiveIntensity });
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float aDelay;\nuniform float uGrow, uXray;')
      .replace(
        '#include <begin_vertex>',
        /* glsl */ `#include <begin_vertex>
        float gt = clamp((uGrow - aDelay) * 2.5, 0.0, 1.0);
        float s = 1.0 + 2.70158 * pow(gt - 1.0, 3.0) + 1.70158 * pow(gt - 1.0, 2.0);
        float gone = smoothstep(0.05 + aDelay * 0.3, 0.45 + aDelay * 0.3, uXray);
        transformed *= max(s, 0.0) * (1.0 - gone);`,
      );
  };
  return { material: m, uniforms };
}

interface Packet {
  path: number;
  pos: number;
  speed: number;
}

export class Campus {
  readonly root = new THREE.Group();
  readonly uniforms: CampusUniforms = createCampusUniforms();
  readonly placed: Placed[] = [];
  /** World points for the x-ray labels: records, relationships, discovery. */
  readonly xrayAnchors = [new THREE.Vector3(-1.9, 0.05, 1.6), new THREE.Vector3(2.6, 0.05, 3.75), new THREE.Vector3(0.2, 0.05, -4.4)];
  private paths: { pts: THREE.Vector2[]; len: number; cum: number[] }[] = [];
  private packets: THREE.InstancedMesh;
  private packetData: Packet[] = [];
  private people: THREE.InstancedMesh;
  private peopleData: { base: THREE.Vector3; phase: number; radius: number; speed: number }[] = [];
  private tmp = { m: new THREE.Matrix4(), q: new THREE.Quaternion(), s: new THREE.Vector3(1, 1, 1), p: new THREE.Vector3() };

  constructor(opts: { shadows: boolean; detail: number }) {
    const rand = mulberry32(7);

    // Buildings first: the slab needs their footprints.
    for (const [make, x, z] of LAYOUT) {
      const building = make();
      const build: BuildUniforms = { uBuild: { value: 100 }, uDim: { value: 0 } };
      const group = building.kit.build(buildingMaterials(build, this.uniforms), opts.shadows);
      group.position.set(x, 0, z);
      group.scale.setScalar(SCALE);
      const half = building.half.clone().multiplyScalar(SCALE);
      const ring = new THREE.Mesh(ringGeometry(half.x + 0.45, half.y + 0.45), new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0, depthWrite: false }));
      ring.position.set(x, 0.012, z);
      ring.rotation.x = -Math.PI / 2;
      this.root.add(group, ring);
      this.placed.push({ building, group, build, position: group.position.clone(), half, ring, anchor: new THREE.Vector3(x, building.height * SCALE + 0.6, z) });
    }

    // The CMDB slab.
    const pads = this.placed.map((p) => new THREE.Vector4(p.position.x, p.position.z, p.half.x, p.half.y));
    const slab = new THREE.Mesh(new RoundedBoxGeometry(SLAB.w, SLAB.h, SLAB.d, 3, 0.12), slabMaterial(this.uniforms, pads));
    slab.position.y = -SLAB.h / 2;
    slab.receiveShadow = true;
    this.root.add(slab);

    // A dark ground far below, fading out, so the slab floats over something.
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(30, 64),
      new THREE.MeshBasicMaterial({ color: TOKENS.night, transparent: true, opacity: 0.0, depthWrite: false }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.5;
    this.root.add(ground);

    // Relationship lines and feeds.
    const parts = [...LINKS.map((l) => ribbon(l, 0.07, 0.006, 0)), ...FEEDS.map((l) => ribbon(l, 0.05, 0.005, 1))];
    const geo = new THREE.BufferGeometry();
    const pos: number[] = [];
    const uv: number[] = [];
    const t: number[] = [];
    const f: number[] = [];
    const idx: number[] = [];
    for (const r of parts) {
      const off = pos.length / 3;
      pos.push(...r.pos);
      uv.push(...r.uv);
      t.push(...r.t);
      f.push(...r.f);
      idx.push(...r.idx.map((i) => i + off));
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setAttribute('aT', new THREE.Float32BufferAttribute(t, 1));
    geo.setAttribute('aFeed', new THREE.Float32BufferAttribute(f, 1));
    geo.setIndex(idx);
    const lines = new THREE.Mesh(geo, lineMaterial(this.uniforms));
    lines.renderOrder = 2;
    this.root.add(lines);

    // Gold data packets travelling the relationship lines.
    for (const l of [...LINKS, ...FEEDS]) {
      const pts = l.map(([x, z]) => new THREE.Vector2(x, z));
      const cum = [0];
      for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1]! + pts[i]!.distanceTo(pts[i - 1]!));
      this.paths.push({ pts, len: cum[cum.length - 1]!, cum });
    }
    const packetCount = Math.round(26 * opts.detail);
    for (let i = 0; i < packetCount; i++) {
      const path = i % this.paths.length;
      this.packetData.push({ path, pos: rand() * this.paths[path]!.len, speed: (0.8 + rand() * 0.9) * (rand() < 0.5 ? 1 : -1) });
    }
    const packetGeo = new RoundedBoxGeometry(0.2, 0.08, 0.11, 2, 0.03);
    packetGeo.translate(0, 0.06, 0);
    this.packets = new THREE.InstancedMesh(packetGeo, new THREE.MeshStandardMaterial({ color: GOLD, emissive: GOLD, emissiveIntensity: 2.4, roughness: 0.4 }), packetCount);
    this.packets.frustumCulled = false;
    this.root.add(this.packets);

    // Model trees around the slab's open corners: white, like an architect's model.
    const treePos: THREE.Vector3[] = [];
    const clear = (p: THREE.Vector3) =>
      this.placed.every((pl) => Math.abs(p.x - pl.position.x) > pl.half.x + 0.5 || Math.abs(p.z - pl.position.z) > pl.half.y + 0.5) &&
      [...LINKS, ...FEEDS].every((l) =>
        l.slice(1).every(([bx, bz], i) => {
          const [ax, az] = l[i]!;
          const onX = Math.abs(az - bz) < 0.01 && Math.abs(p.z - az) < 0.35 && p.x > Math.min(ax, bx) - 0.35 && p.x < Math.max(ax, bx) + 0.35;
          const onZ = Math.abs(ax - bx) < 0.01 && Math.abs(p.x - ax) < 0.35 && p.z > Math.min(az, bz) - 0.35 && p.z < Math.max(az, bz) + 0.35;
          return !onX && !onZ;
        }),
      );
    // Only a band along the slab's edge, so the grid of records stays readable.
    for (let n = 0; n < 220 * opts.detail; n++) {
      const p = new THREE.Vector3((rand() - 0.5) * (SLAB.w - 0.7), 0, (rand() - 0.5) * (SLAB.d - 0.7));
      const toEdge = Math.min(SLAB.w / 2 - Math.abs(p.x), SLAB.d / 2 - Math.abs(p.z));
      if (toEdge < 1.0 && clear(p) && treePos.every((q) => q.distanceTo(p) > 0.55)) treePos.push(p);
    }
    const crownGeo = new THREE.SphereGeometry(1, 12, 10);
    crownGeo.scale(0.15, 0.27, 0.15);
    crownGeo.translate(0, 0.38, 0);
    const trunkGeo = new THREE.CylinderGeometry(0.016, 0.022, 0.18, 6);
    trunkGeo.translate(0, 0.09, 0);
    const crownMat = growMaterial(this.uniforms.uXray, TREE, 0.85);
    const trunkMat = growMaterial(this.uniforms.uXray, TOKENS['grey-400'], 0.9);
    const crowns = new THREE.InstancedMesh(crownGeo, crownMat.material, treePos.length);
    const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat.material, treePos.length);
    treePos.forEach((p, i) => {
      const s = 0.55 + rand() * 0.4;
      this.tmp.m.compose(p, this.tmp.q.identity(), new THREE.Vector3(s, s * (0.9 + rand() * 0.3), s));
      crowns.setMatrixAt(i, this.tmp.m);
      trunks.setMatrixAt(i, this.tmp.m);
    });
    const treeDelay = delays(treePos.length, () => rand() * 0.3);
    crownGeo.setAttribute('aDelay', treeDelay);
    trunkGeo.setAttribute('aDelay', treeDelay);
    for (const tr of [crowns, trunks]) {
      tr.castShadow = opts.shadows;
      tr.receiveShadow = true;
      this.root.add(tr);
    }

    // People: tiny figures milling about outside each building.
    const personGeo = new THREE.CapsuleGeometry(0.026, 0.08, 3, 6);
    personGeo.translate(0, 0.09, 0);
    const peopleCount = Math.round(54 * opts.detail);
    const personMat = growMaterial(this.uniforms.uXray, TOKENS.white, 0.7);
    personGeo.setAttribute('aDelay', delays(peopleCount, () => rand() * 0.25));
    this.people = new THREE.InstancedMesh(personGeo, personMat.material, peopleCount);
    const color = new THREE.Color();
    for (let i = 0; i < peopleCount; i++) {
      const pl = this.placed[i % this.placed.length]!;
      const ang = rand() * Math.PI * 2;
      const base = pl.position.clone().add(new THREE.Vector3(Math.cos(ang) * (pl.half.x + 0.55), 0, Math.sin(ang) * (pl.half.y + 0.55)));
      this.peopleData.push({ base, phase: rand() * 6.28, radius: 0.1 + rand() * 0.35, speed: (rand() < 0.4 ? 0 : 0.2 + rand() * 0.3) * (rand() < 0.5 ? 1 : -1) });
      this.people.setColorAt(i, color.set(rand() < 0.2 ? TOKENS['iris-soft'] : TOKENS.white));
    }
    this.people.castShadow = false;
    this.people.frustumCulled = false;
    this.root.add(this.people);
    this.update(0, 0);
  }

  private xrayBuilt = false;
  /** X-ray lines are only seen at the end of the section, so they are built later, in idle time. */
  ensureXray() {
    if (this.xrayBuilt) return;
    this.xrayBuilt = true;
    for (const p of this.placed) {
      const xr = buildXray(p.building, p.group, this.uniforms);
      p.group.add(xr.shells, xr.interiors);
      this.root.add(xr.filaments);
      xr.filaments.position.copy(p.position);
      xr.filaments.scale.setScalar(SCALE);
    }
  }

  /** Instant finished state. */
  finish() {
    for (const p of this.placed) p.build.uBuild.value = 100;
  }

  update(dt: number, t: number) {
    this.uniforms.uTime.value = t;
    const { m, q, s, p } = this.tmp;
    this.packetData.forEach((d, i) => {
      const path = this.paths[d.path]!;
      d.pos += d.speed * dt;
      if (d.pos > path.len) d.pos -= path.len;
      if (d.pos < 0) d.pos += path.len;
      let k = 0;
      while (k < path.cum.length - 2 && path.cum[k + 1]! < d.pos) k++;
      const a = path.pts[k]!;
      const b = path.pts[k + 1]!;
      const u = (d.pos - path.cum[k]!) / (path.cum[k + 1]! - path.cum[k]!);
      p.set(a.x + (b.x - a.x) * u, 0, a.y + (b.y - a.y) * u);
      q.setFromAxisAngle(UP, Math.atan2(-(b.y - a.y), b.x - a.x));
      // Packets fade in and out at the ends of each path.
      const edge = Math.min(1, d.pos / 0.6, (path.len - d.pos) / 0.6);
      this.packets.setMatrixAt(i, m.compose(p, q, s.setScalar(Math.max(0.001, edge) * (1 - this.uniforms.uXray.value * 0.6))));
    });
    this.packets.instanceMatrix.needsUpdate = true;
    this.peopleData.forEach((d, i) => {
      const a = d.phase + t * d.speed;
      p.set(d.base.x + Math.cos(a) * d.radius, d.base.y, d.base.z + Math.sin(a) * d.radius);
      this.people.setMatrixAt(i, m.compose(p, q.identity(), s.setScalar(1)));
    });
    this.people.instanceMatrix.needsUpdate = true;
  }
}

const UP = new THREE.Vector3(0, 1, 0);

/** Rounded-rectangle outline (as a thin flat band) around a footprint. */
function ringGeometry(hx: number, hz: number, width = 0.05, r = 0.4): THREE.BufferGeometry {
  const outer = new THREE.Shape();
  const rr = (sh: THREE.Shape | THREE.Path, x: number, z: number, rad: number) => {
    sh.moveTo(-x + rad, -z);
    sh.lineTo(x - rad, -z);
    sh.quadraticCurveTo(x, -z, x, -z + rad);
    sh.lineTo(x, z - rad);
    sh.quadraticCurveTo(x, z, x - rad, z);
    sh.lineTo(-x + rad, z);
    sh.quadraticCurveTo(-x, z, -x, z - rad);
    sh.lineTo(-x, -z + rad);
    sh.quadraticCurveTo(-x, -z, -x + rad, -z);
  };
  rr(outer, hx, hz, r);
  const hole = new THREE.Path();
  rr(hole, hx - width, hz - width, r - width);
  outer.holes.push(hole);
  return new THREE.ShapeGeometry(outer, 8);
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
