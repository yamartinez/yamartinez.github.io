(function () {
  "use strict";

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

  window.initJourneyVisual = function (content) {
    var stage = content.querySelector("[data-journey-stage]");
    var pathEl = document.getElementById("route-trail-core");
    if (!stage || !pathEl) return;

    var camera = content.querySelector("[data-journey-camera]");
    var trackEl = content.querySelector("[data-journey-track]");
    var dayText = content.querySelector("[data-journey-day-text]");
    var progressFill = content.querySelector("[data-journey-progress-fill]");
    var trailGlow = document.getElementById("route-trail");
    var trailCore = document.getElementById("route-trail-core");
    var marker = document.getElementById("route-marker");
    var markerGlow = document.getElementById("route-marker-glow");
    var dotsGroup = document.getElementById("route-dots");

    var totalLen = pathEl.getTotalLength();
    if (!totalLen) return;

    [trailGlow, trailCore].forEach(function (el) {
      el.style.strokeDasharray = String(totalLen);
      el.style.strokeDashoffset = String(totalLen);
    });

    var cards = Array.prototype.slice.call(content.querySelectorAll(".journey-card[data-stop-frac]"));
    var stops = cards.map(function (card) {
      return { frac: parseFloat(card.getAttribute("data-stop-frac")), el: card };
    });

    var gap = stops.length > 1 ? 1 / (stops.length - 1) : 1;
    var cardThreshold = gap * 0.58;
    var zoomWindow = gap * 1.1;

    stops.forEach(function (stop) {
      var pt = pathEl.getPointAtLength(stop.frac * totalLen);
      var dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("cx", pt.x);
      dot.setAttribute("cy", pt.y);
      dot.setAttribute("r", "4.5");
      dot.setAttribute("class", "route-dot");
      dotsGroup.appendChild(dot);
      stop.dot = dot;
    });

    var beats = Array.prototype.slice.call(content.querySelectorAll(".journey-beat[data-loc]"));
    var locEntries = beats.map(function (beat) {
      var stopEl = beat.querySelector("[data-stop-frac]");
      return {
        frac: stopEl ? parseFloat(stopEl.getAttribute("data-stop-frac")) : 0,
        loc: beat.getAttribute("data-loc")
      };
    });

    function nearestLoc(progress) {
      var best = locEntries[0];
      var bestDist = Infinity;
      for (var i = 0; i < locEntries.length; i++) {
        var d = Math.abs(locEntries[i].frac - progress);
        if (d < bestDist) { bestDist = d; best = locEntries[i]; }
      }
      return best;
    }

    function render(progress) {
      var len = progress * totalLen;
      var pt = pathEl.getPointAtLength(len);
      var offset = clamp(totalLen - len, 0, totalLen);
      trailGlow.style.strokeDashoffset = String(offset);
      trailCore.style.strokeDashoffset = String(offset);

      marker.setAttribute("cx", pt.x);
      marker.setAttribute("cy", pt.y);
      markerGlow.setAttribute("cx", pt.x);
      markerGlow.setAttribute("cy", pt.y);

      var minDist = Infinity;
      stops.forEach(function (stop) {
        var d = Math.abs(progress - stop.frac);
        if (d < minDist) minDist = d;
        stop.el.classList.toggle("is-active", d < cardThreshold);
        stop.dot.classList.toggle("is-lit", progress + 0.002 >= stop.frac);
      });

      var proximity = clamp(1 - minDist / zoomWindow, 0, 1);
      var zoom = 1.05 + 0.3 * proximity * proximity;

      var baseWidth = parseFloat(getComputedStyle(camera).width) || 600;
      var baseScale = baseWidth / 600;
      var anchorX = stage.clientWidth / 2;
      var anchorY = stage.clientHeight * 0.46;
      var tx = anchorX - pt.x * baseScale * zoom;
      var ty = anchorY - pt.y * baseScale * zoom;
      camera.style.transform = "translate3d(" + tx.toFixed(2) + "px," + ty.toFixed(2) + "px,0) scale(" + zoom.toFixed(4) + ")";

      if (dayText) dayText.textContent = nearestLoc(progress).loc;
      if (progressFill) progressFill.style.height = (progress * 100) + "%";
    }

    function computeProgress() {
      var rect = trackEl.getBoundingClientRect();
      var total = trackEl.offsetHeight - window.innerHeight;
      if (total <= 0) return rect.top <= 0 ? 1 : 0;
      return clamp(-rect.top / total, 0, 1);
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

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    render(computeProgress());
  };
})();
