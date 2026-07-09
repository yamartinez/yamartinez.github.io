import * as THREE from "three";

/* ============================================================
   Helios — Interactive 3D Solar System
   ============================================================ */

const canvas = document.getElementById("scene");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x04060f);
scene.fog = new THREE.FogExp2(0x04060f, 0.0016);

const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 4000);

/* ------------------------------------------------------------
   Planet data — stylized, legibility over realism
   ------------------------------------------------------------ */
const SUN_RADIUS = 7;

const PLANETS = [
  {
    name: "Mercury",
    type: "Terrestrial Planet",
    radius: 1.0,
    distance: 16,
    orbitSpeed: 1.6,
    spin: 0.6,
    tilt: 0.03,
    colors: ["#8c8378", "#5f584f", "#b3a99b"],
    rough: 0.95,
    desc: "The swiftest planet — a scorched, cratered world racing around the Sun beneath a colorless sky.",
    facts: { Diameter: "4,879 km", "Orbit": "88 days", Day: "1,408 hrs", Moons: "0" },
  },
  {
    name: "Venus",
    type: "Terrestrial Planet",
    radius: 1.55,
    distance: 23,
    orbitSpeed: 1.17,
    spin: -0.15,
    tilt: 0.05,
    colors: ["#e6c07a", "#c98f4d", "#f3dca0"],
    rough: 0.8,
    desc: "Veiled in luminous clouds, Venus hides a volcanic surface beneath the hottest atmosphere of any planet.",
    facts: { Diameter: "12,104 km", "Orbit": "225 days", Day: "5,832 hrs", Moons: "0" },
  },
  {
    name: "Earth",
    type: "Terrestrial Planet",
    radius: 1.7,
    distance: 32,
    orbitSpeed: 1.0,
    spin: 1.4,
    tilt: 0.41,
    colors: ["#2f6fb0", "#3f8f5c", "#dfeaf5"],
    rough: 0.7,
    ocean: true,
    desc: "A blue ocean world wrapped in a thin breathable atmosphere — the only place known to hold life.",
    facts: { Diameter: "12,742 km", "Orbit": "365 days", Day: "24 hrs", Moons: "1" },
    moons: [{ radius: 0.45, distance: 3.4, speed: 3.2, color: "#c9c6bf" }],
  },
  {
    name: "Mars",
    type: "Terrestrial Planet",
    radius: 1.25,
    distance: 41,
    orbitSpeed: 0.8,
    spin: 1.35,
    tilt: 0.44,
    colors: ["#b5532f", "#7d3a24", "#d98a5f"],
    rough: 0.9,
    desc: "The rust-red desert world, marked by the largest volcano and deepest canyon in the solar system.",
    facts: { Diameter: "6,779 km", "Orbit": "687 days", Day: "24.6 hrs", Moons: "2" },
    moons: [
      { radius: 0.22, distance: 2.4, speed: 4.5, color: "#8a8078" },
      { radius: 0.16, distance: 3.2, speed: 3.4, color: "#736a62" },
    ],
  },
  {
    name: "Jupiter",
    type: "Gas Giant",
    radius: 4.0,
    distance: 58,
    orbitSpeed: 0.43,
    spin: 2.4,
    tilt: 0.05,
    colors: ["#d8b98c", "#a9784e", "#efe0c6"],
    banded: true,
    rough: 0.6,
    desc: "The giant of the system — a swirling storm-world wide enough to swallow every other planet whole.",
    facts: { Diameter: "139,820 km", "Orbit": "12 years", Day: "9.9 hrs", Moons: "95" },
    moons: [
      { radius: 0.4, distance: 6.5, speed: 2.6, color: "#e8dcae" },
      { radius: 0.34, distance: 8.2, speed: 2.0, color: "#b9a17c" },
    ],
  },
  {
    name: "Saturn",
    type: "Gas Giant",
    radius: 3.4,
    distance: 78,
    orbitSpeed: 0.32,
    spin: 2.2,
    tilt: 0.47,
    colors: ["#e4cf9e", "#c2a068", "#f2e6c4"],
    banded: true,
    rough: 0.6,
    rings: { inner: 4.4, outer: 7.2, color: "#d9c9a3" },
    desc: "The jewel of the system, encircled by a dazzling halo of ice and rock spanning thousands of kilometers.",
    facts: { Diameter: "116,460 km", "Orbit": "29 years", Day: "10.7 hrs", Moons: "146" },
    moons: [{ radius: 0.42, distance: 9.0, speed: 1.8, color: "#d8cbb0" }],
  },
  {
    name: "Uranus",
    type: "Ice Giant",
    radius: 2.5,
    distance: 96,
    orbitSpeed: 0.23,
    spin: -1.4,
    tilt: 1.71,
    colors: ["#a6e0e4", "#77bcc4", "#cdf2f4"],
    rough: 0.5,
    rings: { inner: 3.2, outer: 4.2, color: "#9fd3d8", thin: true },
    desc: "A pale cyan ice giant tipped almost entirely on its side, rolling around the Sun like a wheel.",
    facts: { Diameter: "50,724 km", "Orbit": "84 years", Day: "17 hrs", Moons: "28" },
  },
  {
    name: "Neptune",
    type: "Ice Giant",
    radius: 2.4,
    distance: 112,
    orbitSpeed: 0.18,
    spin: 1.5,
    tilt: 0.49,
    colors: ["#3b63c9", "#2a458f", "#6f93e8"],
    rough: 0.5,
    desc: "The deep-blue outermost giant, whipped by the fastest winds ever recorded on any planet.",
    facts: { Diameter: "49,244 km", "Orbit": "165 years", Day: "16 hrs", Moons: "16" },
    moons: [{ radius: 0.36, distance: 5.2, speed: 2.2, color: "#b7c4d6" }],
  },
];

