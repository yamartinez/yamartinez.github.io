import * as THREE from "../../roadtrip2/webgl/vendor/three.module.min.js";

const PLANETS = [
  {
    name: "Mercury",
    kind: "Terrestrial planet",
    tagline: "The swift, cratered messenger",
    description: "The smallest world and the fastest around the Sun. Mercury endures a dramatic swing between scorching daylight and a night cold enough to freeze carbon dioxide.",
    radius: 0.72,
    orbitRadius: 10,
    orbitSpeed: 0.54,
    rotationSpeed: 0.11,
    axialTilt: 0.03,
    initialAngle: 0.35,
    color: "#a7a096",
    accent: "#d0c4ae",
    surface: ["#6e6963", "#b5aaa0", "#4c4946"],
    texture: "rock",
    distance: "57.9M km",
    label: "0.39 AU",
    diameter: "4,879 km",
    day: "58.6 days",
    year: "88 days",
    moons: "0",
    temperature: "167°C"
  },
  {
    name: "Venus",
    kind: "Terrestrial planet",
    tagline: "A world beneath the clouds",
    description: "A brilliant veil of sulfuric clouds hides a volcanic landscape. Its dense atmosphere traps heat in a runaway greenhouse, making Venus hotter than Mercury.",
    radius: 1.15,
    orbitRadius: 14.2,
    orbitSpeed: 0.37,
    rotationSpeed: -0.035,
    axialTilt: 177.4,
    initialAngle: 2.65,
    color: "#dca966",
    accent: "#ffbd72",
    surface: ["#b66e32", "#e8bd72", "#8c4f29"],
    texture: "venus",
    atmosphere: "#eeb86b",
    atmosphereOpacity: 0.35,
    distance: "108.2M km",
    label: "0.72 AU",
    diameter: "12,104 km",
    day: "243 days",
    year: "225 days",
    moons: "0",
    temperature: "464°C"
  },
  {
    name: "Earth",
    kind: "Terrestrial planet",
    tagline: "The living ocean world",
    description: "The only world known to hold life. Liquid oceans, a protective magnetic field, and an oxygen-rich atmosphere make this small blue planet unlike any other we know.",
    radius: 1.26,
    orbitRadius: 19,
    orbitSpeed: 0.3,
    rotationSpeed: 0.72,
    axialTilt: 23.4,
    initialAngle: 4.25,
    color: "#3c84c6",
    accent: "#6ab9ff",
    surface: ["#145188", "#4e9ac9", "#183d6f"],
    texture: "earth",
    atmosphere: "#62b9ff",
    atmosphereOpacity: 0.48,
    distance: "149.6M km",
    label: "1.00 AU",
    diameter: "12,742 km",
    day: "23h 56m",
    year: "365.25 days",
    moons: "1",
    temperature: "15°C",
    moonsData: [
      { name: "Moon", radius: 0.29, distance: 2.4, speed: 0.92, color: "#bbb8ae" }
    ]
  },
  {
    name: "Mars",
    kind: "Terrestrial planet",
    tagline: "The rust-red frontier",
    description: "Cold, dusty, and geologically grand. Mars carries the largest volcano and one of the deepest canyon systems in the solar system, along with evidence of ancient rivers.",
    radius: 0.94,
    orbitRadius: 24.5,
    orbitSpeed: 0.235,
    rotationSpeed: 0.68,
    axialTilt: 25.2,
    initialAngle: 5.6,
    color: "#b95638",
    accent: "#ff8058",
    surface: ["#853720", "#c3623c", "#54271d"],
    texture: "mars",
    atmosphere: "#e98561",
    atmosphereOpacity: 0.12,
    distance: "227.9M km",
    label: "1.52 AU",
    diameter: "6,779 km",
    day: "24h 37m",
    year: "687 days",
    moons: "2",
    temperature: "−63°C",
    moonsData: [
      { name: "Phobos", radius: 0.1, distance: 1.65, speed: 1.55, color: "#8e7969" },
      { name: "Deimos", radius: 0.07, distance: 2.05, speed: 0.8, color: "#a38a77" }
    ]
  },
  {
    name: "Jupiter",
    kind: "Gas giant",
    tagline: "The storm king",
    description: "More massive than every other planet combined. Jupiter's striped atmosphere is a restless ocean of gas crowned by the Great Red Spot, a storm larger than Earth.",
    radius: 3.4,
    orbitRadius: 34,
    orbitSpeed: 0.132,
    rotationSpeed: 1.18,
    axialTilt: 3.1,
    initialAngle: 1.55,
    color: "#d7ad83",
    accent: "#efc296",
    surface: ["#8c6348", "#d7b38b", "#eee0c7", "#a65f42"],
    texture: "gas",
    storm: true,
    distance: "778.5M km",
    label: "5.20 AU",
    diameter: "139,820 km",
    day: "9h 56m",
    year: "11.86 years",
    moons: "95",
    temperature: "−110°C",
    moonsData: [
      { name: "Io", radius: 0.22, distance: 5, speed: 1.25, color: "#d9b463" },
      { name: "Europa", radius: 0.18, distance: 5.8, speed: 0.88, color: "#c8bca4" },
      { name: "Ganymede", radius: 0.28, distance: 6.8, speed: 0.62, color: "#8f8377" },
      { name: "Callisto", radius: 0.25, distance: 7.8, speed: 0.46, color: "#665e58" }
    ]
  },
  {
    name: "Saturn",
    kind: "Gas giant",
    tagline: "The ringed jewel",
    description: "A pale gas giant encircled by countless shards of ice and rock. Saturn's rings span hundreds of thousands of kilometers, yet are astonishingly thin.",
    radius: 2.95,
    orbitRadius: 45,
    orbitSpeed: 0.095,
    rotationSpeed: 1.02,
    axialTilt: 26.7,
    initialAngle: 3.4,
    color: "#d5c18d",
    accent: "#f3d88e",
    surface: ["#9d895b", "#d8c492", "#eee1bb", "#b4a06e"],
    texture: "gas",
    distance: "1.43B km",
    label: "9.54 AU",
    diameter: "116,460 km",
    day: "10h 42m",
    year: "29.45 years",
    moons: "146",
    temperature: "−140°C",
    rings: [
      { inner: 1.28, outer: 1.48, color: "#9f8e68", opacity: 0.42 },
      { inner: 1.52, outer: 1.83, color: "#e1cfa5", opacity: 0.65 },
      { inner: 1.88, outer: 2.18, color: "#968769", opacity: 0.38 }
    ],
    moonsData: [
      { name: "Titan", radius: 0.29, distance: 7.1, speed: 0.48, color: "#c99b54" },
      { name: "Enceladus", radius: 0.12, distance: 5.2, speed: 0.92, color: "#d7e0e3" }
    ]
  },
  {
    name: "Uranus",
    kind: "Ice giant",
    tagline: "The sideways world",
    description: "Uranus rolls around the Sun almost entirely on its side, likely the scar of an ancient collision. Methane in its cold atmosphere gives the planet its cyan color.",
    radius: 2.05,
    orbitRadius: 55,
    orbitSpeed: 0.072,
    rotationSpeed: -0.44,
    axialTilt: 97.8,
    initialAngle: 4.95,
    color: "#80c9cf",
    accent: "#9be8ea",
    surface: ["#579fa9", "#91d4d7", "#b6e5e2"],
    texture: "ice",
    atmosphere: "#77d6df",
    atmosphereOpacity: 0.3,
    distance: "2.87B km",
    label: "19.19 AU",
    diameter: "50,724 km",
    day: "17h 14m",
    year: "84 years",
    moons: "28",
    temperature: "−195°C",
    rings: [
      { inner: 1.52, outer: 1.57, color: "#8bb9b9", opacity: 0.46 },
      { inner: 1.82, outer: 1.86, color: "#6b9195", opacity: 0.38 }
    ]
  },
  {
    name: "Neptune",
    kind: "Ice giant",
    tagline: "The blue world of winds",
    description: "The outermost major planet is a deep blue world whipped by the fastest winds in the solar system. From here, sunlight is nearly one thousand times dimmer than on Earth.",
    radius: 1.96,
    orbitRadius: 65,
    orbitSpeed: 0.057,
    rotationSpeed: 0.72,
    axialTilt: 28.3,
    initialAngle: 0.8,
    color: "#315fc4",
    accent: "#5c8dff",
    surface: ["#183a91", "#315fc4", "#4d82e5"],
    texture: "ice",
    atmosphere: "#346fff",
    atmosphereOpacity: 0.34,
    distance: "4.50B km",
    label: "30.06 AU",
    diameter: "49,244 km",
    day: "16h 6m",
    year: "164.8 years",
    moons: "16",
    temperature: "−200°C",
    moonsData: [
      { name: "Triton", radius: 0.2, distance: 3.9, speed: -0.62, color: "#aeb1ad" }
    ]
  }
];

