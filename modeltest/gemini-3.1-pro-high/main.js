// Setup scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.set(0, 100, 250);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 1000;
controls.minDistance = 10;

// Lighting
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const sunLight = new THREE.PointLight(0xffffff, 2, 2000);
scene.add(sunLight);

// Starfield background
function createStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, sizeAttenuation: true });
    
    const starsVertices = [];
    for (let i = 0; i < 5000; i++) {
        const x = THREE.MathUtils.randFloatSpread(4000);
        const y = THREE.MathUtils.randFloatSpread(4000);
        const z = THREE.MathUtils.randFloatSpread(4000);
        if (Math.abs(x) < 500 && Math.abs(y) < 500 && Math.abs(z) < 500) continue;
        starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);
}
createStars();

// Data
const planetsData = [
    { name: "Mercury", color: 0x8c8c8c, radius: 2, distance: 30, speed: 0.04, rotationSpeed: 0.01, info: "The smallest planet in our solar system and closest to the Sun." },
    { name: "Venus", color: 0xe3bb76, radius: 4, distance: 45, speed: 0.015, rotationSpeed: 0.005, info: "Spins slowly in the opposite direction from most planets." },
    { name: "Earth", color: 0x2b82c9, radius: 4.2, distance: 65, speed: 0.01, rotationSpeed: 0.02, info: "Our home planet is the only place we know of so far that's inhabited by living things." },
    { name: "Mars", color: 0xc1440e, radius: 2.2, distance: 85, speed: 0.008, rotationSpeed: 0.02, info: "A dusty, cold, desert world with a very thin atmosphere." },
    { name: "Jupiter", color: 0xd39c7e, radius: 12, distance: 130, speed: 0.002, rotationSpeed: 0.04, info: "More than twice as massive as the other planets of our solar system combined." },
    { name: "Saturn", color: 0xead6b8, radius: 10, distance: 180, speed: 0.0009, rotationSpeed: 0.038, info: "Adorned with a dazzling, complex system of icy rings.", hasRings: true },
    { name: "Uranus", color: 0x4b70dd, radius: 7, distance: 230, speed: 0.0004, rotationSpeed: 0.03, info: "Rotates at a nearly 90-degree angle from the plane of its orbit." },
    { name: "Neptune", color: 0x274687, radius: 6.8, distance: 280, speed: 0.0001, rotationSpeed: 0.032, info: "Dark, cold, and whipped by supersonic winds." }
];

// Objects
const sunGeometry = new THREE.SphereGeometry(15, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

const sunGlowGeometry = new THREE.SphereGeometry(16, 32, 32);
const sunGlowMaterial = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.3 });
const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
scene.add(sunGlow);

const planets = [];
const planetMeshes = [];

planetsData.forEach(data => {
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);
    
    const pathGeometry = new THREE.RingGeometry(data.distance - 0.1, data.distance + 0.1, 64);
    const pathMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1, side: THREE.DoubleSide });
    const orbitPath = new THREE.Mesh(pathGeometry, pathMaterial);
    orbitPath.rotation.x = Math.PI / 2;
    scene.add(orbitPath);

    const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
    const material = new THREE.MeshStandardMaterial({ 
        color: data.color,
        roughness: 0.7,
        metalness: 0.1
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = data.distance;
    
    if (data.hasRings) {
        const ringGeo = new THREE.RingGeometry(data.radius * 1.4, data.radius * 2.2, 32);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0xceb8b8, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2 + 0.2;
        mesh.add(ringMesh);
    }
    
    mesh.userData = { name: data.name, info: data.info };
    orbitGroup.add(mesh);
    
    planets.push({
        group: orbitGroup,
        mesh: mesh,
        speed: data.speed,
        rotationSpeed: data.rotationSpeed,
        distance: data.distance
    });
    planetMeshes.push(mesh);
});

// Interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let targetPlanet = null;

const infoPanel = document.getElementById('info-panel');
const planetNameEl = document.getElementById('planet-name');
const planetInfoEl = document.getElementById('planet-info');

window.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON' || event.target.closest('#ui-layer')) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([sun, ...planetMeshes]);

    if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object === sun) {
            targetPlanet = sun;
            showInfo("Sun", "The star at the center of the Solar System.");
        } else {
            targetPlanet = object;
            showInfo(object.userData.name, object.userData.info);
        }
    } else {
        targetPlanet = null;
        hideInfo();
    }
});

function showInfo(name, info) {
    planetNameEl.textContent = name;
    planetInfoEl.textContent = info;
    infoPanel.classList.remove('hidden');
}

function hideInfo() {
    infoPanel.classList.add('hidden');
}

// Time controls
let timeSpeed = 1;

document.getElementById('btn-pause').addEventListener('click', (e) => setSpeed(e.target, 0));
document.getElementById('btn-slow').addEventListener('click', (e) => setSpeed(e.target, 0.2));
document.getElementById('btn-normal').addEventListener('click', (e) => setSpeed(e.target, 1));
document.getElementById('btn-fast').addEventListener('click', (e) => setSpeed(e.target, 5));
document.getElementById('btn-reset').addEventListener('click', () => {
    targetPlanet = null;
    hideInfo();
    camera.position.set(0, 100, 250);
    controls.target.set(0, 0, 0);
});

function setSpeed(button, speed) {
    timeSpeed = speed;
    document.querySelectorAll('#controls button:not(#btn-reset)').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    const timeMultiplier = delta * 60 * timeSpeed;

    sun.rotation.y += 0.005 * timeMultiplier;

    planets.forEach(p => {
        p.group.rotation.y += p.speed * timeMultiplier;
        p.mesh.rotation.y += p.rotationSpeed * timeMultiplier;
    });

    if (targetPlanet) {
        const targetPosition = new THREE.Vector3();
        targetPlanet.getWorldPosition(targetPosition);
        controls.target.lerp(targetPosition, 0.1);
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();