/* ------------------------------------------------------------
   Procedural textures (canvas-based)
   ------------------------------------------------------------ */
function makePlanetTexture(cfg) {
  const size = 512;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size / 2;
  const ctx = c.getContext("2d");
  const [base, dark, light] = cfg.colors;

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, c.width, c.height);

  if (cfg.banded) {
    // horizontal cloud bands
    const bands = 22;
    for (let i = 0; i < bands; i++) {
      const y = (i / bands) * c.height;
      const h = c.height / bands + 2;
      const t = Math.abs(Math.sin(i * 1.7)) ;
      ctx.fillStyle = mix(dark, light, t * 0.9);
      ctx.globalAlpha = 0.55;
      ctx.fillRect(0, y, c.width, h);
    }
    ctx.globalAlpha = 1;
    // wavy detail
    for (let i = 0; i < 900; i++) {
      const x = Math.random() * c.width;
      const y = Math.random() * c.height;
      ctx.fillStyle = Math.random() > 0.5 ? light : dark;
      ctx.globalAlpha = 0.06;
      ctx.beginPath();
      ctx.ellipse(x, y, Math.random() * 26 + 6, Math.random() * 3 + 1, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  } else if (cfg.ocean) {
    // continents on ocean
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * c.width;
      const y = Math.random() * c.height;
      const r = Math.random() * 60 + 20;
      ctx.fillStyle = light; // land
      ctx.globalAlpha = 0.85;
      blob(ctx, x, y, r, dark);
    }
    ctx.globalAlpha = 1;
    // polar ice
    ctx.fillStyle = "#eef6ff";
    ctx.globalAlpha = 0.8;
    ctx.fillRect(0, 0, c.width, 14);
    ctx.fillRect(0, c.height - 14, c.width, 14);
    ctx.globalAlpha = 1;
  } else {
    // rocky speckle + craters
    for (let i = 0; i < 2600; i++) {
      const x = Math.random() * c.width;
      const y = Math.random() * c.height;
      ctx.fillStyle = Math.random() > 0.5 ? light : dark;
      ctx.globalAlpha = Math.random() * 0.14;
      ctx.fillRect(x, y, 2, 2);
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < 26; i++) {
      const x = Math.random() * c.width;
      const y = Math.random() * c.height;
      const r = Math.random() * 12 + 3;
      blob(ctx, x, y, r, dark);
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}

function blob(ctx, x, y, r, color) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function mix(a, b, t) {
  const ca = hex(a);
  const cb = hex(b);
  const r = Math.round(ca[0] + (cb[0] - ca[0]) * t);
  const g = Math.round(ca[1] + (cb[1] - ca[1]) * t);
  const bl = Math.round(ca[2] + (cb[2] - ca[2]) * t);
  return `rgb(${r},${g},${bl})`;
}
function hex(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function makeRingTexture(color, thin) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 8;
  const ctx = c.getContext("2d");
  for (let x = 0; x < c.width; x++) {
    const t = x / c.width;
    const gap = thin ? 0 : Math.sin(t * 40) * 0.5 + 0.5;
    const a = (0.35 + Math.random() * 0.4) * (thin ? 0.7 : gap * 0.7 + 0.3);
    ctx.fillStyle = color;
    ctx.globalAlpha = a;
    ctx.fillRect(x, 0, 1, c.height);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ------------------------------------------------------------
   Sun
   ------------------------------------------------------------ */
const sunGroup = new THREE.Group();
scene.add(sunGroup);

const sunTex = (() => {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#ff9a1f";
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillStyle = Math.random() > 0.5 ? "#ffd27a" : "#ff6a00";
    ctx.globalAlpha = Math.random() * 0.5;
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 6 + 1, 0, Math.PI * 2);
    ctx.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
})();

const sunMesh = new THREE.Mesh(
  new THREE.SphereGeometry(SUN_RADIUS, 64, 64),
  new THREE.MeshBasicMaterial({ map: sunTex, color: 0xffffff })
);
sunMesh.name = "Sun";
sunGroup.add(sunMesh);

// Glow sprite
const glowTex = (() => {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(255,220,150,0.9)");
  g.addColorStop(0.25, "rgba(255,170,60,0.55)");
  g.addColorStop(0.6, "rgba(255,120,20,0.18)");
  g.addColorStop(1, "rgba(255,120,20,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
})();
const glow = new THREE.Sprite(
  new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false })
);
glow.scale.set(SUN_RADIUS * 6, SUN_RADIUS * 6, 1);
sunGroup.add(glow);

// Lighting
const sunLight = new THREE.PointLight(0xfff2d6, 4, 0, 1.4);
sunLight.position.set(0, 0, 0);
sunGroup.add(sunLight);
scene.add(new THREE.AmbientLight(0x2a3350, 0.6));

/* ------------------------------------------------------------
   Planets + orbits
   ------------------------------------------------------------ */
const bodies = []; // selectable meshes
const planetObjs = [];
const orbitLines = [];

const orbitGroup = new THREE.Group();
scene.add(orbitGroup);

PLANETS.forEach((cfg) => {
  // Orbit pivot at origin
  const pivot = new THREE.Group();
  pivot.rotation.y = Math.random() * Math.PI * 2;
  sunGroup.add(pivot);

  // planet group offset from sun
  const holder = new THREE.Group();
  holder.position.x = cfg.distance;
  pivot.add(holder);

  // tilted spinning mesh
  const spinner = new THREE.Group();
  spinner.rotation.z = cfg.tilt;
  holder.add(spinner);

  const mat = new THREE.MeshStandardMaterial({
    map: makePlanetTexture(cfg),
    roughness: cfg.rough ?? 0.8,
    metalness: 0.05,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(cfg.radius, 48, 48), mat);
  mesh.name = cfg.name;
  mesh.userData.cfg = cfg;
  spinner.add(mesh);
  bodies.push(mesh);

  // rings
  if (cfg.rings) {
    const ringGeo = new THREE.RingGeometry(cfg.rings.inner, cfg.rings.outer, 96);
    // fix UVs so texture runs radially
    const pos = ringGeo.attributes.position;
    const uv = ringGeo.attributes.uv;
    const v3 = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v3.fromBufferAttribute(pos, i);
      const r = v3.length();
      const t = (r - cfg.rings.inner) / (cfg.rings.outer - cfg.rings.inner);
      uv.setXY(i, t, 0.5);
    }
    const ringMat = new THREE.MeshBasicMaterial({
      map: makeRingTexture(cfg.rings.color, cfg.rings.thin),
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    spinner.add(ring);
  }

  // moons
  const moonPivots = [];
  if (cfg.moons) {
    cfg.moons.forEach((m) => {
      const mp = new THREE.Group();
      mp.rotation.y = Math.random() * Math.PI * 2;
      holder.add(mp);
      const moon = new THREE.Mesh(
        new THREE.SphereGeometry(m.radius, 24, 24),
        new THREE.MeshStandardMaterial({ color: m.color, roughness: 0.95 })
      );
      moon.position.x = m.distance;
      mp.add(moon);
      moonPivots.push({ pivot: mp, speed: m.speed });
    });
  }

  // orbit path
  const curve = new THREE.EllipseCurve(0, 0, cfg.distance, cfg.distance, 0, Math.PI * 2);
  const pts = curve.getPoints(160).map((p) => new THREE.Vector3(p.x, 0, p.y));
  const orbitGeo = new THREE.BufferGeometry().setFromPoints(pts);
  const orbitMat = new THREE.LineBasicMaterial({
    color: 0x6ea8ff,
    transparent: true,
    opacity: 0.16,
  });
  const orbitLine = new THREE.LineLoop(orbitGeo, orbitMat);
  orbitGroup.add(orbitLine);
  orbitLines.push(orbitLine);

  planetObjs.push({ cfg, pivot, holder, spinner, mesh, moonPivots });
});

/* ------------------------------------------------------------
   Starfield
   ------------------------------------------------------------ */
function makeStars(count, radius, size, color) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = radius * (0.6 + Math.random() * 0.4);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i * 3 + 2] = r * Math.cos(phi);
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color,
    size,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });
  return new THREE.Points(geo, mat);
}
scene.add(makeStars(2600, 900, 1.6, 0xffffff));
scene.add(makeStars(900, 700, 2.6, 0x8fb8ff));
scene.add(makeStars(500, 600, 3.2, 0xffd9a0));