const SUN = {
  name: "Sun",
  kind: "G-type main-sequence star",
  tagline: "The star that holds us together",
  description: "A 4.6-billion-year-old sphere of plasma containing 99.86% of the system's mass. Every second, its core turns hundreds of millions of tons of hydrogen into light.",
  radius: 5.2,
  color: "#ffb14e",
  accent: "#ffb14e",
  surface: ["#df6f20", "#ffb43f", "#ffe08a"],
  texture: "sun",
  distance: "System center",
  label: "Our star",
  diameter: "1.39M km",
  day: "25–35 days",
  year: "—",
  moons: "8 planets",
  temperature: "5,500°C"
};

const SPEEDS = [0.25, 0.5, 1, 2, 4, 8];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

class CameraRig {
  constructor(camera, element, onTap) {
    this.camera = camera;
    this.element = element;
    this.onTap = onTap;
    this.target = new THREE.Vector3();
    this.targetGoal = new THREE.Vector3();
    this.focusObject = null;
    this.radius = 88;
    this.radiusGoal = 88;
    this.theta = 0.62;
    this.thetaGoal = 0.62;
    this.phi = 1.16;
    this.phiGoal = 1.16;
    this.minRadius = 4;
    this.maxRadius = 150;
    this.pointers = new Map();
    this.dragged = false;
    this.pinchDistance = 0;
    this.pinchCenter = { x: 0, y: 0 };
    this.right = new THREE.Vector3();
    this.up = new THREE.Vector3();
    this.focusPosition = new THREE.Vector3();

    element.addEventListener("pointerdown", this.handlePointerDown.bind(this));
    element.addEventListener("pointermove", this.handlePointerMove.bind(this));
    element.addEventListener("pointerup", this.handlePointerUp.bind(this));
    element.addEventListener("pointercancel", this.handlePointerUp.bind(this));
    element.addEventListener("wheel", this.handleWheel.bind(this), { passive: false });
    element.addEventListener("contextmenu", (event) => event.preventDefault());
  }

