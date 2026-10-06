import * as THREE from 'three';
import { buildingMaterials, createCampusUniforms, CLAY, CLAY_SHADE, GOLD, ROAD, TREE, type BuildUniforms, type CampusUniforms } from '../campus/materials';
import { DISTRICTS, miniHq, type DistrictModel } from './districts';

const R = 8.6;
const RING_R = 5.3;
const UP = new THREE.Vector3(0, 1, 0);

export interface District {
  model: DistrictModel;
  group: THREE.Group;
  build: BuildUniforms;
  position: THREE.Vector3;
  angle: number;
  ring: THREE.Mesh;
  arc: THREE.Mesh;
  arcU: { uActive: THREE.IUniform<number> };
  anchor: THREE.Vector3;
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

/** Soft round puff texture for clouds and smoke, drawn once on a canvas. */
function puffTexture(): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(64, 64, 4, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.45, 'rgba(255,255,255,0.8)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Gold light arc from HQ to a district; a bright pulse travels outward along it. */
function arcMaterial(time: THREE.IUniform<number>, glow: THREE.IUniform<number>) {
  const uniforms = { uTime: time, uGlow: glow, uActive: { value: 0 }, uColor: { value: new THREE.Color('#FFC21A') } };
  const m = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime, uGlow, uActive;
      uniform vec3 uColor;
      varying vec2 vUv;
      void main() {
        float pulse = pow(fract(vUv.x - uTime * 0.35), 8.0);
        float base = 0.25 + uGlow * 0.6 + uActive * 0.9;
        float a = (0.35 + uActive * 0.5 + uGlow * 0.4) * smoothstep(0.0, 0.05, vUv.x) * (1.0 - smoothstep(0.95, 1.0, vUv.x));
        gl_FragColor = vec4(uColor * (base + pulse * (1.5 + uActive * 3.0 + uGlow * 2.0)), a + pulse * 0.5);
      }
    `,
  });
  return { material: m, uniforms };
}

/**
 * The industries city: a floating white model island, the HQ at its centre,
 * six districts around it, roads with cars and gold data packets, gold arcs
 * from HQ to each district, trees, factory smoke, turbines and clouds.
 */
export class City {
  readonly root = new THREE.Group();
  readonly uniforms: CampusUniforms = createCampusUniforms();
  readonly districts: District[] = [];
  readonly hqBuild: BuildUniforms = { uBuild: { value: 100 }, uDim: { value: 0 } };
  /** 0 by day → 1 at dusk; brightens arcs and packets. */
  readonly glow = { value: 0 };
  readonly clouds = new THREE.Group();
  private rotors: THREE.Group[] = [];
  private movers: { mesh: THREE.InstancedMesh; trail?: THREE.InstancedMesh; data: { road: number; pos: number; dir: number; speed: number }[] }[] = [];
  private smoke: THREE.InstancedMesh | null = null;
  private smokeAlpha: THREE.InstancedBufferAttribute | null = null;
  private smokeData: { base: THREE.Vector3; phase: number }[] = [];
  private m = new THREE.Matrix4();
  private q = new THREE.Quaternion();
  private s = new THREE.Vector3();
  private p = new THREE.Vector3();

  constructor(opts: { shadows: boolean; detail: number }) {
    const rand = mulberry32(5);
    const clay = new THREE.MeshStandardMaterial({ color: CLAY, roughness: 0.94 });
    const shade = new THREE.MeshStandardMaterial({ color: CLAY_SHADE, roughness: 0.95, flatShading: true });
    const road = new THREE.MeshStandardMaterial({ color: ROAD, roughness: 0.95 });

    // Island: a thick white board with a faceted rock underside.
    const top = new THREE.Mesh(new THREE.CylinderGeometry(R, R - 0.08, 0.32, 128), clay);
    top.position.y = -0.16;
    top.receiveShadow = true;
    const lip = new THREE.Mesh(new THREE.CylinderGeometry(R - 0.08, R - 0.4, 0.3, 128), shade);
    lip.position.y = -0.47;
    const rockPts = [0, 0.15, 0.32, 0.5, 0.68, 0.84, 1].map((t) => new THREE.Vector2((R - 0.4) * Math.pow(1 - t, 0.75) * (1 - t * 0.15), -0.62 - t * 4.6));
    const rockGeo = new THREE.LatheGeometry(rockPts, 14).toNonIndexed();
    const pos = rockGeo.getAttribute('position');
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      if (y < -0.7) {
        const j = 1 + (Math.sin(pos.getX(i) * 3.1 + y * 2.3) * 0.5 + Math.cos(pos.getZ(i) * 2.7) * 0.5) * 0.08;
        pos.setXYZ(i, pos.getX(i) * j, y, pos.getZ(i) * j);
      }
    }
    rockGeo.computeVertexNormals();
    const rock = new THREE.Mesh(rockGeo, shade);
    this.root.add(top, lip, rock);

    // Ring road and radial roads.
    const ringRoad = new THREE.Mesh(new THREE.RingGeometry(3.05, 3.4, 128), road);
    ringRoad.rotation.x = -Math.PI / 2;
    ringRoad.position.y = 0.006;
    ringRoad.receiveShadow = true;
    this.root.add(ringRoad);
    const roadAngles: number[] = [];

    // HQ at the centre.
    const hqGroup = miniHq().build(buildingMaterials(this.hqBuild, this.uniforms), opts.shadows);
    hqGroup.position.y = 0.0;
    this.root.add(hqGroup);

    // Districts.
    DISTRICTS.forEach((d, i) => {
      const model = d.make();
      const angle = (i / DISTRICTS.length) * Math.PI * 2 + Math.PI / 6;
      const position = new THREE.Vector3(Math.cos(angle) * RING_R, 0, Math.sin(angle) * RING_R);
      const build: BuildUniforms = { uBuild: { value: 100 }, uDim: { value: 0 } };
      const group = model.kit.build(buildingMaterials(build, this.uniforms), opts.shadows);
      group.position.copy(position);
      group.rotation.y = -angle + Math.PI / 2;
      this.root.add(group);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(model.radius + 0.2, model.radius + 0.26, 96),
        new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0, depthWrite: false }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(position.x, 0.012, position.z);
      this.root.add(ring);

      // Radial road from the ring road to the district edge.
      roadAngles.push(angle);
      const len = RING_R - model.radius - 3.4 + 0.1;
      const rg = new THREE.BoxGeometry(len, 0.012, 0.34);
      const rd = new THREE.Mesh(rg, road);
      const mid = 3.4 + len / 2 - 0.05;
      rd.position.set(Math.cos(angle) * mid, 0.006, Math.sin(angle) * mid);
      rd.rotation.y = -angle;
      rd.receiveShadow = true;
      this.root.add(rd);
      // Spoke from HQ plaza to the ring road.
      const sg = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.012, 0.3), road);
      sg.position.set(Math.cos(angle) * 2.25, 0.006, Math.sin(angle) * 2.25);
      sg.rotation.y = -angle;
      this.root.add(sg);

      // Gold arc HQ → district.
      const anchor = position.clone().setY(model.height + 0.5);
      const a = new THREE.Vector3(0, 2.4, 0);
      const b = position.clone().setY(model.height + 0.15);
      const c = a.clone().lerp(b, 0.5).setY(Math.max(a.y, b.y) + 2.2);
      const arcGeo = new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, c, b), 64, 0.022, 6);
      const am = arcMaterial(this.uniforms.uTime, this.glow);
      const arc = new THREE.Mesh(arcGeo, am.material);
      arc.renderOrder = 4;
      this.root.add(arc);

      // Turbine rotors (three thin blades), animated in update().
      for (const r of model.rotors ?? []) {
        const rotor = new THREE.Group();
        for (let k = 0; k < 3; k++) {
          const blade = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.62, 0.012), clay);
          blade.position.y = 0.31;
          const holder = new THREE.Group();
          holder.rotation.z = (k / 3) * Math.PI * 2;
          holder.add(blade);
          rotor.add(holder);
        }
        rotor.position.copy(r).applyAxisAngle(UP, group.rotation.y).add(position);
        rotor.rotation.y = group.rotation.y;
        this.rotors.push(rotor);
        this.root.add(rotor);
      }
      for (const st of model.stacks ?? []) {
        const base = st.clone().applyAxisAngle(UP, group.rotation.y).add(position);
        for (let k = 0; k < 7; k++) this.smokeData.push({ base, phase: k / 7 + rand() * 0.05 });
      }

      this.districts.push({ model, group, build, position, angle, ring, arc, arcU: am.uniforms, anchor });
    });

    // Smoke puffs: soft white, rising, swelling, fading.
    const puff = puffTexture();
    if (this.smokeData.length) {
      const geo = new THREE.PlaneGeometry(1, 1);
      this.smokeAlpha = new THREE.InstancedBufferAttribute(new Float32Array(this.smokeData.length), 1);
      geo.setAttribute('aAlpha', this.smokeAlpha);
      const sm = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uMap: { value: puff } },
        vertexShader:
          'attribute float aAlpha; varying float vA; varying vec2 vUv; void main(){ vA = aAlpha; vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position,1.0); }',
        fragmentShader: 'uniform sampler2D uMap; varying float vA; varying vec2 vUv; void main(){ vec4 t = texture2D(uMap, vUv); gl_FragColor = vec4(vec3(0.97), t.a * vA * 0.8); }',
      });
      this.smoke = new THREE.InstancedMesh(geo, sm, this.smokeData.length);
      this.smoke.frustumCulled = false;
      this.root.add(this.smoke);
    }

    // Cars (white) and gold data packets (with a light trail) on the radial roads.
    const carGeo = new THREE.BoxGeometry(0.22, 0.09, 0.11);
    carGeo.translate(0, 0.06, 0);
    const cars = new THREE.InstancedMesh(carGeo, new THREE.MeshStandardMaterial({ color: '#dfe3ea', roughness: 0.6 }), Math.round(18 * opts.detail));
    const packetGeo = new THREE.CapsuleGeometry(0.05, 0.12, 4, 8);
    packetGeo.rotateZ(Math.PI / 2);
    packetGeo.translate(0, 0.1, 0);
    const packets = new THREE.InstancedMesh(packetGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color('#FFD36A').multiplyScalar(2.2) }), Math.round(18 * opts.detail));
    const trailGeo = new THREE.PlaneGeometry(1, 0.08);
    trailGeo.translate(-0.5, 0, 0);
    trailGeo.rotateX(-Math.PI / 2);
    trailGeo.translate(0, 0.1, 0);
    const trailMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uColor: { value: new THREE.Color('#FFC21A') }, uGlow: this.glow },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position,1.0); }',
      fragmentShader:
        'uniform vec3 uColor; uniform float uGlow; varying vec2 vUv; void main(){ float a = pow(vUv.x, 2.0) * (1.0 - abs(vUv.y - 0.5) * 2.0); gl_FragColor = vec4(uColor * (1.2 + uGlow * 2.0), a * 0.9); }',
    });
    const trails = new THREE.InstancedMesh(trailGeo, trailMat, packets.count);
    for (const [mesh, trail, speed] of [
      [cars, undefined, 0.6],
      [packets, trails, 1.4],
    ] as const) {
      mesh.frustumCulled = false;
      this.root.add(mesh);
      if (trail) {
        trail.frustumCulled = false;
        this.root.add(trail);
      }
      this.movers.push({
        mesh,
        trail,
        data: Array.from({ length: mesh.count }, (_, i) => ({ road: i % roadAngles.length, pos: rand(), dir: rand() < 0.5 ? 1 : -1, speed: speed * (0.7 + rand() * 0.6) })),
      });
    }
    this.roadAngles = roadAngles;

    // Trees: teal teardrops in loose groves, away from roads and districts.
    const treePos: THREE.Vector3[] = [];
    for (let n = 0; n < 260 * opts.detail; n++) {
      const a = rand() * Math.PI * 2;
      const r = 1.9 + Math.sqrt(rand()) * (R - 2.4);
      const p = new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r);
      const nearRoad = roadAngles.some((ra) => Math.abs(Math.sin(a - ra)) * r < 0.45 && Math.cos(a - ra) > 0) || Math.abs(r - 3.22) < 0.4;
      const nearDistrict = this.districts.some((d) => d.position.distanceTo(p) < d.model.radius + 0.35);
      if (!nearRoad && !nearDistrict && r > 1.9) treePos.push(p);
    }
    const crown = new THREE.SphereGeometry(1, 10, 8);
    crown.scale(0.13, 0.24, 0.13);
    crown.translate(0, 0.32, 0);
    const trees = new THREE.InstancedMesh(crown, new THREE.MeshStandardMaterial({ color: TREE, roughness: 0.75 }), treePos.length);
    const col = new THREE.Color();
    treePos.forEach((p, i) => {
      const sc = 0.7 + rand() * 0.6;
      trees.setMatrixAt(i, this.m.compose(p, this.q.identity(), this.s.set(sc, sc * (0.85 + rand() * 0.35), sc)));
      trees.setColorAt(i, col.set(TREE).offsetHSL((rand() - 0.5) * 0.03, 0, (rand() - 0.5) * 0.1));
    });
    trees.castShadow = opts.shadows;
    this.root.add(trees);

    // Clouds: a deck the camera descends through, and a few drifting around the island.
    const cloudMat = new THREE.SpriteMaterial({ map: puff, color: '#ffffff', transparent: true, opacity: 0.92, depthWrite: false });
    const addCloud = (x: number, y: number, z: number, size: number) => {
      const cloud = new THREE.Group();
      // Four puffs per cloud: the shape still reads, with a third less overdraw than six.
      for (let k = 0; k < 4; k++) {
        const s = new THREE.Sprite(cloudMat);
        s.position.set((rand() - 0.5) * size * 1.6, (rand() - 0.5) * size * 0.3, (rand() - 0.5) * size * 0.8);
        s.scale.setScalar(size * (0.7 + rand() * 0.6));
        cloud.add(s);
      }
      cloud.position.set(x, y, z);
      this.clouds.add(cloud);
    };
    for (let n = 0; n < 26; n++) {
      const a = rand() * Math.PI * 2;
      const r = rand() * 13;
      addCloud(Math.cos(a) * r, 9 + rand() * 3, Math.sin(a) * r, 3 + rand() * 3);
    }
    for (let n = 0; n < 9; n++) {
      const a = rand() * Math.PI * 2;
      addCloud(Math.cos(a) * (R + 3 + rand() * 4), -1.5 - rand() * 3, Math.sin(a) * (R + 3 + rand() * 4), 2.5 + rand() * 2);
    }
    this.root.add(this.clouds);
  }

  private roadAngles: number[] = [];

  /** Light up one district (index) or none (-1); `all` lights every arc (finale). */
  setActive(weights: number[]) {
    this.districts.forEach((d, i) => {
      const w = weights[i] ?? 0;
      d.arcU.uActive.value = w;
      (d.ring.material as THREE.MeshBasicMaterial).opacity = w * 0.9;
    });
  }

  /** camQ: the camera's world quaternion, so smoke puffs always face the viewer. */
  update(dt: number, t: number, camQ: THREE.Quaternion) {
    this.uniforms.uTime.value = t;
    for (const r of this.rotors) r.rotateZ(dt * 1.6);
    const { m, q, s, p } = this;
    for (const mv of this.movers) {
      mv.data.forEach((d, i) => {
        d.pos += (d.speed * dt * d.dir) / 4.5;
        if (d.pos > 1) d.pos -= 1;
        if (d.pos < 0) d.pos += 1;
        const a = this.roadAngles[d.road]!;
        const lane = 0.09 * d.dir;
        const r = 1.6 + d.pos * (RING_R - 2.9);
        p.set(Math.cos(a) * r - Math.sin(a) * lane, 0, Math.sin(a) * r + Math.cos(a) * lane);
        q.setFromAxisAngle(UP, -a + (d.dir > 0 ? 0 : Math.PI));
        const fade = Math.min(1, Math.min(d.pos, 1 - d.pos) * 12);
        mv.mesh.setMatrixAt(i, m.compose(p, q, s.setScalar(Math.max(0.001, fade))));
        mv.trail?.setMatrixAt(i, m.compose(p, q, s.set(0.6 + d.speed * 0.25, 1, 1).multiplyScalar(Math.max(0.001, fade))));
      });
      mv.mesh.instanceMatrix.needsUpdate = true;
      if (mv.trail) mv.trail.instanceMatrix.needsUpdate = true;
    }
    if (this.smoke && this.smokeAlpha) {
      this.smokeData.forEach((d, i) => {
        const life = (t * 0.18 + d.phase) % 1;
        p.copy(d.base).add(s.set(Math.sin(life * 3 + d.phase * 9) * 0.12 + life * 0.5, life * 1.6, 0));
        const size = 0.18 + life * 0.55;
        this.smoke!.setMatrixAt(i, m.compose(p, camQ, s.set(size, size, size)));
        this.smokeAlpha!.setX(i, Math.min(1, life * 6) * (1 - life));
      });
      this.smoke.instanceMatrix.needsUpdate = true;
      this.smokeAlpha.needsUpdate = true;
    }
    this.clouds.children.forEach((c, i) => {
      c.position.x += Math.sin(i * 1.7) * dt * 0.08;
    });
  }
}
