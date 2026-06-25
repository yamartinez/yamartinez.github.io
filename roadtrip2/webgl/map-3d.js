import * as THREE from "./vendor/three.module.min.js";

(function () {
  "use strict";

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

  window.initJourneyVisual = function (content) {
    var stage = content.querySelector("[data-journey-stage]");
    var canvas = document.getElementById("route-canvas");
    if (!stage || !canvas || !window.ROUTE_POINTS) return;

    stage.setAttribute("data-mode", "3d");

    var trackEl = content.querySelector("[data-journey-track]");
    var dayText = content.querySelector("[data-journey-day-text]");
    var progressFill = content.querySelector("[data-journey-progress-fill]");

    var SCALE = 1 / 18;
    var points3d = window.ROUTE_POINTS.map(function (p, i) {
      var x = (p[0] - 300) * SCALE;
      var z = -p[1] * SCALE;
      var y = Math.sin(i * 0.9) * 1.3 + Math.cos(i * 0.45) * 0.7;
      return new THREE.Vector3(x, y, z);
    });

    var curve = new THREE.CatmullRomCurve3(points3d, false, "catmullrom", 0.5);
    var SEGMENTS = 500;
    var samples = curve.getSpacedPoints(SEGMENTS);

    var zs = samples.map(function (p) { return p.z; });
    var zMin = Math.min.apply(null, zs);
    var zMax = Math.max.apply(null, zs);

    /* ---------------- Scene ---------------- */
    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060a10, 0.018);

    var camera = new THREE.PerspectiveCamera(55, 1, 0.05, 220);

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x060a10, 1);

    scene.add(new THREE.AmbientLight(0x3a4a5e, 1.3));
    var sun = new THREE.DirectionalLight(0x9fc7d6, 0.7);
    sun.position.set(6, 14, 8);
    scene.add(sun);

    /* dim full-route guide line */
    var dimGeo = new THREE.BufferGeometry().setFromPoints(samples);
    var dimMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 });
    scene.add(new THREE.Line(dimGeo, dimMat));

    /* growing trail tube */
    var trailMat = new THREE.MeshStandardMaterial({
      color: 0x34c2cf, emissive: 0x0d3a3f, emissiveIntensity: 0.7,
      roughness: 0.4, metalness: 0.1
    });
    var trailMesh = new THREE.Mesh(new THREE.BufferGeometry(), trailMat);
    scene.add(trailMesh);

    function rebuildTrail(progress) {
      var n = Math.max(2, Math.round(progress * SEGMENTS) + 1);
      var sub = samples.slice(0, n);
      if (sub.length < 2) sub = [samples[0], samples[0].clone().add(new THREE.Vector3(0, 0, -0.01))];
      var subCurve = new THREE.CatmullRomCurve3(sub);
      var tubeGeo = new THREE.TubeGeometry(subCurve, Math.min(n, SEGMENTS), 0.1, 6, false);
      trailMesh.geometry.dispose();
      trailMesh.geometry = tubeGeo;
    }

    /* marker + glow */
    var marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    scene.add(marker);
    var glow = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x9fe9ef, transparent: true, opacity: 0.32 })
    );
    scene.add(glow);

    /* stop dots */
    var stops = Array.prototype.slice.call(content.querySelectorAll(".journey-card[data-stop-frac]")).map(function (card) {
      return { frac: parseFloat(card.getAttribute("data-stop-frac")), el: card };
    });
    var gap = stops.length > 1 ? 1 / (stops.length - 1) : 1;
    var cardThreshold = gap * 0.58;

    var DIM_COLOR = new THREE.Color(0x4d5a6c);
    var LIT_COLOR = new THREE.Color(0xffe9c2);
    stops.forEach(function (stop) {
      var pt = curve.getPointAt(stop.frac);
      var tangent = curve.getTangentAt(stop.frac);
      var side = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();
      var dotPos = pt.clone().addScaledVector(side, 1.8);
      var mat = new THREE.MeshBasicMaterial({ color: DIM_COLOR.clone() });
      var dot = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), mat);
      dot.position.copy(dotPos);
      scene.add(dot);
      stop.mat = mat;
      stop.lit = false;
    });

    /* low-poly ground */
    var groundDepth = zMax - zMin + 24;
    var groundGeo = new THREE.PlaneGeometry(60, groundDepth, 28, 70);
    groundGeo.rotateX(-Math.PI / 2);
    var gpos = groundGeo.attributes.position;
    for (var i = 0; i < gpos.count; i++) {
      var gx = gpos.getX(i), gz = gpos.getZ(i);
      var h = Math.sin(gx * 0.15) * 0.6 + Math.sin(gz * 0.06 + 1.3) * 1.1 + Math.sin((gx + gz) * 0.05) * 0.4;
      gpos.setY(i, h - 3.4);
    }
    groundGeo.computeVertexNormals();
    var groundMesh = new THREE.Mesh(groundGeo, new THREE.MeshStandardMaterial({
      color: 0x0b1622, roughness: 1, metalness: 0, flatShading: true
    }));
    groundMesh.position.z = (zMin + zMax) / 2;
    scene.add(groundMesh);

    /* drifting atmosphere dust */
    var dustCount = 160;
    var dustPos = new Float32Array(dustCount * 3);
    for (var d = 0; d < dustCount; d++) {
      dustPos[d * 3] = (Math.random() - 0.5) * 40;
      dustPos[d * 3 + 1] = Math.random() * 14 - 2;
      dustPos[d * 3 + 2] = zMin - 10 + Math.random() * (zMax - zMin + 20);
    }
    var dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    var dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
      color: 0xbfe9ef, size: 0.12, transparent: true, opacity: 0.5
    }));
    scene.add(dust);

    /* location label lookup */
    var beats = Array.prototype.slice.call(content.querySelectorAll(".journey-beat[data-loc]"));
    var locEntries = beats.map(function (beat) {
      var stopEl = beat.querySelector("[data-stop-frac]");
      return {
        frac: stopEl ? parseFloat(stopEl.getAttribute("data-stop-frac")) : 0,
        loc: beat.getAttribute("data-loc")
      };
    });
    function nearestLoc(progress) {
      var best = locEntries[0], bestDist = Infinity;
      for (var j = 0; j < locEntries.length; j++) {
        var dd = Math.abs(locEntries[j].frac - progress);
        if (dd < bestDist) { bestDist = dd; best = locEntries[j]; }
      }
      return best;
    }

    function resize() {
      var w = Math.max(1, stage.clientWidth);
      var h = Math.max(1, stage.clientHeight);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    function computeProgress() {
      var rect = trackEl.getBoundingClientRect();
      var total = trackEl.offsetHeight - window.innerHeight;
      if (total <= 0) return rect.top <= 0 ? 1 : 0;
      return clamp(-rect.top / total, 0, 1);
    }

    var lastProgress = 0;

    function render(progress) {
      lastProgress = progress;
      var pt = curve.getPointAt(progress);
      var tangent = curve.getTangentAt(progress);

      marker.position.copy(pt);
      glow.position.copy(pt);

      var behind = clamp(progress - 0.02, 0, 1);
      var camPt = curve.getPointAt(behind);
      camera.position.set(camPt.x, camPt.y + 1.0, camPt.z);
      var lookTarget = pt.clone().add(tangent.clone().multiplyScalar(2));
      lookTarget.y += 0.25;
      camera.lookAt(lookTarget);

      rebuildTrail(progress);

      var minDist = Infinity;
      stops.forEach(function (stop) {
        var dd = Math.abs(progress - stop.frac);
        if (dd < minDist) minDist = dd;
        stop.el.classList.toggle("is-active", dd < cardThreshold);
        var shouldLight = progress + 0.002 >= stop.frac;
        if (shouldLight !== stop.lit) {
          stop.lit = shouldLight;
          stop.mat.color.copy(shouldLight ? LIT_COLOR : DIM_COLOR);
        }
      });

      if (dayText) dayText.textContent = nearestLoc(progress).loc;
      if (progressFill) progressFill.style.height = (progress * 100) + "%";

      renderer.render(scene, camera);
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        render(computeProgress());
        ticking = false;
      });
    }

    var active = false;
    var rafId = null;
    function idleLoop() {
      dust.rotation.y += 0.0006;
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(idleLoop);
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          if (!active) {
            active = true;
            window.addEventListener("scroll", onScroll, { passive: true });
            rafId = requestAnimationFrame(idleLoop);
          }
        } else if (active) {
          active = false;
          window.removeEventListener("scroll", onScroll);
          if (rafId) cancelAnimationFrame(rafId);
        }
      });
    }, { threshold: 0 });
    observer.observe(content.querySelector("[data-journey]"));

    render(computeProgress());
  };
})();