  handlePointerDown(event) {
    if (event.pointerType === "mouse" && event.button !== 0 && event.button !== 2) return;
    event.preventDefault();
    if (this.pointers.size === 0) this.dragged = false;

    this.pointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
      startX: event.clientX,
      startY: event.clientY,
      mode: event.button === 2 || event.shiftKey ? "pan" : "orbit"
    });
    this.element.setPointerCapture(event.pointerId);

    if (this.pointers.size === 2) this.resetPinch();
  }

  handlePointerMove(event) {
    const pointer = this.pointers.get(event.pointerId);
    if (!pointer) return;

    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    pointer.x = event.clientX;
    pointer.y = event.clientY;

    if (Math.hypot(event.clientX - pointer.startX, event.clientY - pointer.startY) > 4) {
      this.dragged = true;
    }

    if (this.pointers.size === 1) {
      if (pointer.mode === "pan") {
        this.pan(dx, dy);
      } else {
        this.thetaGoal -= dx * 0.0052;
        this.phiGoal = THREE.MathUtils.clamp(this.phiGoal - dy * 0.0047, 0.13, Math.PI - 0.13);
      }
      return;
    }

    if (this.pointers.size === 2) {
      const points = Array.from(this.pointers.values());
      const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      const center = {
        x: (points[0].x + points[1].x) * 0.5,
        y: (points[0].y + points[1].y) * 0.5
      };

      if (this.pinchDistance > 0) {
        this.radiusGoal = THREE.MathUtils.clamp(
          this.radiusGoal * (this.pinchDistance / Math.max(distance, 1)),
          this.minRadius,
          this.maxRadius
        );
        this.pan(center.x - this.pinchCenter.x, center.y - this.pinchCenter.y);
      }
      this.pinchDistance = distance;
      this.pinchCenter = center;
    }
  }

  handlePointerUp(event) {
    const pointer = this.pointers.get(event.pointerId);
    if (!pointer) return;

    const isTap = this.pointers.size === 1 && !this.dragged && pointer.mode !== "pan";
    this.pointers.delete(event.pointerId);
    if (this.element.hasPointerCapture(event.pointerId)) {
      this.element.releasePointerCapture(event.pointerId);
    }

    if (this.pointers.size < 2) this.pinchDistance = 0;
    if (isTap) this.onTap(event.clientX, event.clientY);
  }

  handleWheel(event) {
    event.preventDefault();
    this.radiusGoal = THREE.MathUtils.clamp(
      this.radiusGoal * Math.exp(event.deltaY * 0.0011),
      this.minRadius,
      this.maxRadius
    );
  }

  resetPinch() {
    const points = Array.from(this.pointers.values());
    this.pinchDistance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
    this.pinchCenter = {
      x: (points[0].x + points[1].x) * 0.5,
      y: (points[0].y + points[1].y) * 0.5
    };
  }

  pan(dx, dy) {
    this.camera.updateMatrix();
    this.right.setFromMatrixColumn(this.camera.matrix, 0);
    this.up.setFromMatrixColumn(this.camera.matrix, 1);
    const scale = this.radiusGoal * 0.0017;
    this.targetGoal.addScaledVector(this.right, -dx * scale);
    this.targetGoal.addScaledVector(this.up, dy * scale);
    this.focusObject = null;
  }

  focus(object, distance) {
    this.focusObject = object;
    object.getWorldPosition(this.targetGoal);
    this.radiusGoal = THREE.MathUtils.clamp(distance, this.minRadius, this.maxRadius);
  }

  clearFocus() {
    this.focusObject = null;
    this.targetGoal.copy(this.target);
  }

  reset() {
    this.focusObject = null;
    this.targetGoal.set(0, 0, 0);
    this.radiusGoal = 88;
    this.thetaGoal = 0.62;
    this.phiGoal = 1.16;
  }

  update(delta) {
    if (this.focusObject) {
      this.focusObject.getWorldPosition(this.focusPosition);
      this.targetGoal.copy(this.focusPosition);
    }

    const positionDamping = 1 - Math.exp(-5.8 * delta);
    const rotationDamping = 1 - Math.exp(-7.5 * delta);
    this.target.lerp(this.targetGoal, positionDamping);
    this.radius = THREE.MathUtils.lerp(this.radius, this.radiusGoal, positionDamping);
    this.theta = THREE.MathUtils.lerp(this.theta, this.thetaGoal, rotationDamping);
    this.phi = THREE.MathUtils.lerp(this.phi, this.phiGoal, rotationDamping);

    const sinPhi = Math.sin(this.phi);
    this.camera.position.set(
      this.target.x + this.radius * sinPhi * Math.sin(this.theta),
      this.target.y + this.radius * Math.cos(this.phi),
      this.target.z + this.radius * sinPhi * Math.cos(this.theta)
    );
    this.camera.lookAt(this.target);
  }
}

