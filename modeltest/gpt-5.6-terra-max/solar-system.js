(() => {
  "use strict";

  const canvas = document.querySelector("#space-canvas");
  const context = canvas.getContext("2d");
  const bodyKind = document.querySelector("#body-kind");
  const bodyIndex = document.querySelector("#body-index");
  const bodyName = document.querySelector("#body-name");
  const bodyDescription = document.querySelector("#body-description");
  const bodyFacts = document.querySelector("#body-facts");
  const focusButton = document.querySelector("#focus-button");
  const slowerButton = document.querySelector("#slower-button");
  const pauseButton = document.querySelector("#pause-button");
  const fasterButton = document.querySelector("#faster-button");
  const resetButton = document.querySelector("#reset-button");
  const timeReadout = document.querySelector("#time-readout");
  const announcement = document.querySelector("#announcement");

  const TAU = Math.PI * 2;
  const WORLD_UP = { x: 0, y: 1, z: 0 };
  const TIME_STEPS = [0.125, 0.25, 0.5, 1, 2, 4, 8];

  const sun = {
    id: "sun",
    name: "The Sun",
    kind: "STAR / G2V",
    order: "00",
    radius: 43,
    color: "#ffd36a",
    shade: "#ef6a22",
    highlight: "#fff5c4",
    distance: "0 AU",
    year: "One galactic orbit",
    day: "25 Earth days",
    moons: "8 major worlds",
    description:
      "The system's luminous heart. Its gravity anchors every world in this miniature neighborhood.",
  };

  const planets = [
    {
      id: "mercury",
      name: "Mercury",
      kind: "TERRESTRIAL PLANET",
      order: "01",
      radius: 6,
      orbit: 75,
      orbitSpeed: 0.88,
      spinSpeed: 0.09,
      phase: 0.7,
      inclination: 0.12,
      color: "#d7c5ae",
      shade: "#66594e",
      highlight: "#fff4dd",
      distance: "0.39 AU",
      year: "88 Earth days",
      day: "59 Earth days",
      moons: "0 moons",
      surface: "craters",
      description: "A small, scarred rock racing through the solar furnace.",
    },
    {
      id: "venus",
      name: "Venus",
      kind: "TERRESTRIAL PLANET",
      order: "02",
      radius: 10,
      orbit: 108,
      orbitSpeed: 0.64,
      spinSpeed: -0.045,
      phase: 3.25,
      inclination: 0.06,
      color: "#e7b66b",
      shade: "#7d3f25",
      highlight: "#fff0b3",
      distance: "0.72 AU",
      year: "225 Earth days",
      day: "243 Earth days",
      moons: "0 moons",
      surface: "clouds",
      description: "A cloud-shrouded world where a dense atmosphere traps extraordinary heat.",
    },
    {
      id: "earth",
      name: "Earth",
      kind: "TERRESTRIAL PLANET",
      order: "03",
      radius: 12,
      orbit: 145,
      orbitSpeed: 0.49,
      spinSpeed: 1.18,
      phase: 5.1,
      inclination: 0.02,
      color: "#3e97d7",
      shade: "#123e8c",
      highlight: "#b9f4ff",
      distance: "1.00 AU",
      year: "365.25 days",
      day: "23h 56m",
      moons: "1 moon",
      surface: "continents",
      atmosphere: true,
      description: "An ocean world with a thin blue atmosphere and a familiar silver companion.",
    },
    {
      id: "mars",
      name: "Mars",
      kind: "TERRESTRIAL PLANET",
      order: "04",
      radius: 8,
      orbit: 182,
      orbitSpeed: 0.4,
      spinSpeed: 1.05,
      phase: 1.6,
      inclination: 0.08,
      color: "#d06f48",
      shade: "#6d241e",
      highlight: "#ffc39b",
      distance: "1.52 AU",
      year: "687 Earth days",
      day: "24h 37m",
      moons: "2 moons",
      surface: "craters",
      description: "A cold desert planet, rust-colored from iron minerals in its surface dust.",
    },
    {
      id: "jupiter",
      name: "Jupiter",
      kind: "GAS GIANT",
      order: "05",
      radius: 27,
      orbit: 235,
      orbitSpeed: 0.24,
      spinSpeed: 2.25,
      phase: 4.1,
      inclination: 0.03,
      color: "#ddac78",
      shade: "#794a32",
      highlight: "#ffe0af",
      distance: "5.20 AU",
      year: "11.86 Earth years",
      day: "9h 56m",
      moons: "95 moons",
      surface: "bands",
      description: "The solar system's largest planet, wrapped in fast-moving cloud bands and storms.",
    },
    {
      id: "saturn",
      name: "Saturn",
      kind: "RINGED GAS GIANT",
      order: "06",
      radius: 23,
      orbit: 285,
      orbitSpeed: 0.17,
      spinSpeed: 1.95,
      phase: 2.05,
      inclination: 0.05,
      color: "#dfc481",
      shade: "#816936",
      highlight: "#fff1b5",
      distance: "9.58 AU",
      year: "29.45 Earth years",
      day: "10h 42m",
      moons: "146 moons",
      surface: "bands",
      ring: true,
      description: "A pale gas giant encircled by an immense, glittering system of ice and rock.",
    },
    {
      id: "uranus",
      name: "Uranus",
      kind: "ICE GIANT",
      order: "07",
      radius: 17,
      orbit: 330,
      orbitSpeed: 0.11,
      spinSpeed: -0.78,
      phase: 0.28,
      inclination: 0.18,
      color: "#80d8de",
      shade: "#226b86",
      highlight: "#d5ffff",
      distance: "19.2 AU",
      year: "84 Earth years",
      day: "17h 14m",
      moons: "28 moons",
      surface: "clouds",
      description: "An ice giant tipped dramatically on its side, making each pole experience long seasons.",
    },
    {
      id: "neptune",
      name: "Neptune",
      kind: "ICE GIANT",
      order: "08",
      radius: 17,
      orbit: 376,
      orbitSpeed: 0.075,
      spinSpeed: 0.96,
      phase: 5.82,
      inclination: 0.08,
      color: "#3869d9",
      shade: "#111f7e",
      highlight: "#a9c9ff",
      distance: "30.1 AU",
      year: "164.8 Earth years",
      day: "16h 6m",
      moons: "16 moons",
      surface: "clouds",
      description: "A distant blue world with the fastest winds measured anywhere in the solar system.",
    },
  ];

  const bodies = [sun, ...planets];
  const stars = Array.from({ length: 430 }, () => ({
    x: Math.random(),
    y: Math.random(),
    size: 0.35 + Math.random() * 1.35,
    opacity: 0.18 + Math.random() * 0.75,
    twinkle: Math.random() * TAU,
    drift: 0.15 + Math.random() * 0.85,
  }));

  const state = {
    width: 0,
    height: 0,
    pixelRatio: 1,
    focalLength: 600,
    simulationTime: 0,
    speedIndex: 3,
    paused: false,
    selected: null,
    hovered: null,
    visibleBodies: [],
    pointer: null,
    touchPoints: new Map(),
    touchGesture: null,
    followSelection: false,
    camera: {
      yaw: -0.78,
      pitch: 0.46,
      distance: 635,
      target: { x: 0, y: 0, z: 0 },
      goal: {
        yaw: -0.78,
        pitch: 0.46,
        distance: 635,
        target: { x: 0, y: 0, z: 0 },
      },
    },
  };

  const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);
  const lerp = (start, end, amount) => start + (end - start) * amount;
  const subtract = (left, right) => ({
    x: left.x - right.x,
    y: left.y - right.y,
    z: left.z - right.z,
  });
  const dot = (left, right) => left.x * right.x + left.y * right.y + left.z * right.z;
  const cross = (left, right) => ({
    x: left.y * right.z - left.z * right.y,
    y: left.z * right.x - left.x * right.z,
    z: left.x * right.y - left.y * right.x,
  });
  const normalize = (vector) => {
    const length = Math.hypot(vector.x, vector.y, vector.z) || 1;
    return { x: vector.x / length, y: vector.y / length, z: vector.z / length };
  };
  const rgba = (hex, opacity) => {
    const numeric = Number.parseInt(hex.slice(1), 16);
    const red = (numeric >> 16) & 255;
    const green = (numeric >> 8) & 255;
    const blue = numeric & 255;
    return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
  };

  function resizeCanvas() {
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    state.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(state.width * state.pixelRatio);
    canvas.height = Math.round(state.height * state.pixelRatio);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    context.setTransform(state.pixelRatio, 0, 0, state.pixelRatio, 0, 0);
    state.focalLength = Math.min(state.width, state.height) * 1.08;
  }

  function orbitPosition(body, time = state.simulationTime) {
    if (body === sun) {
      return { x: 0, y: 0, z: 0 };
    }

    const angle = body.phase + time * body.orbitSpeed;
    return {
      x: Math.cos(angle) * body.orbit,
      y: Math.sin(angle) * body.orbit * Math.sin(body.inclination),
      z: Math.sin(angle) * body.orbit * Math.cos(body.inclination),
    };
  }

  function cameraFrame() {
    const camera = state.camera;
    const horizontalDistance = Math.cos(camera.pitch) * camera.distance;
    const position = {
      x: camera.target.x + horizontalDistance * Math.sin(camera.yaw),
      y: camera.target.y + Math.sin(camera.pitch) * camera.distance,
      z: camera.target.z + horizontalDistance * Math.cos(camera.yaw),
    };
    const forward = normalize(subtract(camera.target, position));
    const right = normalize(cross(forward, WORLD_UP));
    const up = cross(right, forward);
    return { position, forward, right, up };
  }

  function project(point, frame) {
    const relative = subtract(point, frame.position);
    const depth = dot(relative, frame.forward);
    if (depth <= 2) {
      return null;
    }

    const scale = state.focalLength / depth;
    return {
      x: state.width / 2 + dot(relative, frame.right) * scale,
      y: state.height / 2 - dot(relative, frame.up) * scale,
      depth,
      scale,
    };
  }

  function drawBackground(time) {
    const background = context.createRadialGradient(
      state.width * 0.52,
      state.height * 0.42,
      0,
      state.width * 0.52,
      state.height * 0.42,
      Math.max(state.width, state.height) * 0.72,
    );
    background.addColorStop(0, "#17245b");
    background.addColorStop(0.34, "#0b1436");
    background.addColorStop(0.78, "#050816");
    background.addColorStop(1, "#03050e");
    context.fillStyle = background;
    context.fillRect(0, 0, state.width, state.height);

    const haze = context.createRadialGradient(
      state.width * 0.3,
      state.height * 0.8,
      0,
      state.width * 0.3,
      state.height * 0.8,
      state.width * 0.8,
    );
    haze.addColorStop(0, "rgba(71, 54, 131, 0.15)");
    haze.addColorStop(1, "rgba(20, 14, 50, 0)");
    context.fillStyle = haze;
    context.fillRect(0, 0, state.width, state.height);

    for (const star of stars) {
      const shimmer = 0.78 + Math.sin(time * 0.001 * star.drift + star.twinkle) * 0.22;
      context.globalAlpha = star.opacity * shimmer;
      context.fillStyle = "#e7efff";
      context.beginPath();
      context.arc(star.x * state.width, star.y * state.height, star.size, 0, TAU);
      context.fill();
    }
    context.globalAlpha = 1;
  }

  function drawOrbit(body, frame) {
    const segments = 132;
    let drawing = false;

    context.save();
    context.beginPath();
    for (let index = 0; index <= segments; index += 1) {
      const angle = (index / segments) * TAU;
      const point = {
        x: Math.cos(angle) * body.orbit,
        y: Math.sin(angle) * body.orbit * Math.sin(body.inclination),
        z: Math.sin(angle) * body.orbit * Math.cos(body.inclination),
      };
      const projected = project(point, frame);

      if (!projected) {
        drawing = false;
        continue;
      }

      if (!drawing) {
        context.moveTo(projected.x, projected.y);
        drawing = true;
      } else {
        context.lineTo(projected.x, projected.y);
      }
    }
    context.setLineDash([2, 7]);
    context.lineWidth = state.selected === body ? 1.35 : 0.8;
    context.strokeStyle = rgba(body.color, state.selected === body ? 0.7 : 0.2);
    context.stroke();
    context.restore();
  }

  function drawSun(item, time) {
    const { point, radius } = item;
    const pulse = 1 + Math.sin(time * 0.002) * 0.045;
    const glow = context.createRadialGradient(point.x, point.y, radius * 0.08, point.x, point.y, radius * 4.3 * pulse);
    glow.addColorStop(0, "rgba(255, 241, 187, 0.98)");
    glow.addColorStop(0.12, "rgba(255, 188, 73, 0.75)");
    glow.addColorStop(0.42, "rgba(255, 117, 35, 0.18)");
    glow.addColorStop(1, "rgba(255, 108, 29, 0)");
    context.fillStyle = glow;
    context.beginPath();
    context.arc(point.x, point.y, radius * 4.3 * pulse, 0, TAU);
    context.fill();

    const surface = context.createRadialGradient(
      point.x - radius * 0.3,
      point.y - radius * 0.34,
      radius * 0.08,
      point.x,
      point.y,
      radius,
    );
    surface.addColorStop(0, "#fff8c9");
    surface.addColorStop(0.35, "#ffd66d");
    surface.addColorStop(0.74, "#ff9c31");
    surface.addColorStop(1, "#e74e1d");
    context.fillStyle = surface;
    context.beginPath();
    context.arc(point.x, point.y, radius, 0, TAU);
    context.fill();

    context.save();
    context.clip();
    context.globalAlpha = 0.22;
    context.strokeStyle = "#fff5bf";
    context.lineWidth = Math.max(0.8, radius * 0.05);
    for (let index = -2; index <= 2; index += 1) {
      const offset = Math.sin(time * 0.003 + index) * radius * 0.22;
      context.beginPath();
      context.arc(point.x + offset, point.y + index * radius * 0.27, radius * 0.82, Math.PI * 1.08, Math.PI * 1.9);
      context.stroke();
    }
    context.restore();
    context.globalAlpha = 1;
  }

  function drawSurface(body, point, radius, time) {
    const rotation = time * body.spinSpeed;
    context.save();
    context.beginPath();
    context.arc(point.x, point.y, radius, 0, TAU);
    context.clip();

    if (body.surface === "bands") {
      const shades = [rgba(body.shade, 0.24), rgba(body.highlight, 0.18), rgba(body.shade, 0.28)];
      for (let index = -2; index <= 2; index += 1) {
        const y = point.y + index * radius * 0.32 + Math.sin(rotation + index) * radius * 0.04;
        context.strokeStyle = shades[(index + 2) % shades.length];
        context.lineWidth = Math.max(1, radius * (0.12 + (index + 2) * 0.012));
        context.beginPath();
        context.ellipse(point.x, y, radius * 1.06, radius * 0.18, 0, 0, TAU);
        context.stroke();
      }
      if (body.id === "jupiter") {
        context.fillStyle = "rgba(128, 59, 36, 0.5)";
        context.beginPath();
        context.ellipse(
          point.x + Math.sin(rotation * 0.7) * radius * 0.38,
          point.y + radius * 0.2,
          radius * 0.2,
          radius * 0.1,
          -0.15,
          0,
          TAU,
        );
        context.fill();
      }
    }

    if (body.surface === "continents") {
      const marks = [
        [-0.33, -0.22, 0.22, 0.12],
        [0.22, -0.06, 0.17, 0.27],
        [-0.08, 0.35, 0.27, 0.1],
      ];
      context.fillStyle = "rgba(48, 118, 86, 0.75)";
      marks.forEach(([x, y, width, height], index) => {
        const drift = Math.sin(rotation + index * 2.3) * radius * 0.28;
        context.beginPath();
        context.ellipse(point.x + x * radius + drift, point.y + y * radius, width * radius, height * radius, index * 0.55, 0, TAU);
        context.fill();
      });
      context.strokeStyle = "rgba(231, 252, 255, 0.64)";
      context.lineWidth = Math.max(0.6, radius * 0.055);
      context.beginPath();
      context.arc(point.x - Math.sin(rotation * 0.75) * radius * 0.3, point.y, radius * 0.77, -0.7, 1.1);
      context.stroke();
    }

    if (body.surface === "craters") {
      const craters = [
        [-0.32, -0.28, 0.11],
        [0.19, -0.12, 0.08],
        [0.04, 0.3, 0.14],
        [-0.3, 0.26, 0.06],
      ];
      context.strokeStyle = rgba(body.shade, 0.5);
      context.lineWidth = Math.max(0.5, radius * 0.065);
      craters.forEach(([x, y, craterRadius], index) => {
        const drift = Math.sin(rotation + index * 1.7) * radius * 0.22;
        context.beginPath();
        context.arc(point.x + x * radius + drift, point.y + y * radius, craterRadius * radius, 0, TAU);
        context.stroke();
      });
    }

    if (body.surface === "clouds") {
      context.strokeStyle = rgba(body.highlight, 0.34);
      context.lineWidth = Math.max(0.6, radius * 0.085);
      for (let index = -2; index <= 2; index += 1) {
        const x = point.x + Math.sin(rotation * 0.85 + index * 0.7) * radius * 0.18;
        context.beginPath();
        context.arc(x, point.y + index * radius * 0.26, radius * 0.7, Math.PI * 1.14, Math.PI * 1.86);
        context.stroke();
      }
    }

    context.restore();
  }

  function drawRing(item, front) {
    const { point, radius } = item;
    context.save();
    context.translate(point.x, point.y);
    context.rotate(-0.24 + state.camera.yaw * 0.1);
    context.scale(1, 0.38);
    context.strokeStyle = front ? "rgba(255, 235, 175, 0.8)" : "rgba(182, 144, 91, 0.72)";
    context.lineWidth = Math.max(1.2, radius * 0.13);
    context.beginPath();
    if (front) {
      context.ellipse(0, 0, radius * 1.86, radius * 0.7, 0, 0, Math.PI);
    } else {
      context.ellipse(0, 0, radius * 1.86, radius * 0.7, 0, 0, TAU);
    }
    context.stroke();
    context.strokeStyle = front ? "rgba(255, 249, 216, 0.48)" : "rgba(126, 95, 67, 0.48)";
    context.lineWidth = Math.max(0.6, radius * 0.042);
    context.beginPath();
    if (front) {
      context.ellipse(0, 0, radius * 1.52, radius * 0.56, 0, 0, Math.PI);
    } else {
      context.ellipse(0, 0, radius * 1.52, radius * 0.56, 0, 0, TAU);
    }
    context.stroke();
    context.restore();
  }

  function drawPlanet(item, time) {
    const { body, point, radius } = item;
    if (body.ring) {
      drawRing(item, false);
    }

    if (body.atmosphere) {
      const atmosphere = context.createRadialGradient(point.x, point.y, radius * 0.82, point.x, point.y, radius * 1.28);
      atmosphere.addColorStop(0, "rgba(148, 230, 255, 0)");
      atmosphere.addColorStop(0.72, "rgba(91, 200, 255, 0.18)");
      atmosphere.addColorStop(1, "rgba(91, 200, 255, 0)");
      context.fillStyle = atmosphere;
      context.beginPath();
      context.arc(point.x, point.y, radius * 1.28, 0, TAU);
      context.fill();
    }

    const surface = context.createRadialGradient(
      point.x - radius * 0.34,
      point.y - radius * 0.38,
      radius * 0.08,
      point.x,
      point.y,
      radius,
    );
    surface.addColorStop(0, body.highlight);
    surface.addColorStop(0.38, body.color);
    surface.addColorStop(1, body.shade);
    context.fillStyle = surface;
    context.beginPath();
    context.arc(point.x, point.y, radius, 0, TAU);
    context.fill();

    if (radius > 3.5) {
      drawSurface(body, point, radius, time);
    }

    context.strokeStyle = rgba(body.highlight, 0.24);
    context.lineWidth = Math.max(0.5, radius * 0.045);
    context.beginPath();
    context.arc(point.x, point.y, radius * 0.98, 0, TAU);
    context.stroke();

    if (body.ring) {
      drawRing(item, true);
    }
  }

  function drawSelection(item) {
    const { body, point, radius } = item;
    const selected = state.selected === body;
    const hovered = state.hovered === body;
    if (!selected && !hovered) {
      return;
    }

    context.save();
    context.strokeStyle = selected ? "#ffe19b" : "rgba(229, 240, 255, 0.8)";
    context.lineWidth = selected ? 1.4 : 1;
    context.setLineDash(selected ? [] : [3, 3]);
    context.beginPath();
    context.arc(point.x, point.y, radius + (selected ? 8 : 5), 0, TAU);
    context.stroke();
    context.restore();
  }

  function drawLabel(item) {
    const { body, point, radius } = item;
    const prominent = state.selected === body || state.hovered === body;
    if (body === sun || (radius < 3.8 && !prominent)) {
      return;
    }

    const text = body.name.toUpperCase();
    context.save();
    context.font = `${prominent ? 700 : 600} ${prominent ? 11 : 9}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
    const textWidth = context.measureText(text).width;
    const labelX = clamp(point.x - textWidth / 2, 8, state.width - textWidth - 8);
    const labelY = point.y + radius + (prominent ? 20 : 15);
    context.globalAlpha = prominent ? 1 : 0.5;
    context.fillStyle = prominent ? "#fff1c8" : "#bbcae9";
    context.fillText(text, labelX, labelY);
    context.restore();
  }

  function buildVisibleBodies(frame) {
    state.visibleBodies = bodies
      .map((body) => {
        const world = orbitPosition(body);
        const point = project(world, frame);
        if (!point) {
          return null;
        }
        return {
          body,
          world,
          point,
          radius: Math.max(body === sun ? 6 : 2, body.radius * point.scale),
        };
      })
      .filter(Boolean);
  }

  function drawScene(time) {
    const frame = cameraFrame();
    drawBackground(time);
    planets.forEach((body) => drawOrbit(body, frame));
    buildVisibleBodies(frame);

    const renderedBodies = [...state.visibleBodies].sort((left, right) => right.point.depth - left.point.depth);
    renderedBodies.forEach((item) => {
      if (item.body === sun) {
        drawSun(item, time);
      } else {
        drawPlanet(item, time);
      }
    });
    renderedBodies.forEach(drawSelection);
    renderedBodies.forEach(drawLabel);

    const earth = state.visibleBodies.find((item) => item.body.id === "earth");
    if (earth && earth.radius > 2) {
      const moonPosition = {
        x: earth.world.x + Math.cos(state.simulationTime * 1.6) * 21,
        y: earth.world.y + Math.sin(state.simulationTime * 1.6) * 5,
        z: earth.world.z + Math.sin(state.simulationTime * 1.6) * 21,
      };
      const moonPoint = project(moonPosition, frame);
      if (moonPoint) {
        const moonRadius = Math.max(1.25, moonPoint.scale * 2.5);
        context.fillStyle = "#dce7eb";
        context.beginPath();
        context.arc(moonPoint.x, moonPoint.y, moonRadius, 0, TAU);
        context.fill();
      }
    }

    canvas.style.cursor = state.pointer ? "grabbing" : state.hovered ? "pointer" : "grab";
  }

  function updateCamera(deltaSeconds) {
    const camera = state.camera;
    if (state.selected && state.followSelection) {
      camera.goal.target = orbitPosition(state.selected);
    }

    const smoothing = 1 - Math.exp(-deltaSeconds * 5.5);
    camera.yaw = lerp(camera.yaw, camera.goal.yaw, smoothing);
    camera.pitch = lerp(camera.pitch, camera.goal.pitch, smoothing);
    camera.distance = lerp(camera.distance, camera.goal.distance, smoothing);
    camera.target.x = lerp(camera.target.x, camera.goal.target.x, smoothing);
    camera.target.y = lerp(camera.target.y, camera.goal.target.y, smoothing);
    camera.target.z = lerp(camera.target.z, camera.goal.target.z, smoothing);
  }

  function setFacts(facts) {
    bodyFacts.replaceChildren();
    facts.forEach(([label, value]) => {
      const item = document.createElement("div");
      const term = document.createElement("dt");
      const detail = document.createElement("dd");
      term.textContent = label;
      detail.textContent = value;
      item.append(term, detail);
      bodyFacts.append(item);
    });
  }

  function updateInspector(body) {
    if (!body) {
      bodyKind.textContent = "AWAITING SELECTION";
      bodyIndex.textContent = "--";
      bodyName.textContent = "Choose a world";
      bodyDescription.textContent =
        "Click a planet in the field to focus the camera and bring its vital statistics into view.";
      setFacts([
        ["Camera", "Free flight"],
        ["Time", "Adjustable"],
      ]);
      focusButton.hidden = true;
      return;
    }

    bodyKind.textContent = body.kind;
    bodyIndex.textContent = body.order;
    bodyName.textContent = body.name;
    bodyDescription.textContent = body.description;
    setFacts([
      ["Orbital radius", body.distance],
      ["Orbital period", body.year],
      ["Rotation", body.day],
      ["Satellites", body.moons],
    ]);
    focusButton.hidden = false;
  }

  function focusBody(body) {
    state.selected = body;
    state.followSelection = true;
    state.camera.goal.target = orbitPosition(body);
    state.camera.goal.distance = body === sun ? 225 : clamp(body.radius * 11 + 105, 130, 330);
    updateInspector(body);
    announcement.textContent = `${body.name} selected. Camera is now focusing on it.`;
  }

  function resetView() {
    state.selected = null;
    state.hovered = null;
    state.followSelection = false;
    state.camera.goal = {
      yaw: -0.78,
      pitch: 0.46,
      distance: 635,
      target: { x: 0, y: 0, z: 0 },
    };
    updateInspector(null);
    announcement.textContent = "Camera view reset to the full solar system.";
  }

  function updateTimeControls() {
    const speed = TIME_STEPS[state.speedIndex];
    timeReadout.textContent = `${speed.toFixed(speed < 1 ? 3 : 2)}x`;
    pauseButton.textContent = state.paused ? "Resume" : "Pause";
    pauseButton.setAttribute("aria-pressed", String(state.paused));
    slowerButton.disabled = state.speedIndex === 0;
    fasterButton.disabled = state.speedIndex === TIME_STEPS.length - 1;
  }

  function changeSpeed(amount) {
    const nextIndex = clamp(state.speedIndex + amount, 0, TIME_STEPS.length - 1);
    if (nextIndex !== state.speedIndex) {
      state.speedIndex = nextIndex;
      state.paused = false;
      updateTimeControls();
      announcement.textContent = `Simulation speed set to ${TIME_STEPS[state.speedIndex]} times.`;
    }
  }

  function getCanvasPoint(event) {
    const bounds = canvas.getBoundingClientRect();
    return {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    };
  }

  function pickBody(point) {
    const candidates = state.visibleBodies
      .filter((item) => {
        const distance = Math.hypot(point.x - item.point.x, point.y - item.point.y);
        return distance <= item.radius + 8;
      })
      .sort((left, right) => left.point.depth - right.point.depth);
    return candidates[0]?.body || null;
  }

  function panCamera(deltaX, deltaY, baseTarget = state.camera.goal.target, baseDistance = state.camera.goal.distance) {
    const frame = cameraFrame();
    const movementScale = baseDistance / state.focalLength;
    state.camera.goal.target = {
      x: baseTarget.x - frame.right.x * deltaX * movementScale + frame.up.x * deltaY * movementScale,
      y: baseTarget.y - frame.right.y * deltaX * movementScale + frame.up.y * deltaY * movementScale,
      z: baseTarget.z - frame.right.z * deltaX * movementScale + frame.up.z * deltaY * movementScale,
    };
    state.followSelection = false;
  }

  function rotateCamera(deltaX, deltaY) {
    state.camera.goal.yaw -= deltaX * 0.006;
    state.camera.goal.pitch = clamp(state.camera.goal.pitch - deltaY * 0.0055, -1.22, 1.22);
  }

  function beginTouchGesture() {
    const points = [...state.touchPoints.values()];
    if (points.length !== 2) {
      return;
    }
    const [first, second] = points;
    state.touchGesture = {
      distance: Math.hypot(second.x - first.x, second.y - first.y),
      midpoint: {
        x: (first.x + second.x) / 2,
        y: (first.y + second.y) / 2,
      },
      target: { ...state.camera.goal.target },
      cameraDistance: state.camera.goal.distance,
    };
  }

  function handleTouchGesture() {
    const points = [...state.touchPoints.values()];
    if (points.length !== 2 || !state.touchGesture) {
      return;
    }
    const [first, second] = points;
    const midpoint = {
      x: (first.x + second.x) / 2,
      y: (first.y + second.y) / 2,
    };
    const distance = Math.max(1, Math.hypot(second.x - first.x, second.y - first.y));
    const ratio = state.touchGesture.distance / distance;
    state.camera.goal.distance = clamp(state.touchGesture.cameraDistance * ratio, 85, 1400);
    panCamera(
      midpoint.x - state.touchGesture.midpoint.x,
      midpoint.y - state.touchGesture.midpoint.y,
      state.touchGesture.target,
      state.touchGesture.cameraDistance,
    );
  }

  function releasePointerCapture(pointerId) {
    if (canvas.hasPointerCapture(pointerId)) {
      canvas.releasePointerCapture(pointerId);
    }
  }

  canvas.addEventListener("pointerdown", (event) => {
    const point = getCanvasPoint(event);
    canvas.setPointerCapture(event.pointerId);

    if (event.pointerType === "touch") {
      state.touchPoints.set(event.pointerId, point);
      if (state.touchPoints.size === 1) {
        state.pointer = {
          id: event.pointerId,
          x: point.x,
          y: point.y,
          startX: point.x,
          startY: point.y,
          moved: false,
          button: 0,
        };
      } else if (state.touchPoints.size === 2) {
        state.pointer = null;
        beginTouchGesture();
      }
      return;
    }

    if (event.button > 2) {
      return;
    }

    state.pointer = {
      id: event.pointerId,
      x: point.x,
      y: point.y,
      startX: point.x,
      startY: point.y,
      moved: false,
      button: event.button,
    };
  });

  canvas.addEventListener("pointermove", (event) => {
    const point = getCanvasPoint(event);

    if (event.pointerType === "touch") {
      if (!state.touchPoints.has(event.pointerId)) {
        return;
      }
      state.touchPoints.set(event.pointerId, point);
      if (state.touchPoints.size === 2) {
        handleTouchGesture();
        return;
      }
    }

    const pointer = state.pointer;
    if (pointer && pointer.id === event.pointerId) {
      const deltaX = point.x - pointer.x;
      const deltaY = point.y - pointer.y;
      pointer.moved ||= Math.hypot(point.x - pointer.startX, point.y - pointer.startY) > 5;

      if (event.shiftKey || pointer.button === 1 || pointer.button === 2) {
        panCamera(deltaX, deltaY);
      } else {
        rotateCamera(deltaX, deltaY);
      }

      pointer.x = point.x;
      pointer.y = point.y;
      return;
    }

    state.hovered = pickBody(point);
  });

  canvas.addEventListener("pointerup", (event) => {
    const point = getCanvasPoint(event);

    if (event.pointerType === "touch") {
      const wasSingleTouch = state.touchPoints.size === 1;
      const pointer = state.pointer;
      state.touchPoints.delete(event.pointerId);
      releasePointerCapture(event.pointerId);

      if (wasSingleTouch && pointer && !pointer.moved) {
        const picked = pickBody(point);
        if (picked) {
          focusBody(picked);
        }
      }

      if (state.touchPoints.size === 1) {
        const [remainingId, remainingPoint] = state.touchPoints.entries().next().value;
        state.pointer = {
          id: remainingId,
          x: remainingPoint.x,
          y: remainingPoint.y,
          startX: remainingPoint.x,
          startY: remainingPoint.y,
          moved: false,
          button: 0,
        };
      } else {
        state.pointer = null;
      }
      state.touchGesture = null;
      return;
    }

    const pointer = state.pointer;
    releasePointerCapture(event.pointerId);
    if (!pointer || pointer.id !== event.pointerId) {
      return;
    }

    if (!pointer.moved && pointer.button === 0) {
      const picked = pickBody(point);
      if (picked) {
        focusBody(picked);
      }
    }
    state.pointer = null;
  });

  canvas.addEventListener("pointercancel", (event) => {
    state.touchPoints.delete(event.pointerId);
    if (state.pointer?.id === event.pointerId) {
      state.pointer = null;
    }
    if (state.touchPoints.size < 2) {
      state.touchGesture = null;
    }
    releasePointerCapture(event.pointerId);
  });

  canvas.addEventListener("pointerleave", () => {
    if (!state.pointer) {
      state.hovered = null;
    }
  });

  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    state.camera.goal.distance = clamp(
      state.camera.goal.distance * Math.exp(event.deltaY * 0.001),
      85,
      1400,
    );
  }, { passive: false });

  canvas.addEventListener("contextmenu", (event) => event.preventDefault());

  slowerButton.addEventListener("click", () => changeSpeed(-1));
  fasterButton.addEventListener("click", () => changeSpeed(1));
  pauseButton.addEventListener("click", () => {
    state.paused = !state.paused;
    updateTimeControls();
    announcement.textContent = state.paused ? "Simulation paused." : "Simulation resumed.";
  });
  resetButton.addEventListener("click", resetView);
  focusButton.addEventListener("click", () => {
    if (state.selected) {
      focusBody(state.selected);
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.target instanceof HTMLButtonElement) {
      return;
    }

    if (event.code === "Space") {
      event.preventDefault();
      state.paused = !state.paused;
      updateTimeControls();
    } else if (event.key === "[" || event.key === "-") {
      changeSpeed(-1);
    } else if (event.key === "]" || event.key === "=") {
      changeSpeed(1);
    } else if (event.key.toLowerCase() === "r") {
      resetView();
    } else if (event.key === "Escape") {
      state.selected = null;
      state.followSelection = false;
      updateInspector(null);
      announcement.textContent = "Selection cleared.";
    }
  });

  resizeCanvas();
  updateInspector(null);
  updateTimeControls();
  window.addEventListener("resize", resizeCanvas);

  let previousFrameTime = performance.now();
  function animate(frameTime) {
    const deltaSeconds = Math.min((frameTime - previousFrameTime) / 1000, 0.05);
    previousFrameTime = frameTime;
    if (!state.paused) {
      state.simulationTime += deltaSeconds * TIME_STEPS[state.speedIndex];
    }
    updateCamera(deltaSeconds);
    drawScene(frameTime);
    window.requestAnimationFrame(animate);
  }

  window.requestAnimationFrame(animate);
})();
