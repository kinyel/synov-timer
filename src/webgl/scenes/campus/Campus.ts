import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { gsap } from 'gsap';
import { architecture, appEngine, hq, integration, itam, itom, itsm, type Building } from './buildings';
import { buildXray } from './xray';
import {
  CLAY,
  GOLD,
  ROAD,
  TREE,
  buildingMaterials,
  createCampusUniforms,
  type BuildUniforms,
  type CampusUniforms,
} from './materials';

/** Street grid: two avenues along x, two streets along z. Road centre lines in world units. */
const AVENUES_Z = [2.5, -3.7];
const STREETS_X = [-3.5, 3.5];
const ROAD_W = 0.95;
const EXTENT = 15;

export interface Placed {
  building: Building;
  group: THREE.Group;
  build: BuildUniforms;
  position: THREE.Vector3;
  /** Gold ring on the ground that lights up when this building is the subject. */
  ring: THREE.Mesh;
  /** World point above the roof where its label's leader line starts. */
  anchor: THREE.Vector3;
}

/** Layout: HQ in the central block, one expertise building in each surrounding block. */
const LAYOUT: [() => Building, number, number, number?][] = [
  [hq, 0, -0.55],
  // The warehouse faces the back avenue, where its docks are filmed from.
  [itam, 0.2, -6.2, Math.PI],
  [appEngine, -6.5, -0.7],
  [itom, 6.4, -0.8],
  [itsm, -6.2, 4.9],
  [architecture, 0.3, 4.9],
  [integration, 6.3, 4.9],
];

function groundMaterial(xray: THREE.IUniform<number>): THREE.MeshStandardMaterial {
  const m = new THREE.MeshStandardMaterial({ color: ROAD, roughness: 0.95, transparent: true, depthWrite: true });
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uMarks = { value: 0 };
    shader.uniforms.uXray = xray;
    m.userData.shader = shader;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vW;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vW;\nuniform float uMarks, uXray;')
      .replace(
        '#include <color_fragment>',
        /* glsl */ `#include <color_fragment>
        // Dashed white centre lines on every road, drawn on from the centre outward.
        float r = length(vW.xz);
        float reveal = smoothstep(r - 2.0, r, uMarks * 18.0);
        float m = 0.0;
        ${AVENUES_Z.map((z) => `m = max(m, (1.0 - smoothstep(0.012, 0.03, abs(vW.z - (${z.toFixed(2)})))) * step(0.5, fract(vW.x * 1.6)));`).join('\n')}
        ${STREETS_X.map((x) => `m = max(m, (1.0 - smoothstep(0.012, 0.03, abs(vW.x - (${x.toFixed(2)})))) * step(0.5, fract(vW.z * 1.6)));`).join('\n')}
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0), m * reveal * 0.9);
        diffuseColor.a *= 1.0 - smoothstep(${(EXTENT * 0.45).toFixed(1)}, ${(EXTENT * 0.95).toFixed(1)}, r);
        // X-ray: the board turns into a faint blueprint grid over the dark section behind.
        vec2 g = abs(fract(vW.xz - 0.5) - 0.5) / fwidth(vW.xz);
        float grid = 1.0 - smoothstep(0.0, 1.0, min(g.x, g.y));
        float fadeR = 1.0 - smoothstep(4.0, 12.0, r);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.56, 0.9, 1.0), uXray);
        diffuseColor.a = mix(diffuseColor.a, grid * 0.22 * fadeR, uXray);`,
      );
  };
  return m;
}