function init() {
  const canvas = document.getElementById("space-canvas");
  const loadingScreen = document.getElementById("loading-screen");
  const errorState = document.getElementById("error-state");
  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance"
    });
  } catch (error) {
    loadingScreen.hidden = true;
    errorState.hidden = false;
    throw error;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
  renderer.setClearColor(0x03050b, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, 1, 0.08, 1200);
  const inspectionLight = new THREE.PointLight(0xa8c9ff, 95, 38, 1.25);
  camera.add(inspectionLight);
  scene.add(camera);
  const orbitGroup = new THREE.Group();
  const worldGroup = new THREE.Group();
  scene.add(orbitGroup, worldGroup);

  scene.add(new THREE.AmbientLight(0x263752, 0.36));
  const sunlight = new THREE.PointLight(0xffd3a0, 2600, 0, 1.12);
  scene.add(sunlight);

  const starTexture = createRadialTexture("#ffffff");
  const stars = createStarfield(starTexture);
  const asteroidBelt = createAsteroidBelt(starTexture);
  scene.add(stars, asteroidBelt);

  const selectableMeshes = [];
  const orbitLines = [];
  const bodies = [];

  const sunBody = createSun(renderer, worldGroup, selectableMeshes);
  const sunGlow = createSunGlow(worldGroup);

  PLANETS.forEach((data, index) => {
    const body = createPlanet(data, index, renderer, worldGroup, orbitGroup, selectableMeshes, orbitLines);
    bodies.push(body);
  });

  const allBodies = [sunBody, ...bodies];
  allBodies.forEach(createBodyLabel);
  createPlanetNavigation(bodies);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let selectedBody = null;
  let hoveredBody = null;
  let speedIndex = 2;
  let paused = reducedMotion;
  let simulationDays = 0;
  let labelsVisible = true;
  let orbitsVisible = true;

  const cameraRig = new CameraRig(camera, canvas, (x, y) => {
    const body = pickBody(x, y);
    if (body) selectBody(body);
  });
  cameraRig.update(1);

  const panel = document.getElementById("planet-panel");
  const labelsLayer = document.getElementById("labels-layer");
  const labelsToggle = document.getElementById("labels-toggle");
  const orbitsToggle = document.getElementById("orbits-toggle");
  const playButton = document.getElementById("play-button");
  const speedValue = document.getElementById("speed-value");
  const simState = document.getElementById("sim-state");
  const elapsedDays = document.getElementById("elapsed-days");
  const hoverCard = document.getElementById("hover-card");

  function pickBody(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(selectableMeshes, false)[0];
    return hit ? hit.object.userData.body : null;
  }

  function selectBody(body) {
    selectedBody = body;
    const data = body.data;
    const planetIndex = body.planetIndex;
    const displayIndex = planetIndex >= 0 ? String(planetIndex + 1).padStart(2, "0") : "00";

    document.body.classList.add("has-selection");
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    panel.style.setProperty("--panel-accent", data.accent);
    document.getElementById("panel-orbit").textContent = `${displayIndex} / 08`;
    document.getElementById("panel-position").textContent = displayIndex;
    document.getElementById("panel-type").textContent = data.kind;
    document.getElementById("panel-swatch").style.background = data.accent;
    document.getElementById("panel-name").textContent = data.name;
    document.getElementById("panel-tagline").textContent = data.tagline;
    document.getElementById("panel-description").textContent = data.description;
    document.getElementById("fact-distance").textContent = data.distance;
    document.getElementById("fact-diameter").textContent = data.diameter;
    document.getElementById("fact-day").textContent = data.day;
    document.getElementById("fact-year").textContent = data.year;
    document.getElementById("fact-moons").textContent = data.moons;
    document.getElementById("fact-temperature").textContent = data.temperature;

    allBodies.forEach((candidate) => {
      candidate.labelElement.classList.toggle("is-selected", candidate === body);
    });
    document.querySelectorAll(".planet-button").forEach((button) => {
      button.classList.toggle("is-selected", Number(button.dataset.index) === planetIndex);
    });

    cameraRig.focus(body.focusObject, data.radius * 4.7 + (planetIndex < 0 ? 7 : 4.5));
    hideHover();
  }

  function closePanel() {
    selectedBody = null;
    document.body.classList.remove("has-selection");
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    cameraRig.clearFocus();
    allBodies.forEach((body) => body.labelElement.classList.remove("is-selected"));
    document.querySelectorAll(".planet-button").forEach((button) => button.classList.remove("is-selected"));
  }

  function resetView() {
    closePanel();
    cameraRig.reset();
  }

  function navigatePlanet(direction) {
    const hasPlanetSelected = selectedBody && selectedBody.planetIndex >= 0;
    const nextIndex = hasPlanetSelected
      ? (selectedBody.planetIndex + direction + bodies.length) % bodies.length
      : direction > 0 ? 0 : bodies.length - 1;
    selectBody(bodies[nextIndex]);
  }

  function setPaused(nextPaused) {
    paused = nextPaused;
    document.body.classList.toggle("is-paused", paused);
    playButton.setAttribute("aria-pressed", String(paused));
    playButton.setAttribute("aria-label", paused ? "Resume simulation" : "Pause simulation");
    speedValue.textContent = paused ? "Paused" : `${SPEEDS[speedIndex]}×`;
    simState.textContent = paused ? "Simulation paused" : "Simulation live";
  }

  function changeSpeed(direction) {
    if (paused) paused = false;
    speedIndex = THREE.MathUtils.clamp(speedIndex + direction, 0, SPEEDS.length - 1);
    setPaused(false);
  }

  function setLabelsVisible(visible) {
    labelsVisible = visible;
    labelsLayer.classList.toggle("is-hidden", !visible);
    labelsToggle.classList.toggle("is-active", visible);
    labelsToggle.setAttribute("aria-pressed", String(visible));
  }

  function setOrbitsVisible(visible) {
    orbitsVisible = visible;
    orbitGroup.visible = visible;
    orbitsToggle.classList.toggle("is-active", visible);
    orbitsToggle.setAttribute("aria-pressed", String(visible));
  }

  function showHover(body, clientX, clientY) {
    if (body === selectedBody) {
      hideHover();
      return;
    }
    hoveredBody = body;
    canvas.classList.add("is-hovering");
    document.getElementById("hover-kind").textContent = body.data.kind;
    document.getElementById("hover-name").textContent = body.data.name;
    hoverCard.style.left = `${Math.min(clientX, window.innerWidth - 150)}px`;
    hoverCard.style.top = `${Math.min(clientY, window.innerHeight - 90)}px`;
    hoverCard.classList.add("is-visible");
    hoverCard.setAttribute("aria-hidden", "false");
  }

  function hideHover() {
    hoveredBody = null;
    canvas.classList.remove("is-hovering");
    hoverCard.classList.remove("is-visible");
    hoverCard.setAttribute("aria-hidden", "true");
  }

  let hoverRequest = 0;
  let latestHoverEvent = null;
  canvas.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse" || event.buttons !== 0) {
      hideHover();
      return;
    }
    latestHoverEvent = event;
    if (hoverRequest) return;
    hoverRequest = requestAnimationFrame(() => {
      hoverRequest = 0;
      const body = pickBody(latestHoverEvent.clientX, latestHoverEvent.clientY);
      if (body) showHover(body, latestHoverEvent.clientX, latestHoverEvent.clientY);
      else hideHover();
    });
  });
  canvas.addEventListener("pointerleave", hideHover);
  canvas.addEventListener("pointerdown", hideHover);

  document.getElementById("explore-button").addEventListener("click", () => selectBody(bodies[2]));
  document.getElementById("panel-close").addEventListener("click", closePanel);
  document.getElementById("previous-planet").addEventListener("click", () => navigatePlanet(-1));
  document.getElementById("next-planet").addEventListener("click", () => navigatePlanet(1));
  document.getElementById("slower-button").addEventListener("click", () => changeSpeed(-1));
  document.getElementById("faster-button").addEventListener("click", () => changeSpeed(1));
  playButton.addEventListener("click", () => setPaused(!paused));
  labelsToggle.addEventListener("click", () => setLabelsVisible(!labelsVisible));
  orbitsToggle.addEventListener("click", () => setOrbitsVisible(!orbitsVisible));
  document.getElementById("reset-view").addEventListener("click", resetView);
  document.querySelector(".brand").addEventListener("click", (event) => {
    event.preventDefault();
    resetView();
  });

  document.querySelectorAll(".planet-button").forEach((button) => {
    button.addEventListener("click", () => selectBody(bodies[Number(button.dataset.index)]));
  });
  allBodies.forEach((body) => {
    body.labelElement.addEventListener("click", () => selectBody(body));
  });

  window.addEventListener("keydown", (event) => {
    if (event.target.closest("button, a, input, textarea, select")) return;
    const key = event.key.toLowerCase();
    if (key === " ") {
      event.preventDefault();
      setPaused(!paused);
    } else if (key === "r") {
      resetView();
    } else if (key === "l") {
      setLabelsVisible(!labelsVisible);
    } else if (key === "o") {
      setOrbitsVisible(!orbitsVisible);
    } else if (key === "[" || key === "-") {
      changeSpeed(-1);
    } else if (key === "]" || key === "+") {
      changeSpeed(1);
    } else if (key === "escape") {
      closePanel();
    } else if (key === "arrowleft" && selectedBody) {
      navigatePlanet(-1);
    } else if (key === "arrowright" && selectedBody) {
      navigatePlanet(1);
    }
  });

  function resize() {
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  setPaused(paused);
  setLabelsVisible(true);
  setOrbitsVisible(true);

  let previousTime = performance.now();
  let interfaceAccumulator = 0;

  function animate(now) {
    const delta = Math.min((now - previousTime) / 1000, 0.05);
    previousTime = now;
    const speed = paused ? 0 : SPEEDS[speedIndex];
    const simulationDelta = delta * speed;

    simulationDays += simulationDelta * 18;
    interfaceAccumulator += delta;

    sunBody.mesh.rotation.y += delta * 0.045;
    sunGlow.children[0].material.rotation -= delta * 0.012;
    sunGlow.children[1].material.rotation += delta * 0.006;
    stars.rotation.y += delta * 0.00055;
    stars.rotation.x += delta * 0.00008;
    asteroidBelt.rotation.y += simulationDelta * 0.018;

    bodies.forEach((body) => {
      body.orbitPivot.rotation.y += body.data.orbitSpeed * simulationDelta;
      body.mesh.rotation.y += body.data.rotationSpeed * simulationDelta;
      body.moons.forEach((moon) => {
        moon.pivot.rotation.y += moon.speed * simulationDelta;
        moon.mesh.rotation.y += 0.35 * simulationDelta;
      });
    });

    scene.updateMatrixWorld(true);
    cameraRig.update(delta);
    updateLabels(allBodies, camera);

    if (interfaceAccumulator > 0.25) {
      interfaceAccumulator = 0;
      elapsedDays.textContent = `Day ${String(Math.floor(simulationDays)).padStart(4, "0")}`;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(() => {
    document.body.classList.add("is-ready");
    requestAnimationFrame(animate);
  });
}

function createSun(renderer, worldGroup, selectableMeshes) {
  const texture = createSurfaceTexture(SUN, renderer);
  const geometry = new THREE.SphereGeometry(SUN.radius, 64, 48);
  const material = new THREE.MeshBasicMaterial({ map: texture, color: 0xffd08a });
  const mesh = new THREE.Mesh(geometry, material);
  worldGroup.add(mesh);

  const body = {
    data: SUN,
    planetIndex: -1,
    mesh,
    focusObject: mesh,
    moons: []
  };
  mesh.userData.body = body;
  selectableMeshes.push(mesh);
  return body;
}

function createSunGlow(worldGroup) {
  const group = new THREE.Group();
  const innerTexture = createRadialTexture("#ffb04a", 0.52);
  const outerTexture = createRadialTexture("#ff7b26", 0.32);
  const inner = new THREE.Sprite(new THREE.SpriteMaterial({
    map: innerTexture,
    color: 0xffb15c,
    transparent: true,
    opacity: 0.82,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  }));
  inner.scale.set(18, 18, 1);
  const outer = new THREE.Sprite(new THREE.SpriteMaterial({
    map: outerTexture,
    color: 0xff7d30,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  }));
  outer.scale.set(29, 29, 1);
  group.add(inner, outer);
  worldGroup.add(group);
  return group;
}

function createPlanet(data, index, renderer, worldGroup, orbitGroup, selectableMeshes, orbitLines) {
  const orbitPivot = new THREE.Group();
  orbitPivot.rotation.y = data.initialAngle;
  worldGroup.add(orbitPivot);

  const anchor = new THREE.Group();
  anchor.position.x = data.orbitRadius;
  orbitPivot.add(anchor);

  const tiltGroup = new THREE.Group();
  tiltGroup.rotation.z = THREE.MathUtils.degToRad(data.axialTilt);
  anchor.add(tiltGroup);

  const texture = createSurfaceTexture(data, renderer);
  const segments = window.innerWidth < 700 ? 32 : 48;
  const geometry = new THREE.SphereGeometry(data.radius, segments, Math.floor(segments * 0.72));
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    color: 0xffffff,
    roughness: data.texture === "ice" ? 0.68 : 0.82,
    metalness: 0.02
  });
  const mesh = new THREE.Mesh(geometry, material);
  tiltGroup.add(mesh);

  const body = {
    data,
    planetIndex: index,
    orbitPivot,
    anchor,
    focusObject: anchor,
    mesh,
    moons: []
  };
  mesh.userData.body = body;
  selectableMeshes.push(mesh);

  if (data.atmosphere) {
    const atmosphere = createAtmosphere(data.radius, data.atmosphere, data.atmosphereOpacity);
    tiltGroup.add(atmosphere);
  }

  if (data.rings) createRings(data, tiltGroup);
  if (data.moonsData) {
    data.moonsData.forEach((moonData, moonIndex) => {
      body.moons.push(createMoon(moonData, moonIndex, anchor));
    });
  }

  const orbitLine = createOrbitLine(data.orbitRadius, data.color);
  orbitLines.push(orbitLine);
  orbitGroup.add(orbitLine);
  return body;
}

