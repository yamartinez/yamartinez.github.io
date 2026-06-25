(function () {
  "use strict";

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

  function haversine(a, b) {
    var R = 6371000;
    var toRad = function (d) { return d * Math.PI / 180; };
    var dLat = toRad(b[0] - a[0]);
    var dLon = toRad(b[1] - a[1]);
    var lat1 = toRad(a[0]), lat2 = toRad(b[0]);
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  window.initJourneyVisual = function (content) {
    var stage = content.querySelector("[data-journey-stage]");
    var mapEl = document.getElementById("route-map");
    if (!stage || !mapEl || !window.ROUTE_LATLNGS) return;

    var trackEl = content.querySelector("[data-journey-track]");
    var dayText = content.querySelector("[data-journey-day-text]");
    var progressFill = content.querySelector("[data-journey-progress-fill]");

    var pts = window.ROUTE_LATLNGS;
    var cum = [0];
    for (var i = 1; i < pts.length; i++) cum.push(cum[i - 1] + haversine(pts[i - 1], pts[i]));
    var totalDist = cum[cum.length - 1];

    function getPointAtFrac(f) {
      f = clamp(f, 0, 1);
      var target = f * totalDist;
      var lo = 0, hi = cum.length - 1;
      while (lo < hi - 1) {
        var mid = (lo + hi) >> 1;
        if (cum[mid] <= target) lo = mid; else hi = mid;
      }
      var segLen = cum[hi] - cum[lo];
      var t = segLen > 0 ? (target - cum[lo]) / segLen : 0;
      var a = pts[lo], b = pts[hi];
      return { lat: a[0] + (b[0] - a[0]) * t, lng: a[1] + (b[1] - a[1]) * t, idx: lo };
    }

    /* ---------------- Map ---------------- */
    var map = L.map(mapEl, {
      zoomControl: false,
      attributionControl: true,
      zoomSnap: 0,
      zoomDelta: 0.25,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      boxZoom: false,
      keyboard: false,
      zoomAnimation: false,
      fadeAnimation: false,
      markerZoomAnimation: false,
      inertia: false
    });

    L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
      maxZoom: 17,
      attribution: '&copy; OpenStreetMap contributors, SRTM | map style &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)'
    }).addTo(map);

    var latlngs = pts.map(function (p) { return [p[0], p[1]]; });

    L.polyline(latlngs, { color: "#ffffff", weight: 2, opacity: 0.16, interactive: false }).addTo(map);

    var trailGlow = L.polyline([], { color: "#34c2cf", weight: 9, opacity: 0.25, interactive: false, className: "route-trail-glow" }).addTo(map);
    var trailCore = L.polyline([], { color: "#7fe7ef", weight: 3, opacity: 0.9, interactive: false }).addTo(map);

    var markerGlow = L.circleMarker([latlngs[0][0], latlngs[0][1]], {
      radius: 18, color: "transparent", fillColor: "#9fe9ef", fillOpacity: 0.32, interactive: false
    }).addTo(map);
    var marker = L.circleMarker([latlngs[0][0], latlngs[0][1]], {
      radius: 6, color: "#ffffff", weight: 1.5, fillColor: "#ffffff", fillOpacity: 1, interactive: false
    }).addTo(map);

    /* ---------------- Stop dots ---------------- */
    var cards = Array.prototype.slice.call(content.querySelectorAll(".journey-card[data-stop-frac]"));
    var stops = cards.map(function (card) {
      return {
        frac: parseFloat(card.getAttribute("data-stop-frac")),
        lat: parseFloat(card.getAttribute("data-stop-lat")),
        lon: parseFloat(card.getAttribute("data-stop-lon")),
        el: card
      };
    }).filter(function (s) { return !isNaN(s.lat) && !isNaN(s.lon); });

    stops.sort(function (a, b) { return a.frac - b.frac; });
    stops.forEach(function (s, i) {
      var gapPrev = i > 0 ? s.frac - stops[i - 1].frac : Infinity;
      var gapNext = i < stops.length - 1 ? stops[i + 1].frac - s.frac : Infinity;
      var localGap = Math.min(gapPrev, gapNext);
      if (!isFinite(localGap)) localGap = 0.05;
      s.threshold = clamp(localGap * 0.45, 0.006, 0.035);
      s.zoomWindow = clamp(localGap * 0.9, 0.012, 0.07);

      var dot = L.circleMarker([s.lat, s.lon], {
        radius: 5, color: "rgba(255,255,255,0.25)", weight: 1,
        fillColor: "#4d5a6c", fillOpacity: 0.9, interactive: false
      }).addTo(map);
      s.dot = dot;
      s.lit = false;
    });

    var DIM_FILL = "#4d5a6c", LIT_FILL = "#ffe9c2";

    /* ---------------- Scroll-position -> geographic-frac remap ----------------
       Real driving distance between stops is wildly uneven (a single
       redwoods cluster spans a tiny fraction of the route; the Seattle-to-
       Oregon-coast leg spans a huge one), but beats don't have uniform
       scroll height either ("min-height: 64vh" plus variable content, e.g.
       the choice card runs much taller). So we measure exactly where each
       stop's card sits in the scroll range (the same progress units
       computeProgress() uses) and interpolate scroll position through each
       stop's actual frac at that measured point — this keeps the
       camera/marker synced to whichever card is actually on screen. */
    function measureVisualBreaks() {
      var trackTop = trackEl.getBoundingClientRect().top + window.scrollY;
      var total = trackEl.offsetHeight - window.innerHeight;
      var breaks = stops.map(function (s) {
        var r = s.el.getBoundingClientRect();
        var cardCenterY = r.top + window.scrollY + r.height / 2;
        var scrollYTarget = cardCenterY - window.innerHeight / 2;
        return total > 0 ? clamp((scrollYTarget - trackTop) / total, 0, 1) : 0;
      });
      for (var i = 1; i < breaks.length; i++) {
        if (breaks[i] < breaks[i - 1]) breaks[i] = breaks[i - 1];
      }
      return breaks;
    }
    var visualBreaks = measureVisualBreaks();
    function scrollToGeoFrac(t) {
      t = clamp(t, 0, 1);
      if (stops.length < 2) return t;
      var lo = 0, hi = stops.length - 1;
      while (lo < hi - 1) {
        var mid = (lo + hi) >> 1;
        if (visualBreaks[mid] <= t) lo = mid; else hi = mid;
      }
      var segLen = visualBreaks[hi] - visualBreaks[lo];
      var localT = segLen > 0 ? (t - visualBreaks[lo]) / segLen : 0;
      return stops[lo].frac + (stops[hi].frac - stops[lo].frac) * localT;
    }

    /* ---------------- Location label lookup ---------------- */
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

    var BASE_ZOOM = 8.6, ZOOM_BOOST = 4.2;

    function computeProgress() {
      var rect = trackEl.getBoundingClientRect();
      var total = trackEl.offsetHeight - window.innerHeight;
      if (total <= 0) return rect.top <= 0 ? 1 : 0;
      return clamp(-rect.top / total, 0, 1);
    }

    function render(progress) {
      var pt = getPointAtFrac(progress);
      var latlng = [pt.lat, pt.lng];

      marker.setLatLng(latlng);
      markerGlow.setLatLng(latlng);

      var trailPts = latlngs.slice(0, pt.idx + 1);
      trailPts.push(latlng);
      trailGlow.setLatLngs(trailPts);
      trailCore.setLatLngs(trailPts);

      var minDist = Infinity, minWindow = 0.04;
      stops.forEach(function (stop) {
        var dd = Math.abs(progress - stop.frac);
        if (dd < minDist) { minDist = dd; minWindow = stop.zoomWindow; }
        stop.el.classList.toggle("is-active", dd < stop.threshold);
        var shouldLight = progress + 0.002 >= stop.frac;
        if (shouldLight !== stop.lit) {
          stop.lit = shouldLight;
          stop.dot.setStyle({ fillColor: shouldLight ? LIT_FILL : DIM_FILL, radius: shouldLight ? 7 : 5 });
        }
      });

      var proximity = clamp(1 - minDist / minWindow, 0, 1);
      var zoom = BASE_ZOOM + ZOOM_BOOST * proximity * proximity;
      map.setView(latlng, zoom, { animate: false });

      if (dayText) dayText.textContent = nearestLoc(progress).loc;
      if (progressFill) progressFill.style.height = (progress * 100) + "%";
    }

    function resize() {
      map.invalidateSize(false);
      visualBreaks = measureVisualBreaks();
    }
    window.addEventListener("resize", resize);

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        render(scrollToGeoFrac(computeProgress()));
        ticking = false;
      });
    }

    var active = false;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          if (!active) {
            active = true;
            map.invalidateSize(false);
            window.addEventListener("scroll", onScroll, { passive: true });
            render(scrollToGeoFrac(computeProgress()));
          }
        } else if (active) {
          active = false;
          window.removeEventListener("scroll", onScroll);
        }
      });
    }, { threshold: 0 });
    observer.observe(content.querySelector("[data-journey]"));

    map.setView(latlngs[0], BASE_ZOOM, { animate: false });
    setTimeout(function () {
      map.invalidateSize(false);
      render(scrollToGeoFrac(computeProgress()));
    }, 0);
  };
})();
