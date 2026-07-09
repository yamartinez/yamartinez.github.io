import * as THREE from "../../roadtrip2/webgl/vendor/three.module.min.js";

const canvas = document.querySelector("#space");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x02040a);
scene.fog = new THREE.FogExp2(0x03050c, 0.0018);

const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 1800);
camera.position.set(20, 46, 105);

const planets = [
  { name: "Mercury", type: "Terrestrial planet", radius: 1.1, distance: 13, speed: 1.61, rotation: .8, color: "#a9a29a", accent: "#625e58", diameter: "4,879 KM", orbit: "88 DAYS", moons: "0", description: "The smallest world and the swiftest traveler, racing around the Sun beneath a charcoal, cratered sky." },
  { name: "Venus", type: "Terrestrial planet", radius: 1.65, distance: 18, speed: 1.18, rotation: -.18, color: "#d6a56d", accent: "#8f603f", diameter: "12,104 KM", orbit: "225 DAYS", moons: "0", description: "Wrapped in luminous clouds, Venus hides a volcanic landscape beneath the hottest atmosphere of any planet." },
  { name: "Earth", type: "Terrestrial planet", radius: 1.8, distance: 24, speed: 1, rotation: 1.25, color: "#397eb4", accent: "#6c9c64", diameter: "12,742 KM", orbit: "365 DAYS", moons: "1", description: "An ocean world suspended in a thin blue atmosphere — the only place known to hold life." },
  { name: "Mars", type: "Terrestrial planet", radius: 1.35, distance: 31, speed: .81, rotation: 1.18, color: "#b95f3f", accent: "#6f3029", diameter: "6,779 KM", orbit: "687 DAYS", moons: "2", description: "A cold desert of iron dust, immense volcanoes, and canyons carved by an ancient, wetter past." },
  { name: "Jupiter", type: "Gas giant", radius: 4.8, distance: 43, speed: .44, rotation: 2.5, color: "#c59d7b", accent: "#755244", diameter: "139,820 KM", orbit: "11.9 YEARS", moons: "95", description: "The system's giant guardian: a turbulent world of banded clouds and storms larger than Earth." },
  { name: "Saturn", type: "Gas giant", radius: 4.1, distance: 57, speed: .32, rotation: 2.2, color: "#d8c08c", accent: "#8d7953", diameter: "116,460 KM", orbit: "29.5 YEARS", moons: "146", description: "A pale gas giant encircled by countless shards of ice, arranged into the solar system's grandest rings." },
  { name: "Uranus", type: "Ice giant", radius: 2.8, distance: 70, speed: .23, rotation: -1.45, color: "#8cc9cf", accent: "#4c8c98", diameter: "50,724 KM", orbit: "84 YEARS", moons: "28", description: "A calm cyan world rolling sideways through its long orbit, tipped by a collision in the distant past." },
  { name: "Neptune", type: "Ice giant", radius: 2.7, distance: 82, speed: .18, rotation: 1.5, color: "#426ec4", accent: "#233f83", diameter: "49,244 KM", orbit: "164.8 YEARS", moons: "16", description: "The deep blue frontier, swept by the fastest winds measured anywhere in the solar system." }
];