function createAtmosphere(radius, color, opacity) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.085, 40, 28),
    new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(color) },
        glowOpacity: { value: opacity }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDirection;
        void main() {
          vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vViewDirection = normalize(-viewPosition.xyz);
          gl_Position = projectionMatrix * viewPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float glowOpacity;
        varying vec3 vNormal;
        varying vec3 vViewDirection;
        void main() {
          float rim = pow(1.0 - max(dot(vNormal, vViewDirection), 0.0), 2.4);
          gl_FragColor = vec4(glowColor, rim * glowOpacity);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.FrontSide
    })
  );
}

function createRings(data, tiltGroup) {
  data.rings.forEach((ringData) => {
    const geometry = new THREE.RingGeometry(
      data.radius * ringData.inner,
      data.radius * ringData.outer,
      128
    );
    const material = new THREE.MeshBasicMaterial({
      color: ringData.color,
      transparent: true,
      opacity: ringData.opacity,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const ring = new THREE.Mesh(geometry, material);
    ring.rotation.x = Math.PI / 2;
    tiltGroup.add(ring);
  });
}

function createMoon(data, index, anchor) {
  const pivot = new THREE.Group();
  pivot.rotation.y = index * 1.9 + 0.6;
  anchor.add(pivot);

  const material = new THREE.MeshStandardMaterial({
    color: data.color,
    roughness: 0.95,
    metalness: 0
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(data.radius, 18, 12), material);
  mesh.position.x = data.distance;
  pivot.add(mesh);

  const points = [];
  for (let i = 0; i < 64; i += 1) {
    const angle = (i / 64) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * data.distance, 0, Math.sin(angle) * data.distance));
  }
  const orbit = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color: 0x748092, transparent: true, opacity: 0.16 })
  );
  anchor.add(orbit);
  return { pivot, mesh, speed: data.speed };
}

