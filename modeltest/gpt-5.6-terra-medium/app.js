import * as THREE from "../../roadtrip2/webgl/vendor/three.module.min.js";

const canvas = document.querySelector("#space");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 600);
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const clock = new THREE.Clock();

const bodies = [
  { name: "Sun", type: "G-type star", diameter: "1.39M km", year: "—", distance: "0 AU", radius: 5.5, orbit: 0, speed: 0, color: 0xffbd57, description: "Our local star holds the entire planetary family in its warm, gravitational reach." },
  { name: "Mercury", type: "Terrestrial planet", diameter: "4,879 km", year: "88 days", distance: "0.39 AU", radius: .68, orbit: 10, speed: 1.75, color: 0xaaa092, description: "A scorched, cratered world racing nearest to the Sun." },
  { name: "Venus", type: "Terrestrial planet", diameter: "12,104 km", year: "225 days", distance: "0.72 AU", radius: 1.08, orbit: 14.5, speed: 1.32, color: 0xdca75f, description: "A cloud-wrapped planet with a dramatic, golden atmosphere." },
  { name: "Earth", type: "Terrestrial planet", diameter: "12,742 km", year: "365 days", distance: "1 AU", radius: 1.15, orbit: 20, speed: 1, color: 0x3e83d4, description: "Our blue home, a living oasis circling an ordinary star." },
  { name: "Mars", type: "Terrestrial planet", diameter: "6,779 km", year: "687 days", distance: "1.52 AU", radius: .86, orbit: 25.5, speed: .8, color: 0xc35b3e, description: "The rust-colored frontier world, etched with ancient valleys." },
  { name: "Jupiter", type: "Gas giant", diameter: "139,820 km", year: "11.9 years", distance: "5.2 AU", radius: 3.15, orbit: 34.5, speed: .43, color: 0xd8a879, description: "The largest planet, wrapped in turbulent bands and giant storms." },
  { name: "Saturn", type: "Gas giant", diameter: "116,460 km", year: "29.5 years", distance: "9.58 AU", radius: 2.65, orbit: 44, speed: .29, color: 0xdfc27d, description: "A pale giant, encircled by a spectacular halo of ice and rock." },
  { name: "Uranus", type: "Ice giant", diameter: "50,724 km", year: "84 years", distance: "19.2 AU", radius: 1.72, orbit: 53, speed: .19, color: 0x81d4d1, description: "An icy blue world rolling around the Sun on its side." },
  { name: "Neptune", type: "Ice giant", diameter: "49,244 km", year: "164.8 years", distance: "30.1 AU", radius: 1.66, orbit: 61, speed: .14, color: 0x426fd1, description: "The distant, deep-blue world where the Solar System fades into dark." }
];

let selected = bodies[0], paused = false, speed = 1, azimuth = .75, elevation = .43, distance = 83;
let targetAzimuth = azimuth, targetElevation = elevation, targetDistance = distance;
let targetLook = new THREE.Vector3(), lookingAt = new THREE.Vector3();
let dragging = false, moved = false, lastX = 0, lastY = 0;
const planetMeshes = [];

scene.add(new THREE.AmbientLight(0x526494, .32));
const sunlight = new THREE.PointLight(0xffc469, 2000, 150, 1.7);
scene.add(sunlight);

function addStars() {
  const count = 1800, positions = new Float32Array(count * 3), colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 90 + Math.random() * 210, u = Math.random() * 2 - 1, theta = Math.random() * Math.PI * 2;
    const radial = Math.sqrt(1 - u * u);
    positions.set([r * radial * Math.cos(theta), r * u, r * radial * Math.sin(theta)], i * 3);
    const tint = .6 + Math.random() * .4; colors.set([tint, tint, 1], i * 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  scene.add(new THREE.Points(geometry, new THREE.PointsMaterial({ size: .38, vertexColors: true, transparent: true, opacity: .85, sizeAttenuation: true })));
}

function addOrbit(radius) {
  const geometry = new THREE.RingGeometry(radius - .025, radius + .025, 160);
  geometry.rotateX(-Math.PI / 2);
  scene.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x7181b2, transparent: true, opacity: .18, side: THREE.DoubleSide })));
}

function planetMaterial(body) {
  return new THREE.MeshStandardMaterial({ color: body.color, roughness: body.name === "Earth" ? .72 : .83, metalness: .02, emissive: body.name === "Sun" ? 0xff711c : 0x000000, emissiveIntensity: body.name === "Sun" ? 1.4 : 0 });
}

function buildSystem() {
  addStars();
  bodies.forEach((body, index) => {
    if (body.orbit) addOrbit(body.orbit);
    const pivot = new THREE.Group();
    pivot.rotation.y = index * .73;
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(body.radius, 36, 24), planetMaterial(body));
    mesh.userData.body = body;
    mesh.position.x = body.orbit;
    pivot.add(mesh);
    if (body.name === "Sun") {
      const glow = new THREE.Mesh(new THREE.SphereGeometry(body.radius * 1.35, 36, 24), new THREE.MeshBasicMaterial({ color: 0xff921f, transparent: true, opacity: .12 }));
      mesh.add(glow);
    }
    if (body.name === "Earth") {
      const moonPivot = new THREE.Group(), moon = new THREE.Mesh(new THREE.SphereGeometry(.25, 16, 12), new THREE.MeshStandardMaterial({ color: 0xc6c9cb, roughness: 1 }));
      moon.position.x = 2.1; moonPivot.add(moon); mesh.add(moonPivot); mesh.userData.moonPivot = moonPivot;
    }
    if (body.name === "Saturn") {
      const rings = new THREE.Mesh(new THREE.RingGeometry(body.radius * 1.35, body.radius * 2.25, 64), new THREE.MeshBasicMaterial({ color: 0xe6d096, transparent: true, opacity: .7, side: THREE.DoubleSide }));
      rings.rotation.x = Math.PI / 2.65; mesh.add(rings);
    }
    scene.add(pivot);
    body.pivot = pivot; body.mesh = mesh; planetMeshes.push(mesh);
  });
}

