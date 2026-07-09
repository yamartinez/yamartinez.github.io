// 3D Interactive Solar System — Three.js (ESM, no build step)
// Author: opus-4.8-max model test. See ../brief-solar-system.md for the brief.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

/* ============================================================= *
 *  Data — one Earth year lasts EARTH_YEAR seconds at 1× speed.  *
 * ============================================================= */
const EARTH_YEAR = 14; // seconds
const TWO_PI = Math.PI * 2;
const deg = (d) => (d * Math.PI) / 180;

const SUN = {
  name: 'Sun',
  color: 0xffcf6b,
  radius: 7,
  tagline: 'The star at the heart of it all — its gravity binds every world in orbit.',
  facts: [
    ['Type', 'G-type main-sequence star'],
    ['Diameter', '1,391,000 km'],
    ['Surface', '≈ 5,500 °C'],
    ['Made of', 'Hydrogen & Helium'],
    ['Share of mass', '99.86% of the system'],
  ],
};

// sizeR/distR = readable spacing · sizeT/distT = true-ish relative scale
const PLANETS = [
  {
    name: 'Mercury', color: 0x8c7f76, tex: 'rocky',
    sizeR: 0.55, sizeT: 0.40, distR: 16, distT: 17.6,
    period: 0.24, spin: 0.06, tilt: 0.03,
    tagline: 'The swift, sun-scorched world — smallest planet, with wild temperature swings.',
    facts: [['Type', 'Terrestrial'], ['Diameter', '4,879 km'], ['Day', '58.6 Earth days'],
      ['Year', '88 days'], ['Moons', '0'], ['From Sun', '0.39 AU']],
  },
  {
    name: 'Venus', color: 0xd8a45b, tex: 'venus',
    sizeR: 0.9, sizeT: 0.95, distR: 23, distT: 32,
    period: 0.62, spin: -0.02, tilt: 177.4,
    atmosphere: { color: 0xe7c98a, opacity: 0.35 },
    tagline: 'A runaway greenhouse — crushing pressure and the hottest surface in the system.',
    facts: [['Type', 'Terrestrial'], ['Diameter', '12,104 km'], ['Day', '243 days (retrograde)'],
      ['Year', '225 days'], ['Moons', '0'], ['From Sun', '0.72 AU']],
  },
  {
    name: 'Earth', color: 0x3f7fd4, tex: 'earth',
    sizeR: 1.0, sizeT: 1.0, distR: 31, distT: 45,
    period: 1.0, spin: 0.5, tilt: 23.4,
    atmosphere: { color: 0x6fb2ff, opacity: 0.5 },
    tagline: 'Our pale blue dot — the only world we know that teems with life.',
    facts: [['Type', 'Terrestrial'], ['Diameter', '12,742 km'], ['Day', '24 hours'],
      ['Year', '365.25 days'], ['Moons', '1'], ['From Sun', '1.00 AU']],
    moons: [{ name: 'Moon', color: 0xbfc3c9, tex: 'moon', sizeU: 0.27, distU: 2.4, speed: 1.3,
      tagline: "Earth's companion — it raises the tides and steadies our seasons.",
      facts: [['Type', 'Natural satellite'], ['Diameter', '3,475 km'], ['Orbit', '27.3 days']] }],
  },
  {
    name: 'Mars', color: 0xc0532b, tex: 'mars',
    sizeR: 0.7, sizeT: 0.55, distR: 41, distT: 68,
    period: 1.88, spin: 0.48, tilt: 25.2,
    tagline: 'The red planet — rusty dust, the largest volcano in the system, and polar ice.',
    facts: [['Type', 'Terrestrial'], ['Diameter', '6,779 km'], ['Day', '24.6 hours'],
      ['Year', '687 days'], ['Moons', '2'], ['From Sun', '1.52 AU']],
  },
  {
    name: 'Jupiter', color: 0xcaa06a, tex: 'gas',
    sizeR: 3.4, sizeT: 8.0, distR: 60, distT: 234,
    period: 11.86, spin: 1.2, tilt: 3.1,
    tagline: 'King of the planets — a stormy giant whose Great Red Spot could swallow Earth.',
    facts: [['Type', 'Gas giant'], ['Diameter', '139,820 km'], ['Day', '9.9 hours'],
      ['Year', '11.9 years'], ['Moons', '95+'], ['From Sun', '5.20 AU']],
    moons: [
      { name: 'Io', color: 0xd9c56b, tex: 'rocky', sizeU: 0.10, distU: 1.5, speed: 1.8,
        tagline: 'The most volcanically active body in the Solar System.',
        facts: [['Type', 'Volcanic moon'], ['Diameter', '3,643 km']] },
      { name: 'Europa', color: 0xd8cbb0, tex: 'ice', sizeU: 0.09, distU: 1.95, speed: 1.2,
        tagline: 'An icy shell over a global ocean — a prime place to search for life.',
        facts: [['Type', 'Icy moon'], ['Diameter', '3,122 km']] },
    ],
  },
  {
    name: 'Saturn', color: 0xdcc38b, tex: 'gas',
    sizeR: 2.9, sizeT: 7.0, distR: 84, distT: 431,
    period: 29.46, spin: 1.1, tilt: 26.7,
    rings: { innerU: 1.35, outerU: 2.35, color: 0xe6d5a8 },
    tagline: 'The jewel of the system, wrapped in a dazzling sheet of icy rings.',
    facts: [['Type', 'Gas giant'], ['Diameter', '116,460 km'], ['Day', '10.7 hours'],
      ['Year', '29.5 years'], ['Moons', '146+'], ['From Sun', '9.58 AU']],
    moons: [{ name: 'Titan', color: 0xd6a24a, tex: 'ice', sizeU: 0.16, distU: 2.9, speed: 0.7,
      tagline: "Saturn's giant moon — a thick haze over methane lakes and rivers.",
      facts: [['Type', 'Hazy moon'], ['Diameter', '5,150 km']] }],
  },
  {
    name: 'Uranus', color: 0x9fe3e8, tex: 'ice',
    sizeR: 1.9, sizeT: 3.2, distR: 106, distT: 864,
    period: 84.01, spin: -0.7, tilt: 97.8,
    rings: { innerU: 1.5, outerU: 1.9, color: 0x8fb6bd, faint: true },
    tagline: 'A tilted ice giant that rolls on its side, its poles taking turns facing the Sun.',
    facts: [['Type', 'Ice giant'], ['Diameter', '50,724 km'], ['Day', '17.2 hours'],
      ['Year', '84 years'], ['Moons', '28'], ['From Sun', '19.2 AU']],
  },
  {
    name: 'Neptune', color: 0x3b62d6, tex: 'ice',
    sizeR: 1.85, sizeT: 3.1, distR: 128, distT: 1352,
    period: 164.8, spin: 0.7, tilt: 28.3,
    tagline: 'The windiest world — supersonic storms tear across a deep blue globe.',
    facts: [['Type', 'Ice giant'], ['Diameter', '49,244 km'], ['Day', '16.1 hours'],
      ['Year', '164.8 years'], ['Moons', '16'], ['From Sun', '30.1 AU']],
  },
];