function createOrbitLine(radius, color) {
  const points = [];
  for (let i = 0; i < 160; i += 1) {
    const angle = (i / 160) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
  }
  return new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.16,
      depthWrite: false
    })
  );
}

function createStarfield(texture) {
  const count = window.innerWidth < 700 ? 2200 : 3800;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const colorChoices = [
    new THREE.Color("#ffffff"),
    new THREE.Color("#b7ccff"),
    new THREE.Color("#ffd2a1")
  ];

  for (let i = 0; i < count; i += 1) {
    const direction = new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    ).normalize();
    const radius = 180 + Math.random() * 640;
    positions[i * 3] = direction.x * radius;
    positions[i * 3 + 1] = direction.y * radius;
    positions[i * 3 + 2] = direction.z * radius;
    const color = colorChoices[Math.floor(Math.random() * colorChoices.length)];
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      map: texture,
      size: 1.35,
      transparent: true,
      opacity: 0.9,
      vertexColors: true,
      depthWrite: false,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    })
  );
}

function createAsteroidBelt(texture) {
  const count = window.innerWidth < 700 ? 500 : 950;
  const positions = new Float32Array(count * 3);
  const seeded = randomGenerator(8417);

  for (let i = 0; i < count; i += 1) {
    const angle = seeded() * Math.PI * 2;
    const radius = 28.1 + seeded() * 2.6;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = (seeded() - 0.5) * 1.25;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      map: texture,
      color: 0x9c8d79,
      size: 0.18,
      transparent: true,
      opacity: 0.58,
      depthWrite: false,
      sizeAttenuation: true
    })
  );
}