/* ------------------------------------------------------------
   Custom orbit / zoom / pan camera controls
   ------------------------------------------------------------ */
const controls = {
  target: new THREE.Vector3(0, 0, 0),
  theta: 0.6, // azimuth
  phi: 1.1, // polar
  radius: 150,
  minRadius: 12,
  maxRadius: 700,
  // smoothed
  cur: { theta: 0.6, phi: 1.1, radius: 150, target: new THREE.Vector3(0, 0, 0) },
};

function updateCamera() {
  const c = controls.cur;
  c.theta += (controls.theta - c.theta) * 0.12;
  c.phi += (controls.phi - c.phi) * 0.12;
  c.radius += (controls.radius - c.radius) * 0.1;
  c.target.lerp(controls.target, 0.12);

  const sinPhi = Math.sin(c.phi);
  camera.position.set(
    c.target.x + c.radius * sinPhi * Math.sin(c.theta),
    c.target.y + c.radius * Math.cos(c.phi),
    c.target.z + c.radius * sinPhi * Math.cos(c.theta)
  );
  camera.lookAt(c.target);
}

// pointer input
let dragging = false;
let lastX = 0;
let lastY = 0;
let panning = false;

canvas.addEventListener("pointerdown", (e) => {
  dragging = true;
  panning = e.button === 2 || e.shiftKey;
  lastX = e.clientX;
  lastY = e.clientY;
  canvas.setPointerCapture(e.pointerId);
  movedDist = 0;
});
canvas.addEventListener("contextmenu", (e) => e.preventDefault());