function makeTexture(data, index) {
  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = 256;
  textureCanvas.height = 128;
  const context = textureCanvas.getContext("2d");
  const gradient = context.createLinearGradient(0, 0, 0, 128);
  gradient.addColorStop(0, data.accent);
  gradient.addColorStop(.24, data.color);
  gradient.addColorStop(.55, data.accent);
  gradient.addColorStop(.78, data.color);
  gradient.addColorStop(1, data.accent);
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 128);

  const random = mulberry32(index * 983 + 41);
  context.globalCompositeOperation = "soft-light";
  for (let i = 0; i < 95; i++) {
    context.fillStyle = `rgba(${random() > .5 ? "255,255,255" : "0,0,0"},${.04 + random() * .13})`;
    if (index >= 4) {
      context.fillRect(0, random() * 128, 256, .5 + random() * 5);
    } else {
      context.beginPath();
      context.arc(random() * 256, random() * 128, 1 + random() * 7, 0, Math.PI * 2);
      context.fill();
    }
  }

  if (data.name === "Earth") {
    context.fillStyle = "rgba(117,157,92,.8)";
    for (let i = 0; i < 18; i++) {
      context.beginPath();
      context.ellipse(random() * 256, 25 + random() * 78, 5 + random() * 18, 2 + random() * 7, random() * Math.PI, 0, Math.PI * 2);
      context.fill();
    }
  }
  if (data.name === "Jupiter") {
    context.fillStyle = "rgba(145,54,38,.7)";
    context.beginPath();
    context.ellipse(183, 77, 17, 7, -.1, 0, Math.PI * 2);
    context.fill();
  }

  context.globalCompositeOperation = "source-over";
  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function mulberry32(seed) {
  return function random() {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let value = Math.imul(seed ^ seed >>> 15, 1 | seed);
    value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value;
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function createStars(count, radius, size, opacity) {
  const positions = new Float32Array(count * 3);
  const random = mulberry32(count + radius);
  for (let i = 0; i < count; i++) {
    const r = radius * (.45 + random() * .55);
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi);
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(geometry, new THREE.PointsMaterial({
    color: 0xdde7ff, size, transparent: true, opacity, sizeAttenuation: true, depthWrite: false
  }));
}

scene.add(createStars(3800, 620, 1.05, .85));
scene.add(createStars(700, 430, 1.8, .35));

const ambient = new THREE.AmbientLight(0x24304c, .23);
scene.add(ambient);
const sunLight = new THREE.PointLight(0xffddaa, 420, 270, 1.35);
scene.add(sunLight);

const solarSystem = new THREE.Group();
solarSystem.rotation.z = THREE.MathUtils.degToRad(-4);
scene.add(solarSystem);

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(7.2, 64, 64),
  new THREE.MeshBasicMaterial({ color: 0xffb34f })
);
solarSystem.add(sun);

const glowMaterial = new THREE.ShaderMaterial({
  uniforms: { glowColor: { value: new THREE.Color(0xff7c36) } },
  vertexShader: "varying vec3 n;varying vec3 p;void main(){n=normalize(normalMatrix*normal);p=normalize((modelViewMatrix*vec4(position,1.)).xyz);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
  fragmentShader: "uniform vec3 glowColor;varying vec3 n;varying vec3 p;void main(){float a=pow(.72-dot(n,-p),2.4);gl_FragColor=vec4(glowColor,a*.72);}",
  blending: THREE.AdditiveBlending,
  transparent: true,
  side: THREE.BackSide,
  depthWrite: false
});
sun.add(new THREE.Mesh(new THREE.SphereGeometry(8.8, 48, 48), glowMaterial));

const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x71809c, transparent: true, opacity: .16 });
const bodyMeshes = [];
const labels = [];

planets.forEach((data, index) => {
  const orbitPoints = [];
  for (let step = 0; step <= 128; step++) {
    const angle = step / 128 * Math.PI * 2;
    orbitPoints.push(new THREE.Vector3(Math.cos(angle) * data.distance, 0, Math.sin(angle) * data.distance));
  }
  solarSystem.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(orbitPoints), orbitMaterial));

  const pivot = new THREE.Group();
  pivot.rotation.y = index * .82 + .35;
  solarSystem.add(pivot);

  const holder = new THREE.Group();
  holder.position.x = data.distance;
  pivot.add(holder);

  const material = new THREE.MeshStandardMaterial({
    map: makeTexture(data, index),
    roughness: index < 4 ? .85 : .68,
    metalness: 0,
    bumpMap: makeTexture(data, index + 20),
    bumpScale: .05
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(data.radius, 40, 40), material);
  mesh.rotation.z = THREE.MathUtils.degToRad([.03, 177, 23.4, 25, 3, 26.7, 97.8, 28.3][index]);
  mesh.userData.bodyIndex = index;
  holder.add(mesh);
  bodyMeshes.push(mesh);

  if (data.name === "Saturn") {
    const rings = new THREE.Mesh(
      new THREE.RingGeometry(data.radius * 1.35, data.radius * 2.15, 96),
      new THREE.MeshStandardMaterial({ color: 0xc8b58e, transparent: true, opacity: .72, side: THREE.DoubleSide, roughness: .9 })
    );
    rings.rotation.x = Math.PI / 2;
    rings.rotation.y = -.15;
    holder.add(rings);
  }

  if (data.name === "Earth") {
    const moonPivot = new THREE.Group();
    holder.add(moonPivot);
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(.42, 20, 20),
      new THREE.MeshStandardMaterial({ color: 0xb7b4ac, roughness: 1 })
    );
    moon.position.x = 3.2;
    moonPivot.add(moon);
    data.moonPivot = moonPivot;
  }

  data.pivot = pivot;
  data.holder = holder;
  data.mesh = mesh;

  const label = document.createElement("span");
  label.className = "planet-label";
  label.textContent = data.name.toUpperCase();
  document.querySelector("#labels").append(label);
  labels.push(label);
});