function createSurfaceTexture(data, renderer) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  const random = randomGenerator(hashString(data.name));

  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, blendColors(data.surface[0], "#ffffff", 0.08));
  gradient.addColorStop(0.5, data.surface[1]);
  gradient.addColorStop(1, blendColors(data.surface[2] || data.surface[0], "#000000", 0.12));
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  if (data.texture === "earth") paintEarth(context, random, canvas);
  else if (data.texture === "gas") paintGasGiant(context, random, canvas, data);
  else if (data.texture === "ice") paintIceGiant(context, random, canvas);
  else if (data.texture === "venus") paintVenus(context, random, canvas);
  else if (data.texture === "mars") paintRock(context, random, canvas, true);
  else if (data.texture === "sun") paintSun(context, random, canvas);
  else paintRock(context, random, canvas, false);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  return texture;
}

function paintEarth(context, random, canvas) {
  for (let i = 0; i < 34; i += 1) {
    const x = random() * canvas.width;
    const y = 35 + random() * (canvas.height - 70);
    const width = 14 + random() * 62;
    const height = 8 + random() * 33;
    const green = random() > 0.5 ? "#4f7749" : "#76945c";
    drawOrganicPatch(context, random, x, y, width, height, green, 0.86);
    if (random() > 0.58) {
      drawOrganicPatch(context, random, x + width * 0.13, y, width * 0.5, height * 0.44, "#9c8454", 0.42);
    }
  }

  context.lineCap = "round";
  for (let i = 0; i < 46; i += 1) {
    context.beginPath();
    context.strokeStyle = `rgba(255,255,255,${0.06 + random() * 0.2})`;
    context.lineWidth = 1 + random() * 4;
    const x = random() * canvas.width;
    const y = random() * canvas.height;
    context.moveTo(x, y);
    context.bezierCurveTo(x + 12, y - 7, x + 28, y + 7, x + 45 + random() * 35, y);
    context.stroke();
  }
}