canvas.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  lastX = e.clientX;
  lastY = e.clientY;
  movedDist += Math.abs(dx) + Math.abs(dy);

  if (panning) {
    const panSpeed = controls.cur.radius * 0.0015;
    const right = new THREE.Vector3();
    const up = new THREE.Vector3();
    camera.matrix.extractBasis(right, up, new THREE.Vector3());
    controls.target.addScaledVector(right, -dx * panSpeed);
    controls.target.addScaledVector(up, dy * panSpeed);
    stopFollow();
  } else {
    controls.theta -= dx * 0.005;
    controls.phi -= dy * 0.005;
    controls.phi = Math.max(0.12, Math.min(Math.PI - 0.12, controls.phi));
  }
});

canvas.addEventListener("pointerup", (e) => {
  dragging = false;
  canvas.releasePointerCapture?.(e.pointerId);
});

canvas.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    controls.radius *= 1 + Math.sign(e.deltaY) * 0.08;
    controls.radius = Math.max(controls.minRadius, Math.min(controls.maxRadius, controls.radius));
  },
  { passive: false }
);

// pinch zoom
let pinchDist = 0;
canvas.addEventListener(
  "touchmove",
  (e) => {
    if (e.touches.length === 2) {
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (pinchDist) {
        controls.radius *= 1 - (d - pinchDist) * 0.006;
        controls.radius = Math.max(controls.minRadius, Math.min(controls.maxRadius, controls.radius));
      }
      pinchDist = d;
    }
  },
  { passive: true }
);
canvas.addEventListener("touchend", () => (pinchDist = 0));