function selectBody(body, focus = true) {
  selected = body;
  document.querySelector("#body-type").textContent = body.type.toUpperCase();
  document.querySelector("#body-name").textContent = body.name;
  document.querySelector("#body-description").textContent = body.description;
  document.querySelector("#body-diameter").textContent = body.diameter;
  document.querySelector("#body-year").textContent = body.year;
  document.querySelector("#body-distance").textContent = body.distance;
  document.querySelector("#focus-button").innerHTML = `Focus ${body.name} <span aria-hidden="true">↗</span>`;
  document.querySelectorAll("#planet-list button").forEach(button => button.setAttribute("aria-current", String(button.dataset.name === body.name)));
  if (focus) focusSelected();
}

function focusSelected() {
  selected.mesh.getWorldPosition(targetLook);
  targetDistance = selected.name === "Sun" ? 43 : Math.max(8, selected.radius * 5.6);
  targetElevation = .3;
}

function resetView() {
  targetLook.set(0, 0, 0); targetDistance = 83; targetAzimuth = .75; targetElevation = .43;
  selectBody(bodies[0], false);
}

function setupList() {
  const list = document.querySelector("#planet-list");
  bodies.forEach(body => {
    const button = document.createElement("button");
    button.type = "button"; button.dataset.name = body.name; button.textContent = body.name;
    button.addEventListener("click", () => selectBody(body));
    list.append(button);
  });
}

function resize() {
  const { clientWidth: width, clientHeight: height } = canvas;
  camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false);
}

function updateCamera() {
  azimuth += (targetAzimuth - azimuth) * .09; elevation += (targetElevation - elevation) * .09; distance += (targetDistance - distance) * .09;
  lookingAt.lerp(targetLook, .09);
  camera.position.set(
    lookingAt.x + distance * Math.cos(elevation) * Math.sin(azimuth),
    lookingAt.y + distance * Math.sin(elevation),
    lookingAt.z + distance * Math.cos(elevation) * Math.cos(azimuth)
  );
  camera.lookAt(lookingAt);
}

function animate() {
  const dt = Math.min(clock.getDelta(), .05);
  if (!paused) bodies.forEach(body => {
    if (body.orbit) body.pivot.rotation.y += dt * body.speed * speed * .32;
    body.mesh.rotation.y += dt * (body.name === "Sun" ? .14 : .36) * speed;
    if (body.mesh.userData.moonPivot) body.mesh.userData.moonPivot.rotation.y += dt * 1.8 * speed;
  });
  if (selected !== bodies[0]) selected.mesh.getWorldPosition(targetLook);
  updateCamera(); renderer.render(scene, camera); requestAnimationFrame(animate);
}

function setSpeed(next) {
  speed = Math.max(.25, Math.min(8, Math.round(next * 4) / 4));
  document.querySelector("#speed-readout").textContent = `${speed.toFixed(2).replace(/\.00$/, ".0")}× orbital speed`;
}

canvas.addEventListener("pointerdown", event => { dragging = true; moved = false; lastX = event.clientX; lastY = event.clientY; canvas.setPointerCapture(event.pointerId); });
canvas.addEventListener("pointermove", event => {
  if (!dragging) return;
  const dx = event.clientX - lastX, dy = event.clientY - lastY;
  if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
  targetAzimuth -= dx * .008; targetElevation = Math.max(-1.25, Math.min(1.25, targetElevation + dy * .008));
  lastX = event.clientX; lastY = event.clientY;
});
canvas.addEventListener("pointerup", event => {
  dragging = false;
  if (!moved) {
    const bounds = canvas.getBoundingClientRect();
    pointer.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -((event.clientY - bounds.top) / bounds.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(planetMeshes)[0];
    if (hit) selectBody(hit.object.userData.body);
  }
});
canvas.addEventListener("wheel", event => { event.preventDefault(); targetDistance = Math.max(7, Math.min(130, targetDistance + event.deltaY * .035)); }, { passive: false });

document.querySelector("#focus-button").addEventListener("click", focusSelected);
document.querySelector("#reset-button").addEventListener("click", resetView);
document.querySelector("#slower-button").addEventListener("click", () => setSpeed(speed - .25));
document.querySelector("#faster-button").addEventListener("click", () => setSpeed(speed + .25));
document.querySelector("#pause-button").addEventListener("click", () => {
  paused = !paused;
  document.querySelector("#pause-button").setAttribute("aria-pressed", String(paused));
  document.querySelector("#pause-icon").textContent = paused ? "▶" : "Ⅱ";
  document.querySelector("#pause-label").textContent = paused ? "Resume" : "Pause";
});

buildSystem(); setupList(); selectBody(bodies[0], false); resetView(); resize(); window.addEventListener("resize", resize); animate();