function paintGasGiant(context, random, canvas, data) {
  let y = 0;
  while (y < canvas.height) {
    const bandHeight = 3 + random() * 15;
    context.fillStyle = data.surface[Math.floor(random() * data.surface.length)];
    context.globalAlpha = 0.18 + random() * 0.56;
    context.fillRect(0, y, canvas.width, bandHeight);
    y += bandHeight;
  }

  context.globalAlpha = 0.28;
  context.lineWidth = 1;
  for (let i = 0; i < 45; i += 1) {
    const lineY = random() * canvas.height;
    context.strokeStyle = random() > 0.5 ? "#fff7e8" : "#5e3d31";
    context.beginPath();
    context.moveTo(0, lineY);
    context.bezierCurveTo(130, lineY + random() * 8, 360, lineY - random() * 8, canvas.width, lineY);
    context.stroke();
  }

  if (data.storm) {
    const storm = context.createRadialGradient(365, 153, 3, 365, 153, 34);
    storm.addColorStop(0, "rgba(192,84,52,.88)");
    storm.addColorStop(0.55, "rgba(154,67,46,.72)");
    storm.addColorStop(1, "rgba(113,55,43,0)");
    context.fillStyle = storm;
    context.beginPath();
    context.ellipse(365, 153, 38, 14, -0.08, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;
}

function paintIceGiant(context, random, canvas) {
  context.globalAlpha = 0.22;
  for (let i = 0; i < 32; i += 1) {
    const y = random() * canvas.height;
    context.fillStyle = random() > 0.5 ? "#d4ffff" : "#173b86";
    context.fillRect(0, y, canvas.width, 1 + random() * 5);
  }
  context.globalAlpha = 0.13;
  context.fillStyle = "#ffffff";
  context.beginPath();
  context.ellipse(340, 82, 48, 8, 0, 0, Math.PI * 2);
  context.fill();
  context.globalAlpha = 1;
}

function paintVenus(context, random, canvas) {
  context.globalAlpha = 0.24;
  context.lineCap = "round";
  for (let i = 0; i < 55; i += 1) {
    const y = random() * canvas.height;
    const amplitude = 3 + random() * 10;
    context.strokeStyle = random() > 0.5 ? "#fff1bb" : "#7e3b24";
    context.lineWidth = 2 + random() * 7;
    context.beginPath();
    context.moveTo(-20, y);
    context.bezierCurveTo(130, y + amplitude, 360, y - amplitude, canvas.width + 20, y + 2);
    context.stroke();
  }
  context.globalAlpha = 1;
}

function paintRock(context, random, canvas, isMars) {
  context.globalAlpha = 0.17;
  for (let i = 0; i < 1100; i += 1) {
    const shade = random() > 0.52 ? "#ffffff" : "#000000";
    context.fillStyle = shade;
    const size = 0.5 + random() * 2.2;
    context.fillRect(random() * canvas.width, random() * canvas.height, size, size);
  }

  const craterCount = isMars ? 34 : 75;
  for (let i = 0; i < craterCount; i += 1) {
    const radius = 1 + random() * (isMars ? 10 : 7);
    const x = random() * canvas.width;
    const y = random() * canvas.height;
    context.strokeStyle = "rgba(25,18,15,.28)";
    context.fillStyle = "rgba(30,21,18,.1)";
    context.lineWidth = Math.max(0.7, radius * 0.17);
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  }

  if (isMars) {
    drawOrganicPatch(context, random, 250, 84, 110, 38, "#4d2419", 0.25);
    drawOrganicPatch(context, random, 330, 177, 72, 28, "#d58758", 0.2);
    context.fillStyle = "rgba(235,220,191,.5)";
    context.fillRect(0, 0, canvas.width, 6);
  }
  context.globalAlpha = 1;
}

function paintSun(context, random, canvas) {
  context.globalCompositeOperation = "screen";
  context.lineCap = "round";
  for (let i = 0; i < 180; i += 1) {
    const x = random() * canvas.width;
    const y = random() * canvas.height;
    const length = 8 + random() * 54;
    context.strokeStyle = random() > 0.55 ? "rgba(255,245,178,.22)" : "rgba(255,86,20,.18)";
    context.lineWidth = 0.7 + random() * 3.5;
    context.beginPath();
    context.moveTo(x, y);
    context.bezierCurveTo(x + length * 0.3, y - 5, x + length * 0.7, y + 5, x + length, y);
    context.stroke();
  }
  context.globalCompositeOperation = "source-over";
}

function drawOrganicPatch(context, random, x, y, radiusX, radiusY, color, opacity) {
  const points = 9;
  context.save();
  context.translate(x, y);
  context.rotate((random() - 0.5) * 0.8);
  context.beginPath();
  for (let i = 0; i <= points; i += 1) {
    const angle = (i / points) * Math.PI * 2;
    const variance = 0.72 + random() * 0.5;
    const pointX = Math.cos(angle) * radiusX * variance;
    const pointY = Math.sin(angle) * radiusY * variance;
    if (i === 0) context.moveTo(pointX, pointY);
    else context.lineTo(pointX, pointY);
  }
  context.closePath();
  context.globalAlpha = opacity;
  context.fillStyle = color;
  context.fill();
  context.restore();
}

function createRadialTexture(color, centerStop = 0.4) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.08, color);
  gradient.addColorStop(centerStop, color);
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createBodyLabel(body) {
  const element = document.createElement("button");
  element.type = "button";
  element.className = "body-label";
  element.setAttribute("aria-label", `Focus on ${body.data.name}`);
  element.style.setProperty("--label-color", body.data.accent);
  element.style.setProperty("--label-rgb", hexToRgb(body.data.accent));
  element.innerHTML = `
    <span class="label-dot" aria-hidden="true"></span>
    <span class="label-name">${body.data.name}</span>
    <span class="label-meta">${body.data.label}</span>
  `;
  document.getElementById("labels-layer").appendChild(element);
  body.labelElement = element;
}

function createPlanetNavigation(bodies) {
  const container = document.getElementById("planet-buttons");
  bodies.forEach((body, index) => {
    const button = document.createElement("button");
    const dotSize = THREE.MathUtils.clamp(5 + body.data.radius * 1.8, 6, 12);
    button.type = "button";
    button.className = "planet-button";
    button.dataset.index = String(index);
    button.dataset.name = body.data.name;
    button.setAttribute("aria-label", `Focus on ${body.data.name}`);
    button.style.setProperty("--planet-color", body.data.color);
    button.style.setProperty("--planet-rgb", hexToRgb(body.data.color));
    button.style.setProperty("--dot-size", `${dotSize}px`);
    container.appendChild(button);
  });
}

function updateLabels(bodies, camera) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const worldPosition = new THREE.Vector3();
  const projected = new THREE.Vector3();

  bodies.forEach((body) => {
    body.focusObject.getWorldPosition(worldPosition);
    worldPosition.y += body.data.radius + 1.3;
    projected.copy(worldPosition).project(camera);
    const screenX = (projected.x * 0.5 + 0.5) * width;
    const screenY = (-projected.y * 0.5 + 0.5) * height;
    const visible = projected.z > -1 && projected.z < 1 &&
      projected.x > -1.2 && projected.x < 1.2 &&
      projected.y > -1.2 && projected.y < 1.2 &&
      screenX > 52 && screenX < width - 52 &&
      screenY > 98 && screenY < height - 96;

    body.labelElement.hidden = !visible;
    if (visible) {
      body.labelElement.style.transform =
        `translate3d(${screenX}px, ${screenY}px, 0) translate(-50%, -50%)`;
    }
  });
}

function randomGenerator(seed) {
  let value = seed >>> 0;
  return function random() {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function blendColors(first, second, amount) {
  return `#${new THREE.Color(first).lerp(new THREE.Color(second), amount).getHexString()}`;
}

function hexToRgb(hex) {
  const value = Number.parseInt(hex.replace("#", ""), 16);
  return `${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}`;
}

try {
  init();
} catch (error) {
  console.error("Orbital Atlas failed to initialize.", error);
  document.getElementById("loading-screen").hidden = true;
  document.getElementById("error-state").hidden = false;
}