/* ------------------------------------------------------------
   Selection + focus
   ------------------------------------------------------------ */
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let movedDist = 0;
let selected = null;
let followTarget = null;

const selectable = [...bodies, sunMesh];

canvas.addEventListener("pointerup", (e) => {
  if (movedDist > 6) return; // was a drag, not a click
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(selectable, false);
  if (hits.length) {
    focusBody(hits[0].object);
  }
});

function focusBody(mesh) {
  selected = mesh;
  const cfg = mesh.userData.cfg;
  if (mesh === sunMesh) {
    showInfo({
      name: "The Sun",
      type: "G-type Star",
      desc: "A vast sphere of glowing plasma at the heart of the system, holding every planet in its gravitational embrace.",
      facts: { Diameter: "1,391,000 km", Mass: "333,000 ⊕", "Surface": "5,500 °C", Age: "4.6 Byr" },
    });
    controls.target.set(0, 0, 0);
    controls.radius = SUN_RADIUS * 6;
    followTarget = { obj: sunMesh, radius: SUN_RADIUS * 6 };
  } else {
    showInfo(cfg);
    const wp = new THREE.Vector3();
    mesh.getWorldPosition(wp);
    controls.target.copy(wp);
    controls.radius = cfg.radius * 6 + 6;
    followTarget = { obj: mesh, radius: cfg.radius * 6 + 6 };
  }
  followBtn.classList.add("active");
  followBtn.textContent = "Following orbit";
}

function stopFollow() {
  followTarget = null;
  followBtn.classList.remove("active");
  followBtn.textContent = "Follow orbit";
}

/* ------------------------------------------------------------
   Info panel
   ------------------------------------------------------------ */
const infoPanel = document.getElementById("infoPanel");
const infoName = document.getElementById("infoName");
const infoType = document.getElementById("infoType");
const infoDesc = document.getElementById("infoDesc");
const infoStats = document.getElementById("infoStats");
const infoSwatch = document.getElementById("infoSwatch");
const infoClose = document.getElementById("infoClose");
const followBtn = document.getElementById("followBtn");

function showInfo(cfg) {
  infoName.textContent = cfg.name;
  infoType.textContent = cfg.type;
  infoDesc.textContent = cfg.desc;
  infoSwatch.style.background = cfg.colors
    ? `radial-gradient(circle at 32% 28%, ${cfg.colors[2]}, ${cfg.colors[0]} 55%, ${cfg.colors[1]})`
    : "radial-gradient(circle at 32% 28%, #fff3c4, #ffab2e 55%, #ff6a00)";
  infoStats.innerHTML = "";
  Object.entries(cfg.facts).forEach(([k, v]) => {
    const wrap = document.createElement("div");
    wrap.className = "stat";
    wrap.innerHTML = `<dt>${k}</dt><dd>${v}</dd>`;
    infoStats.appendChild(wrap);
  });
  infoPanel.classList.add("open");
  infoPanel.setAttribute("aria-hidden", "false");
}

infoClose.addEventListener("click", () => {
  infoPanel.classList.remove("open");
  infoPanel.setAttribute("aria-hidden", "true");
  selected = null;
  stopFollow();
});

followBtn.addEventListener("click", () => {
  if (followTarget) {
    stopFollow();
  } else if (selected) {
    focusBody(selected);
  }
});

/* ------------------------------------------------------------
   Floating labels
   ------------------------------------------------------------ */
const labelLayer = document.getElementById("labelLayer");
const labels = [];
PLANETS.forEach((cfg, i) => {
  const el = document.createElement("div");
  el.className = "planet-label";
  el.textContent = cfg.name;
  el.style.color = cfg.colors[2];
  el.addEventListener("click", () => focusBody(bodies[i]));
  labelLayer.appendChild(el);
  labels.push({ el, mesh: bodies[i] });
});