/** Raised white block pads (the model's "land"), fading out at the edge of the world. */
function padMaterial(xray: THREE.IUniform<number>): THREE.MeshStandardMaterial {
  const m = new THREE.MeshStandardMaterial({ color: CLAY, roughness: 0.94, transparent: true });
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uXray = xray;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vW;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvW = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vW;\nuniform float uXray;')
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>\ndiffuseColor.a *= (1.0 - smoothstep(${(EXTENT * 0.42).toFixed(1)}, ${(EXTENT * 0.85).toFixed(1)}, length(vW.xz))) * (1.0 - uXray);`,
      );
  };
  return m;
}

/** Instanced material whose instances grow in with a per-instance delay (trees, people, vans). */
function growMaterial(xray: THREE.IUniform<number>, color: string, roughness = 0.8, metalness = 0, emissive?: string) {
  const uniforms = { uGrow: { value: 0 }, uXray: xray };
  const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, emissive: emissive ?? '#000000', emissiveIntensity: emissive ? 0.08 : 0 });
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float aDelay;\nuniform float uGrow, uXray;')
      .replace(
        '#include <begin_vertex>',
        /* glsl */ `#include <begin_vertex>
        float gt = clamp((uGrow - aDelay) * 2.5, 0.0, 1.0);
        float s = 1.0 + 2.70158 * pow(gt - 1.0, 3.0) + 1.70158 * pow(gt - 1.0, 2.0);
        // In x-ray the soft furniture (trees, vans, people) shrinks away, staggered.
        float gone = smoothstep(0.05 + aDelay * 0.3, 0.45 + aDelay * 0.3, uXray);
        transformed *= max(s, 0.0) * (1.0 - gone);`,
      );
  };
  return { material: m, uniforms };
}

function delays(count: number, fn: (i: number) => number) {
  return new THREE.InstancedBufferAttribute(Float32Array.from({ length: count }, (_, i) => fn(i)), 1);
}

interface Van {
  axis: 'x' | 'z';
  line: number;
  dir: 1 | -1;
  pos: number;
  speed: number;
}

/**
 * The Raleston campus: an architectural model of a planned "digital empire".
 * HQ at the centre, six expertise buildings around it, a street grid with
 * gold data vans, trees and people. White clay, gold accent, nothing else.
 */
export class Campus {
  readonly root = new THREE.Group();
  readonly uniforms: CampusUniforms = createCampusUniforms();
  readonly placed: Placed[] = [];
  private ground: THREE.Mesh;
  private vans: THREE.InstancedMesh;
  private vanData: Van[] = [];
  private people: THREE.InstancedMesh;
  private peopleData: { base: THREE.Vector3; phase: number; radius: number; speed: number }[] = [];
  private grow: { uGrow: THREE.IUniform<number> }[] = [];
  private tmp = { m: new THREE.Matrix4(), q: new THREE.Quaternion(), s: new THREE.Vector3(1, 1, 1), p: new THREE.Vector3() };

  constructor(opts: { shadows: boolean; detail: number }) {
    // Ground (streets) and raised block pads.
    this.ground = new THREE.Mesh(new THREE.CircleGeometry(EXTENT + 2, 96), groundMaterial(this.uniforms.uXray));
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.root.add(this.ground);

    const xs = [-EXTENT, STREETS_X[0]!, STREETS_X[1]!, EXTENT];
    const zs = [-EXTENT, AVENUES_Z[1]!, AVENUES_Z[0]!, EXTENT];
    const pads: THREE.Matrix4[] = [];
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) {
        const x0 = xs[i]! + (i > 0 ? ROAD_W / 2 : 0);
        const x1 = xs[i + 1]! - (i < 2 ? ROAD_W / 2 : 0);
        const z0 = zs[j]! + (j > 0 ? ROAD_W / 2 : 0);
        const z1 = zs[j + 1]! - (j < 2 ? ROAD_W / 2 : 0);
        pads.push(new THREE.Matrix4().compose(new THREE.Vector3((x0 + x1) / 2, 0.025, (z0 + z1) / 2), new THREE.Quaternion(), new THREE.Vector3(x1 - x0, 1, z1 - z0)));
      }
    const padMesh = new THREE.InstancedMesh(new RoundedBoxGeometry(1, 0.05, 1, 2, 0.02), padMaterial(this.uniforms.uXray), pads.length);
    pads.forEach((m, i) => padMesh.setMatrixAt(i, m));
    padMesh.receiveShadow = true;
    this.root.add(padMesh);

    // Buildings.
    for (const [make, x, z, rot = 0] of LAYOUT) {
      const building = make();
      const build: BuildUniforms = { uBuild: { value: -0.01 }, uDim: { value: 0 } };
      const group = building.kit.build(buildingMaterials(build, this.uniforms), opts.shadows);
      group.position.set(x, 0.05, z);
      group.rotation.y = rot;
      const ring = new THREE.Mesh(ringGeometry(building.half.x + 0.28, building.half.y + 0.28), new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0, depthWrite: false }));
      ring.position.set(x, 0.062, z);
      ring.rotation.x = -Math.PI / 2;
      this.root.add(group, ring);
      this.placed.push({ building, group, build, position: group.position.clone(), ring, anchor: new THREE.Vector3(x, building.height + 0.45, z) });
    }

    // Trees: teardrop crowns on thin trunks, along avenues and in the open blocks.
    const treePos: THREE.Vector3[] = [];
    const rand = mulberry32(11);
    for (const z of AVENUES_Z)
      for (let x = -EXTENT * 0.7; x < EXTENT * 0.7; x += 1.5) {
        if (STREETS_X.some((sx) => Math.abs(x - sx) < 1)) continue;
        for (const side of [-1, 1]) treePos.push(new THREE.Vector3(x + rand() * 0.2, 0.05, z + side * (ROAD_W / 2 + 0.22)));
      }
    for (const x of STREETS_X)
      for (let z = -EXTENT * 0.65; z < EXTENT * 0.65; z += 1.6) {
        if (AVENUES_Z.some((az) => Math.abs(z - az) < 1)) continue;
        for (const side of [-1, 1]) treePos.push(new THREE.Vector3(x + side * (ROAD_W / 2 + 0.22), 0.05, z + rand() * 0.2));
      }
    // A few tight clusters in the open corners, avoiding building footprints.
    const clusters = Array.from({ length: Math.round(9 * opts.detail) }, () => new THREE.Vector3((rand() - 0.5) * 2 * EXTENT * 0.6, 0.05, (rand() - 0.5) * 2 * EXTENT * 0.6));
    for (let n = 0; n < 70 * opts.detail; n++) {
      const c = clusters[n % clusters.length]!;
      const p = c.clone().add(new THREE.Vector3((rand() - 0.5) * 1.6, 0, (rand() - 0.5) * 1.6));
      const nearRoad = AVENUES_Z.some((z) => Math.abs(p.z - z) < ROAD_W) || STREETS_X.some((x) => Math.abs(p.x - x) < ROAD_W);
      const nearBuilding = this.placed.some((pl) => Math.abs(p.x - pl.position.x) < pl.building.half.x + 0.45 && Math.abs(p.z - pl.position.z) < pl.building.half.y + 0.45);
      if (!nearRoad && !nearBuilding) treePos.push(p);
    }
    const trees = treePos.filter((p) => p.length() < EXTENT * 0.72);
    const crownGeo = new THREE.SphereGeometry(1, 12, 10);
    crownGeo.scale(0.13, 0.24, 0.13);
    crownGeo.translate(0, 0.34, 0);
    const trunkGeo = new THREE.CylinderGeometry(0.014, 0.02, 0.16, 6);
    trunkGeo.translate(0, 0.08, 0);
    const crownMat = growMaterial(this.uniforms.uXray, TREE, 0.75);
    const trunkMat = growMaterial(this.uniforms.uXray, '#C9CFD8', 0.9);
    this.grow.push(crownMat.uniforms, trunkMat.uniforms);
    const crowns = new THREE.InstancedMesh(crownGeo, crownMat.material, trees.length);
    const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat.material, trees.length);
    const color = new THREE.Color();
    trees.forEach((p, i) => {
      const s = 0.75 + rand() * 0.55;
      this.tmp.m.compose(p, this.tmp.q.identity(), new THREE.Vector3(s, s * (0.9 + rand() * 0.3), s));
      crowns.setMatrixAt(i, this.tmp.m);
      trunks.setMatrixAt(i, this.tmp.m);
      crowns.setColorAt(i, color.set(TREE).offsetHSL((rand() - 0.5) * 0.03, 0, (rand() - 0.5) * 0.08));
    });
    const treeDelay = delays(trees.length, (i) => 0.15 + (trees[i]!.length() / EXTENT) * 0.6 + rand() * 0.1);
    crownGeo.setAttribute('aDelay', treeDelay);
    trunkGeo.setAttribute('aDelay', treeDelay);
    for (const t of [crowns, trunks]) {
      t.castShadow = opts.shadows;
      t.receiveShadow = true;
      this.root.add(t);
    }

    // Gold data vans: a cab and a box, driving the grid in both directions.
    const vanGeo = new RoundedBoxGeometry(0.42, 0.16, 0.17, 2, 0.03);
    vanGeo.translate(-0.04, 0.11, 0);
    const cab = new RoundedBoxGeometry(0.13, 0.13, 0.16, 2, 0.03);
    cab.translate(0.24, 0.095, 0);
    const merged = mergeTwo(vanGeo, cab);
    vanGeo.dispose();
    cab.dispose();
    const vanMat = growMaterial(this.uniforms.uXray, GOLD, 0.4, 0.2, GOLD);
    this.grow.push(vanMat.uniforms);
    const vanCount = Math.round(22 * opts.detail);
    for (let i = 0; i < vanCount; i++) {
      const axis = i % 2 ? 'x' : 'z';
      const lines = axis === 'x' ? AVENUES_Z : STREETS_X;
      this.vanData.push({ axis, line: lines[i % lines.length]!, dir: rand() < 0.5 ? 1 : -1, pos: (rand() - 0.5) * 2 * EXTENT * 0.55, speed: 0.55 + rand() * 0.45 });
    }
    merged.setAttribute('aDelay', delays(vanCount, () => 0.75 + rand() * 0.2));
    this.vans = new THREE.InstancedMesh(merged, vanMat.material, vanCount);
    // Moving things don't cast into the (static) shadow map; AO grounds them instead.
    this.vans.castShadow = false;
    this.vans.frustumCulled = false;
    this.root.add(this.vans);

    // People: tiny figures milling about on the pads, as in an architect's model.
    const personGeo = new THREE.CapsuleGeometry(0.022, 0.07, 3, 6);
    personGeo.translate(0, 0.08, 0);
    const peopleCount = Math.round(70 * opts.detail);
    const personMat = growMaterial(this.uniforms.uXray, '#2B3557', 0.8);
    this.grow.push(personMat.uniforms);
    personGeo.setAttribute('aDelay', delays(peopleCount, () => 0.7 + rand() * 0.25));
    this.people = new THREE.InstancedMesh(personGeo, personMat.material, peopleCount);
    for (let i = 0; i < peopleCount; i++) {
      const pl = this.placed[Math.floor(rand() * this.placed.length)]!;
      const ang = rand() * Math.PI * 2;
      const base = pl.position.clone().add(new THREE.Vector3(Math.cos(ang) * (pl.building.half.x + 0.35), 0.05, Math.sin(ang) * (pl.building.half.y + 0.35)));
      this.peopleData.push({ base, phase: rand() * 6.28, radius: 0.1 + rand() * 0.35, speed: (rand() < 0.4 ? 0 : 0.2 + rand() * 0.3) * (rand() < 0.5 ? 1 : -1) });
      this.people.setColorAt(i, color.set(rand() < 0.15 ? GOLD : rand() < 0.5 ? '#2B3557' : '#8C95AD'));
    }
    this.people.castShadow = false;
    this.people.frustumCulled = false;
    this.root.add(this.people);
    this.update(0, 0);
  }

  private xrayBuilt = false;
  /**
   * X-ray edge lines are only seen at the end of Expertise, and extracting
   * edges is the single most expensive part of building the campus, so it is
   * done later, in idle time (or on demand if someone scrolls there first).
   */
  ensureXray() {
    if (this.xrayBuilt) return;
    this.xrayBuilt = true;
    for (const p of this.placed) {
      const xr = buildXray(p.building, p.group, this.uniforms);
      p.group.add(xr.shells, xr.interiors);
    }
  }

  /**
   * The model builds itself: street marks draw on, trees pop, buildings rise
   * with a gold build line, HQ alongside them. Tuned so the first viewport is
   * complete about 1.5 s after the curtain lifts.
   */
  playBuild(tl: gsap.core.Timeline, at = 0) {
    const ground = this.ground.material as THREE.MeshStandardMaterial;
    const marks = { v: 0 };
    tl.to(marks, { v: 1, duration: 1.2, ease: 'power2.out', onUpdate: () => {
      const s = ground.userData.shader as { uniforms: { uMarks: THREE.IUniform<number> } } | undefined;
      if (s) s.uniforms.uMarks.value = marks.v;
    } }, at);
    for (const g of this.grow) tl.to(g.uGrow, { value: 1.6, duration: 1.4, ease: 'none' }, at + 0.05);
    const order = [...this.placed].sort((a, b) => (a.building.id === 'hq' ? -1 : b.building.id === 'hq' ? 1 : a.position.length() - b.position.length()));
    let end = at;
    order.forEach((p, i) => {
      const isHq = p.building.id === 'hq';
      const start = at + (isHq ? 0.05 : 0.12 + i * 0.07);
      const duration = isHq ? 1.3 : 0.85;
      end = Math.max(end, start + duration);
      tl.fromTo(
        p.build.uBuild,
        { value: -0.01 },
        { value: p.building.height + 0.3, duration, ease: isHq ? 'power2.out' : 'power3.out' },
        start,
      );
    });
    // The moment the last building tops out, switch the build clip off entirely.
    tl.call(
      () => {
        for (const p of this.placed) p.build.uBuild.value = 100;
      },
      [],
      end,
    );
  }

  /** Instant finished state (reduced motion, or when warming shaders). */
  finish() {
    for (const p of this.placed) p.build.uBuild.value = 100;
    for (const g of this.grow) g.uGrow.value = 2;
    const s = (this.ground.material as THREE.MeshStandardMaterial).userData.shader as { uniforms: { uMarks: THREE.IUniform<number> } } | undefined;
    if (s) s.uniforms.uMarks.value = 1;
  }

  reset() {
    for (const p of this.placed) p.build.uBuild.value = -0.01;
    for (const g of this.grow) g.uGrow.value = 0;
  }

  private flow = 1;
  /** Traffic speed multiplier (the "Lightning results" beat speeds the vans up). */
  setFlow(f: number) {
    this.flow += (f - this.flow) * 0.08;
  }

  update(dt: number, t: number) {
    this.uniforms.uTime.value = t;
    const { m, q, s, p } = this.tmp;
    this.vanData.forEach((v, i) => {
      v.pos += v.speed * v.dir * dt * this.flow;
      const lim = EXTENT * 0.55;
      if (v.pos > lim) v.pos = -lim;
      if (v.pos < -lim) v.pos = lim;
      const lane = 0.2 * v.dir;
      if (v.axis === 'x') {
        p.set(v.pos, 0, v.line + lane);
        q.setFromAxisAngle(UP, v.dir > 0 ? 0 : Math.PI);
      } else {
        p.set(v.line - lane, 0, v.pos);
        q.setFromAxisAngle(UP, v.dir > 0 ? -Math.PI / 2 : Math.PI / 2);
      }
      const edge = Math.min(1, (lim - Math.abs(v.pos)) / 1.5);
      this.vans.setMatrixAt(i, m.compose(p, q, this.tmp.s.setScalar(Math.max(0.001, edge))));
    });
    this.vans.instanceMatrix.needsUpdate = true;
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
function ringGeometry(hx: number, hz: number, width = 0.045, r = 0.35): THREE.BufferGeometry {
  const outer = new THREE.Shape();
  const rr = (s: THREE.Shape | THREE.Path, x: number, z: number, rad: number) => {
    s.moveTo(-x + rad, -z);
    s.lineTo(x - rad, -z);
    s.quadraticCurveTo(x, -z, x, -z + rad);
    s.lineTo(x, z - rad);
    s.quadraticCurveTo(x, z, x - rad, z);
    s.lineTo(-x + rad, z);
    s.quadraticCurveTo(-x, z, -x, z - rad);
    s.lineTo(-x, -z + rad);
    s.quadraticCurveTo(-x, -z, -x + rad, -z);
  };
  rr(outer, hx, hz, r);
  const hole = new THREE.Path();
  rr(hole, hx - width, hz - width, r - width);
  outer.holes.push(hole);
  return new THREE.ShapeGeometry(outer, 8);
}

function mergeTwo(a: THREE.BufferGeometry, b: THREE.BufferGeometry): THREE.BufferGeometry {
  const ga = a.index ? a.toNonIndexed() : a;
  const gb = b.index ? b.toNonIndexed() : b;
  const out = new THREE.BufferGeometry();
  for (const name of ['position', 'normal', 'uv'] as const) {
    const x = ga.getAttribute(name) as THREE.BufferAttribute;
    const y = gb.getAttribute(name) as THREE.BufferAttribute;
    const arr = new Float32Array(x.array.length + y.array.length);
    arr.set(x.array as Float32Array, 0);
    arr.set(y.array as Float32Array, x.array.length);
    out.setAttribute(name, new THREE.BufferAttribute(arr, x.itemSize));
  }
  return out;
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