/* ============================================================= *
 *  Small utilities                                              *
 * ============================================================= */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shade(hex, amt) {
  let r = (hex >> 16) & 255, g = (hex >> 8) & 255, b = hex & 255;
  if (amt >= 0) { r += (255 - r) * amt; g += (255 - g) * amt; b += (255 - b) * amt; }
  else { r *= 1 + amt; g *= 1 + amt; b *= 1 + amt; }
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* ============================================================= *
 *  Procedural canvas textures (baked once at startup)           *
 * ============================================================= */
function makeSurfaceTexture(kind, color, seed = 1) {
  const W = 1024, H = 512;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  const rnd = mulberry32(seed);

  g.fillStyle = shade(color, -0.12);
  g.fillRect(0, 0, W, H);

  const blob = (x, y, r, fill) => {
    const grd = g.createRadialGradient(x, y, 0, x, y, r);
    grd.addColorStop(0, fill); grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.beginPath(); g.arc(x, y, r, 0, TWO_PI); g.fill();
  };
  const wrapBlob = (x, y, r, fill) => {
    blob(x, y, r, fill);
    if (x < r) blob(x + W, y, r, fill);
    if (x > W - r) blob(x - W, y, r, fill);
  };

  if (kind === 'gas' || kind === 'ice' || kind === 'venus') {
    // horizontal bands with turbulence
    const bands = kind === 'ice' ? 26 : 40;
    for (let i = 0; i < bands; i++) {
      const y0 = (i / bands) * H;
      const bh = H / bands + 2;
      const amt = (Math.sin(i * 1.7) * 0.5 + (rnd() - 0.5)) * (kind === 'ice' ? 0.14 : 0.26);
      g.fillStyle = shade(color, amt);
      g.fillRect(0, y0, W, bh);
    }
    // swirl highlights + storms
    const swirls = kind === 'ice' ? 40 : 120;
    for (let i = 0; i < swirls; i++) {
      const y = rnd() * H, r = 6 + rnd() * 26;
      wrapBlob(rnd() * W, y, r, shade(color, (rnd() - 0.45) * 0.5));
    }
    if (kind === 'gas' && seed === 5) { // Jupiter's Great Red Spot
      g.save(); g.translate(W * 0.68, H * 0.62); g.scale(1.9, 1);
      blob(0, 0, 46, 'rgba(190,70,40,0.9)'); blob(0, 0, 26, 'rgba(150,45,30,0.9)');
      g.restore();
    }
  } else if (kind === 'earth') {
    g.fillStyle = '#274b86'; g.fillRect(0, 0, W, H); // ocean
    const land = ['#3f7a3a', '#4e8a3e', '#6b7f39', '#8a7a4a', '#5c8f45'];
    for (let i = 0; i < 26; i++) {
      const x = rnd() * W, y = H * 0.2 + rnd() * H * 0.6, r = 24 + rnd() * 90;
      wrapBlob(x, y, r, land[(rnd() * land.length) | 0]);
    }
    // ice caps
    g.fillStyle = 'rgba(240,246,255,0.92)';
    g.fillRect(0, 0, W, H * 0.06); g.fillRect(0, H * 0.94, W, H * 0.06);
    for (let i = 0; i < 18; i++) wrapBlob(rnd() * W, rnd() * H, 10 + rnd() * 26, 'rgba(255,255,255,0.28)'); // clouds
  } else if (kind === 'mars') {
    g.fillStyle = shade(color, -0.05); g.fillRect(0, 0, W, H);
    for (let i = 0; i < 60; i++) wrapBlob(rnd() * W, rnd() * H, 20 + rnd() * 70, shade(color, (rnd() - 0.5) * 0.4));
    g.fillStyle = 'rgba(240,240,250,0.85)';
    g.fillRect(0, 0, W, H * 0.045); g.fillRect(0, H * 0.955, W, H * 0.045);
    for (let i = 0; i < 40; i++) { // craters
      const x = rnd() * W, y = rnd() * H, r = 3 + rnd() * 12;
      wrapBlob(x, y, r, 'rgba(60,25,12,0.5)');
    }
  } else { // rocky / moon
    for (let i = 0; i < 90; i++) wrapBlob(rnd() * W, rnd() * H, 14 + rnd() * 60, shade(color, (rnd() - 0.5) * 0.35));
    const craters = kind === 'moon' ? 220 : 90;
    for (let i = 0; i < craters; i++) {
      const x = rnd() * W, y = rnd() * H, r = 2 + rnd() * 14;
      wrapBlob(x, y, r, 'rgba(0,0,0,0.35)');
      g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 1;
      g.beginPath(); g.arc(x, y, r, 0, Math.PI); g.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function makeSunTexture() {
  const S = 1024, c = document.createElement('canvas');
  c.width = S; c.height = S;
  const g = c.getContext('2d'); const rnd = mulberry32(99);
  const base = g.createRadialGradient(S / 2, S / 2, S * 0.1, S / 2, S / 2, S * 0.55);
  base.addColorStop(0, '#fff6d6'); base.addColorStop(0.5, '#ffb64a'); base.addColorStop(1, '#e5731a');
  g.fillStyle = base; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 900; i++) {
    const x = rnd() * S, y = rnd() * S, r = 4 + rnd() * 26;
    const grd = g.createRadialGradient(x, y, 0, x, y, r);
    const hot = rnd() > 0.5;
    grd.addColorStop(0, hot ? 'rgba(255,250,220,0.7)' : 'rgba(200,70,10,0.5)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.beginPath(); g.arc(x, y, r, 0, TWO_PI); g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeRingTexture(color, faint) {
  const W = 512, c = document.createElement('canvas');
  c.width = W; c.height = 8;
  const g = c.getContext('2d'); const rnd = mulberry32(7);
  for (let x = 0; x < W; x++) {
    const t = x / W;
    let a = (0.35 + 0.55 * Math.abs(Math.sin(t * 34 + Math.sin(t * 9)))) * (faint ? 0.5 : 1);
    if (t > 0.42 && t < 0.47) a *= 0.15;              // Cassini-style gap
    if (t < 0.04 || t > 0.98) a *= 0.2;
    a *= 0.7 + rnd() * 0.3;
    g.fillStyle = shade(color, (rnd() - 0.5) * 0.3);
    g.globalAlpha = Math.min(1, a);
    g.fillRect(x, 0, 1, 8);
  }
  g.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

function makeGlowTexture() {
  const S = 256, c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  grd.addColorStop(0, 'rgba(255,244,214,0.95)');
  grd.addColorStop(0.25, 'rgba(255,180,90,0.55)');
  grd.addColorStop(0.55, 'rgba(255,120,40,0.18)');
  grd.addColorStop(1, 'rgba(255,120,40,0)');
  g.fillStyle = grd; g.fillRect(0, 0, S, S);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ============================================================= *
 *  Boot                                                         *
 * ============================================================= */
const state = {
  paused: false,
  speed: 1,
  scaleTarget: 0,   // 0 = readable, 1 = true-ish
  scaleMix: 0,
  showLabels: true,
  showOrbits: true,
};

const sceneEl = document.getElementById('scene');
let renderer, labelRenderer, scene, camera, controls, composer, bloom;
let sunMesh, corona, sunLight;
const bodies = [];       // planet records
const selectables = [];  // clickable records {name, tagline, facts, color, focusObj, getRadius}
const pickMeshes = [];   // meshes for raycasting
const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster();
const HOME = new THREE.Vector3(0, 72, 205);

// camera transition + follow
const cam = {
  transition: false, mode: null, t: 0, dur: 1.15,
  fromCam: new THREE.Vector3(), fromTarget: new THREE.Vector3(),
  offset: new THREE.Vector3(), focusObj: null, following: false,
};
const tour = { active: false, index: 0, timer: 0, hold: 6.5 };

function fatal(msg) {
  const el = document.getElementById('fatal');
  document.getElementById('fatal-msg').textContent = msg;
  el.hidden = false;
  document.getElementById('loader').classList.add('hidden');
}

function init() {
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  } catch (e) {
    fatal('WebGL could not be initialised in this browser.');
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  sceneEl.appendChild(renderer.domElement);

  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.className = 'label-layer';
  sceneEl.appendChild(labelRenderer.domElement);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x03040a);

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200000);
  camera.position.copy(HOME);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 3;
  controls.maxDistance = 5000;
  controls.rotateSpeed = 0.6;
  controls.zoomSpeed = 0.9;
  controls.addEventListener('start', () => { tour.active = false; });

  buildLights();
  buildStarfield();
  buildSun();
  PLANETS.forEach((p, i) => buildPlanet(p, i + 1));

  // post-processing (bloom for the glowing Sun)
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.9, 0.55, 0.7);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  wireUI();
  window.addEventListener('resize', onResize);
  animate();
}

function buildLights() {
  sunLight = new THREE.PointLight(0xfff4e2, 3.0, 0, 0); // decay 0 → even lighting across scales
  scene.add(sunLight);
  scene.add(new THREE.AmbientLight(0x223049, 0.28));
  scene.add(new THREE.HemisphereLight(0x2a3a66, 0x0a0a12, 0.15));
}

function buildStarfield() {
  const make = (count, size, spread, tint) => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const rnd = mulberry32(size * 1000 | 0);
    const col1 = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const u = rnd() * 2 - 1, th = rnd() * TWO_PI, r = Math.sqrt(1 - u * u);
      const R = spread * (0.7 + rnd() * 0.3);
      pos[i * 3] = Math.cos(th) * r * R;
      pos[i * 3 + 1] = u * R;
      pos[i * 3 + 2] = Math.sin(th) * r * R;
      const h = tint ? (rnd() > 0.5 ? 0.58 : 0.08) : 0.6;
      col1.setHSL(h, tint ? 0.4 : 0.1, 0.6 + rnd() * 0.4);
      col[i * 3] = col1.r; col[i * 3 + 1] = col1.g; col[i * 3 + 2] = col1.b;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({ size, sizeAttenuation: false, vertexColors: true, transparent: true, depthWrite: false });
    scene.add(new THREE.Points(geo, mat));
  };
  make(6000, 1.3, 7000, false);
  make(1400, 2.4, 6500, true);
}

function buildSun() {
  const group = new THREE.Object3D();
  scene.add(group);
  sunMesh = new THREE.Mesh(
    new THREE.SphereGeometry(SUN.radius, 64, 64),
    new THREE.MeshBasicMaterial({ map: makeSunTexture() })
  );
  group.add(sunMesh);

  const glowMat = new THREE.SpriteMaterial({ map: makeGlowTexture(), color: 0xffffff, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false });
  corona = new THREE.Sprite(glowMat);
  corona.scale.setScalar(SUN.radius * 5.2);
  group.add(corona);
  const corona2 = new THREE.Sprite(glowMat.clone());
  corona2.scale.setScalar(SUN.radius * 9);
  corona2.material.opacity = 0.5;
  group.add(corona2);

  sunMesh.userData.sel = registerSelectable(SUN, group, () => SUN.radius);
  pickMeshes.push(sunMesh);
}

function buildPlanet(p, seed) {
  const pivot = new THREE.Object3D();          // orbit rotation
  scene.add(pivot);
  const group = new THREE.Object3D();          // sits at orbital distance
  pivot.add(group);
  const tiltObj = new THREE.Object3D();        // axial tilt + display scale
  tiltObj.rotation.z = deg(p.tilt);
  group.add(tiltObj);

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(1, 48, 48),
    new THREE.MeshStandardMaterial({ map: makeSurfaceTexture(p.tex, p.color, seed), roughness: 0.92, metalness: 0.0 })
  );
  tiltObj.add(mesh);

  if (p.atmosphere) {
    const atm = new THREE.Mesh(
      new THREE.SphereGeometry(1.05, 32, 32),
      new THREE.MeshBasicMaterial({ color: p.atmosphere.color, transparent: true, opacity: p.atmosphere.opacity, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    mesh.add(atm);
  }

  if (p.rings) tiltObj.add(buildRings(p.rings));

  const record = {
    data: p, pivot, group, tiltObj, mesh,
    angle: Math.random() * TWO_PI,
    orbitSpeed: TWO_PI / (EARTH_YEAR * p.period),
    spin: p.spin,
    size: p.sizeR,
    moons: [],
    label: null,
  };

  // floating label
  const el = document.createElement('div');
  el.className = 'body-label';
  el.textContent = p.name;
  el.addEventListener('click', (e) => { e.stopPropagation(); tour.active = false; selectByRecordMesh(mesh); });
  const label = new CSS2DObject(el);
  group.add(label);
  record.label = label;
  record.labelEl = el;

  // moons
  if (p.moons) {
    for (const m of p.moons) {
      const mp = new THREE.Object3D();
      tiltObj.add(mp);
      const mm = new THREE.Mesh(
        new THREE.SphereGeometry(m.sizeU, 24, 24),
        new THREE.MeshStandardMaterial({ map: makeSurfaceTexture(m.tex, m.color, seed * 13 + 3), roughness: 0.95 })
      );
      mm.position.x = m.distU;
      mp.add(mm);
      const moonRec = { data: m, pivot: mp, mesh: mm, angle: Math.random() * TWO_PI, speed: m.speed, parent: record };
      record.moons.push(moonRec);
      mm.userData.sel = registerSelectable(
        { name: m.name, color: m.color, tagline: m.tagline, facts: m.facts },
        mm, () => m.sizeU * record.size
      );
      pickMeshes.push(mm);
    }
  }

  mesh.userData.sel = registerSelectable(p, group, () => record.size);
  mesh.userData.record = record;
  pickMeshes.push(mesh);

  // orbit ring
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(p.distR - 0.06, p.distR + 0.06, 160),
    new THREE.MeshBasicMaterial({ color: 0x8fb0ff, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false })
  );
  ring.rotation.x = -Math.PI / 2;
  scene.add(ring);
  record.orbitRing = ring;
  record.orbitBaseR = p.distR;

  bodies.push(record);
}

function buildRings(cfg) {
  const geo = new THREE.RingGeometry(cfg.innerU, cfg.outerU, 128, 1);
  // radial UVs so the 1-D ring texture maps as concentric bands
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const r = v.length();
    uv.setXY(i, (r - cfg.innerU) / (cfg.outerU - cfg.innerU), 0.5);
  }
  const mat = new THREE.MeshStandardMaterial({
    map: makeRingTexture(cfg.color, cfg.faint),
    color: 0xffffff, roughness: 1, metalness: 0,
    transparent: true, side: THREE.DoubleSide, depthWrite: false,
  });
  const ring = new THREE.Mesh(geo, mat);
  ring.rotation.x = -Math.PI / 2;
  return ring;
}

function registerSelectable(info, focusObj, getRadius) {
  const rec = {
    name: info.name, color: info.color,
    tagline: info.tagline, facts: info.facts,
    focusObj, getRadius,
  };
  selectables.push(rec);
  return rec;
}

/* ============================================================= *
 *  Selection + camera focus                                     *
 * ============================================================= */
const infoEl = document.getElementById('info');
let activeSel = null;
const _tmpP = new THREE.Vector3();

function selectByRecordMesh(mesh) {
  const sel = mesh.userData.sel;
  if (sel) selectBody(sel);
}

function selectBody(sel) {
  activeSel = sel;
  document.getElementById('info-name').textContent = sel.name;
  document.getElementById('info-tagline').textContent = sel.tagline || '';
  const sw = document.getElementById('info-swatch');
  sw.style.background = '#' + (sel.color ?? 0x888888).toString(16).padStart(6, '0');
  sw.style.color = sw.style.background;
  const dl = document.getElementById('info-facts');
  dl.innerHTML = '';
  (sel.facts || []).forEach(([k, val]) => {
    const dt = document.createElement('dt'); dt.textContent = k;
    const dd = document.createElement('dd'); dd.textContent = val;
    dl.append(dt, dd);
  });
  infoEl.hidden = false;

  // start smooth fly-to
  cam.focusObj = sel.focusObj;
  sel.focusObj.getWorldPosition(_tmpP);
  cam.offset.copy(offsetForRadius(sel.getRadius(), _tmpP));
  cam.fromCam.copy(camera.position);
  cam.fromTarget.copy(controls.target);
  cam.transition = true; cam.mode = 'focus'; cam.t = 0; cam.following = false;
  controls.enabled = false;

  // highlight labels
  bodies.forEach((b) => b.labelEl.classList.toggle('dim', b.mesh.userData.sel !== sel && !!activeSel));
}

function offsetForRadius(r, worldPos) {
  // Bias the camera toward the sunlit side (Sun sits at the origin) so a
  // focused body reads as lit, while keeping some of the current angle.
  const toSun = worldPos && worldPos.lengthSq() > 1e-6
    ? worldPos.clone().multiplyScalar(-1).normalize()
    : new THREE.Vector3(0, 0, 1);
  const cur = new THREE.Vector3().subVectors(camera.position, controls.target);
  if (cur.lengthSq() < 1e-6) cur.set(0, 0, 1);
  cur.normalize();
  const dir = toSun.multiplyScalar(0.72).add(cur.multiplyScalar(0.28));
  dir.y += 0.32;
  if (dir.lengthSq() < 1e-6) dir.set(0, 0.4, 1);
  dir.normalize();
  const dist = Math.max(r * 3.4 + 2.5, 4);
  return dir.multiplyScalar(dist);
}

function deselect() {
  activeSel = null;
  infoEl.hidden = true;
  cam.following = false; cam.focusObj = null;
  bodies.forEach((b) => b.labelEl.classList.remove('dim'));
}

function flyHome() {
  cam.fromCam.copy(camera.position);
  cam.fromTarget.copy(controls.target);
  cam.transition = true; cam.mode = 'home'; cam.t = 0; cam.following = false;
  cam.focusObj = null;
  controls.enabled = false;
  deselect();
}

/* ============================================================= *
 *  Interaction — click to pick (ignores drags)                  *
 * ============================================================= */
const pointer = new THREE.Vector2();
let downXY = null;

function attachPointer() {
  const dom = renderer.domElement;
  dom.addEventListener('pointerdown', (e) => { downXY = { x: e.clientX, y: e.clientY }; });
  dom.addEventListener('pointerup', (e) => {
    if (!downXY) return;
    const moved = Math.hypot(e.clientX - downXY.x, e.clientY - downXY.y);
    downXY = null;
    if (moved > 6) return; // it was a drag, not a click
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(pickMeshes, false);
    if (hits.length) { tour.active = false; selectByRecordMesh(hits[0].object); }
    else deselect();
  });
  dom.addEventListener('pointermove', (e) => {
    if (downXY) return;
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    dom.style.cursor = raycaster.intersectObjects(pickMeshes, false).length ? 'pointer' : 'grab';
  });
}

/* ============================================================= *
 *  UI wiring                                                    *
 * ============================================================= */
function setSpeedReadout() {
  const el = document.getElementById('speed-readout');
  el.textContent = state.paused ? 'Paused' : state.speed.toFixed(state.speed < 1 ? 2 : 1) + '×';
}
function togglePause(force) {
  state.paused = force === undefined ? !state.paused : force;
  document.getElementById('btn-pause').textContent = state.paused ? '▶ Play' : '❚❚ Pause';
  setSpeedReadout();
}
function changeSpeed(mult) {
  if (state.paused) togglePause(false);
  state.speed = Math.min(64, Math.max(0.05, state.speed * mult));
  setSpeedReadout();
}
function startTour(startIndex = 0) {
  tour.active = true; tour.index = ((startIndex % bodies.length) + bodies.length) % bodies.length;
  tour.timer = 0;
  selectBody(bodies[tour.index].mesh.userData.sel);
}

function wireUI() {
  attachPointer();
  document.getElementById('btn-pause').addEventListener('click', () => togglePause());
  document.getElementById('btn-faster').addEventListener('click', () => changeSpeed(1.8));
  document.getElementById('btn-slower').addEventListener('click', () => changeSpeed(1 / 1.8));
  document.getElementById('btn-reset').addEventListener('click', flyHome);
  document.getElementById('btn-tour').addEventListener('click', () => startTour(0));
  document.getElementById('info-close').addEventListener('click', deselect);
  document.getElementById('info-tour').addEventListener('click', () => {
    const idx = bodies.findIndex((b) => b.mesh.userData.sel === activeSel);
    startTour(idx < 0 ? 0 : idx);
  });

  const help = document.getElementById('help');
  document.getElementById('help-btn').addEventListener('click', () => (help.hidden = false));
  document.getElementById('help-close').addEventListener('click', () => (help.hidden = true));
  help.addEventListener('click', (e) => { if (e.target === help) help.hidden = true; });

  document.getElementById('tg-labels').addEventListener('change', (e) => { state.showLabels = e.target.checked; });
  document.getElementById('tg-orbits').addEventListener('change', (e) => {
    state.showOrbits = e.target.checked;
    bodies.forEach((b) => (b.orbitRing.visible = state.showOrbits));
  });
  document.getElementById('tg-scale').addEventListener('change', (e) => { state.scaleTarget = e.target.checked ? 1 : 0; });

  window.addEventListener('keydown', (e) => {
    if (e.key === ' ') { e.preventDefault(); togglePause(); }
    else if (e.key === 'ArrowRight') changeSpeed(1.8);
    else if (e.key === 'ArrowLeft') changeSpeed(1 / 1.8);
    else if (e.key === 'r' || e.key === 'R') flyHome();
    else if (e.key === 't' || e.key === 'T') startTour(0);
    else if (e.key === 'Escape') { if (!help.hidden) help.hidden = true; else deselect(); }
  });
  setSpeedReadout();
}

/* ============================================================= *
 *  Resize                                                       *
 * ============================================================= */
function onResize() {
  const w = window.innerWidth, h = window.innerHeight;
  camera.aspect = w / h; camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  composer.setSize(w, h);
  labelRenderer.setSize(w, h);
}

/* ============================================================= *
 *  Animation loop                                               *
 * ============================================================= */
let booted = false;
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const simDt = state.paused ? 0 : dt * state.speed;

  // orbits + spins
  for (const b of bodies) {
    b.angle += b.orbitSpeed * simDt;
    b.pivot.rotation.y = b.angle;
    b.mesh.rotation.y += b.spin * simDt;
    for (const m of b.moons) {
      m.angle += m.speed * simDt;
      m.pivot.rotation.y = m.angle;
    }
  }
  sunMesh.rotation.y += 0.02 * simDt;

  // scale lerp (readable <-> true-ish)
  if (Math.abs(state.scaleMix - state.scaleTarget) > 1e-4) {
    state.scaleMix += (state.scaleTarget - state.scaleMix) * Math.min(1, dt * 2.5);
  } else state.scaleMix = state.scaleTarget;
  const mix = state.scaleMix;
  for (const b of bodies) {
    const p = b.data;
    b.size = p.sizeR + (p.sizeT - p.sizeR) * mix;
    b.tiltObj.scale.setScalar(b.size);
    b.group.position.x = p.distR + (p.distT - p.distR) * mix;
    b.orbitRing.scale.setScalar(b.group.position.x / b.orbitBaseR);
    b.label.position.set(0, b.size * 1.45 + 0.6, 0);
    b.labelEl.style.opacity = state.showLabels ? '' : '0';
    b.labelEl.style.visibility = state.showLabels ? 'visible' : 'hidden';
  }

  scene.updateMatrixWorld(true);

  // guided tour
  if (tour.active) {
    tour.timer += dt;
    if (tour.timer >= tour.hold) {
      tour.timer = 0;
      tour.index = (tour.index + 1) % bodies.length;
      selectBody(bodies[tour.index].mesh.userData.sel);
    }
  }

  updateCamera(dt);
  controls.update();

  // corona shimmer
  const pulse = 1 + Math.sin(clock.elapsedTime * 1.4) * 0.03;
  corona.scale.setScalar(SUN.radius * 5.2 * pulse);

  composer.render();
  labelRenderer.render(scene, camera);

  if (!booted) {
    booted = true;
    document.getElementById('loader').classList.add('hidden');
  }
}

const _wp = new THREE.Vector3();
function updateCamera(dt) {
  if (cam.transition) {
    cam.t += dt / cam.dur;
    const k = easeInOut(Math.min(cam.t, 1));
    if (cam.mode === 'focus') {
      cam.focusObj.getWorldPosition(_wp);
      controls.target.lerpVectors(cam.fromTarget, _wp, k);
      camera.position.lerpVectors(cam.fromCam, _wp.clone().add(cam.offset), k);
    } else { // home
      controls.target.lerpVectors(cam.fromTarget, new THREE.Vector3(0, 0, 0), k);
      camera.position.lerpVectors(cam.fromCam, HOME, k);
    }
    if (cam.t >= 1) {
      cam.transition = false;
      controls.enabled = true;
      cam.following = cam.mode === 'focus';
    }
  } else if (cam.following && cam.focusObj) {
    cam.focusObj.getWorldPosition(_wp);
    const delta = _wp.sub(controls.target);
    controls.target.add(delta);
    camera.position.add(delta);
  }
}

init();