const controller = {
  target: new THREE.Vector3(),
  desiredTarget: new THREE.Vector3(),
  radius: camera.position.length(),
  desiredRadius: camera.position.length(),
  theta: Math.atan2(camera.position.x, camera.position.z),
  phi: Math.acos(camera.position.y / camera.position.length()),
  desiredTheta: Math.atan2(camera.position.x, camera.position.z),
  desiredPhi: Math.acos(camera.position.y / camera.position.length()),
  selected: null,
  update() {
    if (this.selected !== null) {
      planets[this.selected].mesh.getWorldPosition(this.desiredTarget);
    }
    this.target.lerp(this.desiredTarget, .075);
    this.radius += (this.desiredRadius - this.radius) * .075;
    this.theta += (this.desiredTheta - this.theta) * .075;
    this.phi += (this.desiredPhi - this.phi) * .075;
    const sinPhi = Math.sin(this.phi);
    camera.position.set(
      this.target.x + this.radius * sinPhi * Math.sin(this.theta),
      this.target.y + this.radius * Math.cos(this.phi),
      this.target.z + this.radius * sinPhi * Math.cos(this.theta)
    );
    camera.lookAt(this.target);
  },
  reset() {
    this.selected = null;
    this.desiredTarget.set(0, 0, 0);
    this.desiredRadius = 116;
    this.desiredTheta = .19;
    this.desiredPhi = 1.16;
    closeDetails();
  }
};

let pointerStart = null;
let previousPointer = null;
let pointerMode = "rotate";
const activeTouches = new Map();

canvas.addEventListener("pointerdown", (event) => {
  canvas.setPointerCapture(event.pointerId);
  activeTouches.set(event.pointerId, { x: event.clientX, y: event.clientY });
  pointerStart = { x: event.clientX, y: event.clientY };
  previousPointer = { x: event.clientX, y: event.clientY };
  pointerMode = event.button === 2 || event.shiftKey ? "pan" : "rotate";
});

canvas.addEventListener("pointermove", (event) => {
  if (!activeTouches.has(event.pointerId)) {
    updateHover(event);
    return;
  }
  const previous = activeTouches.get(event.pointerId);
  activeTouches.set(event.pointerId, { x: event.clientX, y: event.clientY });

  if (activeTouches.size === 2) {
    const points = [...activeTouches.values()];
    const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
    if (previousPointer?.distance) controller.desiredRadius *= previousPointer.distance / distance;
    previousPointer = { distance };
    controller.desiredRadius = THREE.MathUtils.clamp(controller.desiredRadius, 7, 240);
    return;
  }

  const dx = event.clientX - previous.x;
  const dy = event.clientY - previous.y;
  if (pointerMode === "pan") {
    const scale = controller.desiredRadius * .0016;
    const right = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0);
    const up = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 1);
    controller.selected = null;
    controller.desiredTarget.addScaledVector(right, -dx * scale).addScaledVector(up, dy * scale);
  } else {
    controller.desiredTheta -= dx * .005;
    controller.desiredPhi = THREE.MathUtils.clamp(controller.desiredPhi + dy * .005, .12, Math.PI - .12);
  }
  previousPointer = { x: event.clientX, y: event.clientY };
});

canvas.addEventListener("pointerup", (event) => {
  activeTouches.delete(event.pointerId);
  if (pointerStart && Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) < 5) {
    pickBody(event);
  }
  pointerStart = null;
  previousPointer = null;
});
canvas.addEventListener("pointercancel", (event) => activeTouches.delete(event.pointerId));
canvas.addEventListener("contextmenu", (event) => event.preventDefault());
canvas.addEventListener("wheel", (event) => {
  event.preventDefault();
  controller.desiredRadius *= Math.exp(event.deltaY * .001);
  controller.desiredRadius = THREE.MathUtils.clamp(controller.desiredRadius, 7, 240);
}, { passive: false });

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function raycast(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.set(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );
  raycaster.setFromCamera(pointer, camera);
  return raycaster.intersectObjects(bodyMeshes, false)[0];
}

function updateHover(event) {
  const hit = raycast(event);
  canvas.style.cursor = hit ? "pointer" : "grab";
}

function pickBody(event) {
  const hit = raycast(event);
  if (hit) selectPlanet(hit.object.userData.bodyIndex);
}

const list = document.querySelector("#planetList");
planets.forEach((planet, index) => {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = planet.name.toUpperCase();
  button.addEventListener("click", () => selectPlanet(index));
  list.append(button);
  planet.button = button;
});

