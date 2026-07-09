import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Setup Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 50, 100);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 5;
controls.maxDistance = 500;

// Lighting
const ambientLight = new THREE.AmbientLight(0x222222);
scene.add(ambientLight);

const sunLight = new THREE.PointLight(0xffffff, 2.5, 300);
sunLight.position.set(0, 0, 0);
sunLight.castShadow = true;
scene.add(sunLight);

// Starfield Background
function createStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
    const starVertices = [];
    for (let i = 0; i < 2000; i++) {
        const x = (Math.random() - 0.5) * 600;
        const y = (Math.random() - 0.5) * 600;
        const z = (Math.random() - 0.5) * 600;
        // Keep stars away from the center
        if (Math.abs(x) < 50 && Math.abs(y) < 50 && Math.abs(z) < 50) continue;
        starVertices.push(x, y, z);
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}
createStars();

// Planet Data
const celestialBodies = [
    { name: 'Sun', radius: 10, distance: 0, speed: 0, color: 0xffcc00, isSun: true, info: 'The star at the center of the Solar System.' },
    { name: 'Mercury', radius: 1.2, distance: 15, speed: 0.04, color: 0xaaaaaa, info: 'The smallest planet in our solar system and nearest to the Sun.' },
    { name: 'Venus', radius: 2.2, distance: 22, speed: 0.015, color: 0xe3bb76, info: 'Spinning in the opposite direction to most planets, Venus is the hottest planet.' },
    { name: 'Earth', radius: 2.4, distance: 30, speed: 0.01, color: 0x2b82c9, info: 'Our home planet is the only place we know of so far thats inhabited by living things.' },
    { name: 'Mars', radius: 1.6, distance: 40, speed: 0.008, color: 0xc1440e, info: 'A dusty, cold, desert world with a very thin atmosphere.' },
    { name: 'Jupiter', radius: 5.5, distance: 60, speed: 0.002, color: 0xd39c7e, info: 'More than twice as massive than the other planets of our solar system combined.' },
    { name: 'Saturn', radius: 4.8, distance: 80, speed: 0.0009, color: 0xead6b8, hasRings: true, info: 'Adorned with a dazzling, complex system of icy rings.' },
    { name: 'Uranus', radius: 3.2, distance: 100, speed: 0.0004, color: 0x4b70dd, info: 'An ice giant with a unique tilt that makes it appear to spin on its side.' },
    { name: 'Neptune', radius: 3.1, distance: 120, speed: 0.0001, color: 0x274687, info: 'The most distant major planet orbiting our Sun.' }
];

const planets = [];
const group = new THREE.Group();
scene.add(group);

const textureLoader = new THREE.TextureLoader();

celestialBodies.forEach(body => {
    // Geometry & Material
    const geometry = new THREE.SphereGeometry(body.radius, 32, 32);
    let material;
    
    if (body.isSun) {
        material = new THREE.MeshBasicMaterial({ color: body.color });
    } else {
        material = new THREE.MeshStandardMaterial({ 
            color: body.color,
            roughness: 0.7,
            metalness: 0.2
        });
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = !body.isSun;
    mesh.receiveShadow = !body.isSun;
    mesh.userData = body;

    // Orbit Path
    if (!body.isSun) {
        const pathGeometry = new THREE.BufferGeometry();
        const pathPoints = [];
        for (let i = 0; i <= 64; i++) {
            const angle = (i / 64) * Math.PI * 2;
            pathPoints.push(Math.cos(angle) * body.distance, 0, Math.sin(angle) * body.distance);
        }
        pathGeometry.setAttribute('position', new THREE.Float32BufferAttribute(pathPoints, 3));
        const pathMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 });
        const path = new THREE.LineLoop(pathGeometry, pathMaterial);
        group.add(path);
    }

    // Rings (for Saturn)
    if (body.hasRings) {
        const ringGeometry = new THREE.RingGeometry(body.radius * 1.5, body.radius * 2.2, 32);
        const ringMaterial = new THREE.MeshStandardMaterial({ 
            color: body.color, 
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2 - 0.2;
        ring.castShadow = true;
        ring.receiveShadow = true;
        mesh.add(ring);
    }

    // Wrapper object for revolution (orbit)
    const pivot = new THREE.Object3D();
    mesh.position.set(body.distance, 0, 0);
    pivot.add(mesh);
    group.add(pivot);

    planets.push({ mesh, pivot, body });
});

// UI & Interaction Setup
let timeScale = 1;
let isPaused = false;
let focusedPlanet = null;

const btnSpeedDown = document.getElementById('speed-down');
const btnPlayPause = document.getElementById('play-pause');
const btnSpeedUp = document.getElementById('speed-up');
const btnReset = document.getElementById('reset-view');
const infoPanel = document.getElementById('info-panel');
const nameEl = document.getElementById('planet-name');
const infoEl = document.getElementById('planet-info');

btnSpeedDown.addEventListener('click', () => { timeScale = Math.max(0.1, timeScale / 2); });
btnSpeedUp.addEventListener('click', () => { timeScale = Math.min(20, timeScale * 2); });
btnPlayPause.addEventListener('click', () => {
    isPaused = !isPaused;
    btnPlayPause.textContent = isPaused ? 'Play' : 'Pause';
});
btnReset.addEventListener('click', () => {
    focusedPlanet = null;
    controls.target.set(0, 0, 0);
    camera.position.set(0, 50, 100);
    infoPanel.classList.add('hidden');
});

// Raycaster for Selection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    // Ignore UI clicks
    if (event.target.tagName === 'BUTTON' || event.target.closest('#info-panel')) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));

    if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        focusOnPlanet(clickedMesh);
    }
});

function focusOnPlanet(mesh) {
    focusedPlanet = mesh;
    const bodyInfo = mesh.userData;
    
    // Show info
    nameEl.textContent = bodyInfo.name;
    infoEl.textContent = bodyInfo.info;
    infoPanel.classList.remove('hidden');
}

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (!isPaused) {
        planets.forEach(p => {
            // Orbit (Revolution)
            if (!p.body.isSun) {
                p.pivot.rotation.y -= p.body.speed * timeScale;
            }
            // Rotation
            p.mesh.rotation.y += 0.02 * timeScale;
        });
    }

    if (focusedPlanet) {
        const targetPosition = new THREE.Vector3();
        focusedPlanet.getWorldPosition(targetPosition);
        controls.target.lerp(targetPosition, 0.1);
        
        // Also move camera somewhat closer
        const offset = targetPosition.clone().add(new THREE.Vector3(0, focusedPlanet.userData.radius * 2, focusedPlanet.userData.radius * 5));
        camera.position.lerp(offset, 0.05);
    }

    controls.update();
    renderer.render(scene, camera);
}

// Window resize handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