function updateLabels() {
  const v = new THREE.Vector3();
  const camPos = camera.position;
  labels.forEach(({ el, mesh }) => {
    mesh.getWorldPosition(v);
    const dist = camPos.distanceTo(v);
    v.project(camera);
    const behind = v.z > 1;
    if (behind) {
      el.style.opacity = "0";
      return;
    }
    const x = (v.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-v.y * 0.5 + 0.5) * window.innerHeight;
    el.style.transform = `translate(-50%,-50%) translate(${x}px, ${y - 26}px)`;
    el.style.opacity = String(Math.max(0.15, Math.min(1, 1 - (dist - 60) / 260)));
  });
}

/* ------------------------------------------------------------
   Time controls
   ------------------------------------------------------------ */
let timeScale = 1;
let paused = false;
let simTime = 0;

const controlsEl = document.querySelector(".controls");
const playPause = document.getElementById("playPause");
const simDayEl = document.getElementById("simDay");

playPause.addEventListener("click", () => {
  paused = !paused;
  controlsEl.classList.toggle("paused", paused);
});

document.querySelectorAll(".speed-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".speed-btn").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    timeScale = parseFloat(btn.dataset.speed);
  });
});

// Toggles
const toggleOrbits = document.getElementById("toggleOrbits");
const toggleLabels = document.getElementById("toggleLabels");
const resetView = document.getElementById("resetView");

toggleOrbits.addEventListener("click", () => {
  const on = toggleOrbits.classList.toggle("is-active");
  orbitGroup.visible = on;
});
toggleLabels.addEventListener("click", () => {
  const on = toggleLabels.classList.toggle("is-active");
  labelLayer.classList.toggle("hidden", !on);
});

function resetCamera() {
  controls.target.set(0, 0, 0);
  controls.theta = 0.6;
  controls.phi = 1.1;
  controls.radius = 150;
  stopFollow();
  selected = null;
  infoPanel.classList.remove("open");
  infoPanel.setAttribute("aria-hidden", "true");
}
resetView.addEventListener("click", resetCamera);
document.getElementById("brand").addEventListener("click", resetCamera);

// Keyboard
window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    playPause.click();
  } else if (e.key === "r" || e.key === "R") {
    resetCamera();
  } else if (e.key === "ArrowUp") {
    timeScale = Math.min(8, timeScale * 2);
    syncSpeedButtons();
  } else if (e.key === "ArrowDown") {
    timeScale = Math.max(0.25, timeScale / 2);
    syncSpeedButtons();
  }
});
function syncSpeedButtons() {
  document.querySelectorAll(".speed-btn").forEach((b) => {
    b.classList.toggle("is-active", parseFloat(b.dataset.speed) === timeScale);
  });
}

/* ------------------------------------------------------------
   Resize
   ------------------------------------------------------------ */
function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
resize();

/* ------------------------------------------------------------
   Animation loop
   ------------------------------------------------------------ */
const clock = new THREE.Clock();
const hintEl = document.querySelector(".hint");
let hintFaded = false;

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const step = paused ? 0 : dt * timeScale;
  simTime += step;

  // sun shimmer
  sunMesh.rotation.y += dt * 0.05;
  glow.material.rotation += dt * 0.02;

  planetObjs.forEach((p) => {
    p.pivot.rotation.y += step * p.cfg.orbitSpeed * 0.25;
    p.spinner.rotation.y += step * p.cfg.spin * 2 + dt * 0.0001;
    p.moonPivots.forEach((m) => (m.pivot.rotation.y += step * m.speed * 0.5));
  });

  // follow selected body
  if (followTarget) {
    const wp = new THREE.Vector3();
    followTarget.obj.getWorldPosition(wp);
    controls.target.copy(wp);
  }

  updateCamera();
  updateLabels();
  renderer.render(scene, camera);

  if (!hintFaded && simTime > 6) {
    hintFaded = true;
    hintEl.classList.add("faded");
  }
}

/* ------------------------------------------------------------
   Boot
   ------------------------------------------------------------ */
const loader = document.getElementById("loader");
requestAnimationFrame(() => {
  animate();
  setTimeout(() => loader.classList.add("hidden"), 500);
});