function selectPlanet(index) {
  const planet = planets[index];
  controller.selected = index;
  controller.desiredRadius = Math.max(planet.radius * 6.5, 10);
  controller.desiredPhi = 1.25;
  document.querySelector("#planetIndex").textContent = `PLANET ${String(index + 1).padStart(2, "0")} / 08`;
  document.querySelector("#planetName").textContent = planet.name;
  document.querySelector("#planetType").textContent = planet.type.toUpperCase();
  document.querySelector("#planetDescription").textContent = planet.description;
  document.querySelector("#planetDiameter").textContent = planet.diameter;
  document.querySelector("#planetOrbit").textContent = planet.orbit;
  document.querySelector("#planetMoons").textContent = planet.moons;
  document.querySelector("#infoPanel").classList.add("open");
  planets.forEach((body, bodyIndex) => body.button.classList.toggle("active", bodyIndex === index));
  labels.forEach((label, labelIndex) => label.classList.toggle("active", labelIndex === index));
}

function closeDetails() {
  document.querySelector("#infoPanel").classList.remove("open");
  planets.forEach((body) => body.button.classList.remove("active"));
  labels.forEach((label) => label.classList.remove("active"));
}

document.querySelector("#closeInfo").addEventListener("click", closeDetails);
document.querySelector("#releaseFocus").addEventListener("click", () => controller.reset());
document.querySelector("#resetButton").addEventListener("click", () => controller.reset());
document.querySelector(".brand").addEventListener("click", (event) => {
  event.preventDefault();
  controller.reset();
});

let paused = false;
let speed = 1;
let elapsedDays = 0;
const pauseButton = document.querySelector("#pauseButton");
const speedControl = document.querySelector("#speedControl");

pauseButton.addEventListener("click", () => {
  paused = !paused;
  pauseButton.setAttribute("aria-pressed", String(paused));
  pauseButton.setAttribute("aria-label", paused ? "Resume simulation" : "Pause simulation");
});

speedControl.addEventListener("input", () => {
  speed = Number(speedControl.value);
  document.querySelector("#speedValue").value = `${speed.toFixed(1)}×`;
  speedControl.style.setProperty("--progress", `${(speed - .1) / 3.9 * 100}%`);
});

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    pauseButton.click();
  }
  if (event.key === "Escape") controller.reset();
  if (event.key === "+" || event.key === "=") {
    speedControl.value = Math.min(4, speed + .1);
    speedControl.dispatchEvent(new Event("input"));
  }
  if (event.key === "-") {
    speedControl.value = Math.max(.1, speed - .1);
    speedControl.dispatchEvent(new Event("input"));
  }
});

let audioContext = null;
let ambientGain = null;
document.querySelector("#soundToggle").addEventListener("click", async (event) => {
  const button = event.currentTarget;
  const enabled = button.getAttribute("aria-pressed") !== "true";
  if (!audioContext) {
    audioContext = new AudioContext();
    ambientGain = audioContext.createGain();
    ambientGain.gain.value = 0;
    ambientGain.connect(audioContext.destination);
    [55, 82.5, 110].forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.value = [.034, .018, .01][index];
      oscillator.connect(gain).connect(ambientGain);
      oscillator.start();
    });
  }
  await audioContext.resume();
  ambientGain.gain.cancelScheduledValues(audioContext.currentTime);
  ambientGain.gain.linearRampToValueAtTime(enabled ? .8 : 0, audioContext.currentTime + .5);
  button.setAttribute("aria-pressed", String(enabled));
});

function resize() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== Math.floor(width * renderer.getPixelRatio()) || canvas.height !== Math.floor(height * renderer.getPixelRatio())) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}

function updateLabels() {
  planets.forEach((planet, index) => {
    const position = new THREE.Vector3();
    planet.mesh.getWorldPosition(position);
    position.y += planet.radius + .9;
    position.project(camera);
    const visible = position.z < 1 && position.x > -1.2 && position.x < 1.2 && position.y > -1.2 && position.y < 1.2;
    labels[index].style.display = visible ? "block" : "none";
    labels[index].style.left = `${(position.x * .5 + .5) * canvas.clientWidth}px`;
    labels[index].style.top = `${(-position.y * .5 + .5) * canvas.clientHeight}px`;
  });
}

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  resize();
  const delta = Math.min(clock.getDelta(), .05);
  if (!paused) {
    const step = delta * speed;
    elapsedDays += step * 16;
    sun.rotation.y += step * .08;
    planets.forEach((planet) => {
      planet.pivot.rotation.y += step * planet.speed * .075;
      planet.mesh.rotation.y += step * planet.rotation;
      if (planet.moonPivot) planet.moonPivot.rotation.y += step * 1.7;
    });
    document.querySelector("#simDate").textContent = `DAY ${String(Math.floor(elapsedDays) % 1000).padStart(3, "0")}`;
  }
  controller.update();
  updateLabels();
  renderer.render(scene, camera);
}

speedControl.dispatchEvent(new Event("input"));
animate();
window.addEventListener("load", () => setTimeout(() => document.querySelector("#loading").classList.add("hidden"), 350));
