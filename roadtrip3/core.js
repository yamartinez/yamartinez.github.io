(function () {
  "use strict";

  var SESSION_KEY = "rt3_unlocked_content_v1";

  var gate = document.getElementById("gate");
  var gateCard = gate.querySelector(".gate-card");
  var gateForm = document.getElementById("gate-form");
  var gatePassword = document.getElementById("gate-password");
  var gateError = document.getElementById("gate-error");
  var content = document.getElementById("content");
  var progressBar = document.getElementById("progress-bar");

  function base64ToBytes(b64) {
    var binary = atob(b64);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function deriveKey(password, salt, iterations) {
    var enc = new TextEncoder();
    return crypto.subtle
      .importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"])
      .then(function (baseKey) {
        return crypto.subtle.deriveKey(
          { name: "PBKDF2", salt: salt, iterations: iterations, hash: "SHA-256" },
          baseKey,
          { name: "AES-GCM", length: 256 },
          false,
          ["decrypt"]
        );
      });
  }

  function decryptPayload(password) {
    var payload = base64ToBytes(ENCRYPTED_PAYLOAD);
    var salt = payload.slice(0, 16);
    var iv = payload.slice(16, 28);
    var data = payload.slice(28);
    return deriveKey(password, salt, PBKDF2_ITERATIONS).then(function (key) {
      return crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, data);
    }).then(function (plainBuf) {
      return new TextDecoder().decode(plainBuf);
    });
  }

  function revealContent(html, opts) {
    content.innerHTML = html;
    content.hidden = false;
    content.classList.add("is-revealed");
    gate.classList.add("is-unlocked");
    document.body.style.overflow = "";
    initInteractions();
    if (opts && opts.cache) {
      try { sessionStorage.setItem(SESSION_KEY, html); } catch (e) {}
    }
  }

  function unlock(password) {
    decryptPayload(password).then(function (html) {
      revealContent(html, { cache: true });
    }).catch(function () {
      gateError.textContent = "That's not it — try again.";
      gatePassword.value = "";
      gatePassword.focus();
      gateCard.classList.remove("shake");
      void gateCard.offsetWidth;
      gateCard.classList.add("shake");
    });
  }

  gateForm.addEventListener("submit", function (e) {
    e.preventDefault();
    gateError.textContent = "";
    var pw = gatePassword.value.trim();
    if (!pw) return;
    unlock(pw);
  });

  function tryCachedSession() {
    var cached;
    try { cached = sessionStorage.getItem(SESSION_KEY); } catch (e) { cached = null; }
    if (cached) revealContent(cached, { cache: false });
  }
  // Deferred to DOMContentLoaded so module scripts (which always execute
  // after parsing, unlike this classic script) have registered
  // window.initJourneyVisual before a cached session reveals content.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tryCachedSession);
  } else {
    tryCachedSession();
  }

  /* ---------------- Post-unlock interactions ---------------- */

  function initInteractions() {
    initScrollReveal();
    initProgressBar();
    initCounters();
    initChoiceTabs();
    initChecklists();
    initCta();
    if (typeof window.initJourneyVisual === "function") {
      window.initJourneyVisual(content);
    }
  }

  function initScrollReveal() {
    var items = content.querySelectorAll("[data-reveal]");
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
    items.forEach(function (el) { observer.observe(el); });
  }

  function initProgressBar() {
    var ticking = false;
    function update() {
      var scrollTop = window.scrollY;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? Math.min(100, (scrollTop / max) * 100) : 0;
      progressBar.style.width = pct + "%";
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    });
    update();
  }

  function initCounters() {
    var counters = content.querySelectorAll(".stat-number");
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        observer.unobserve(el);
        var target = parseFloat(el.getAttribute("data-target")) || 0;
        var prefix = el.getAttribute("data-prefix") || "";
        var suffix = el.getAttribute("data-suffix") || "";
        var duration = 1200;
        var start = null;
        function step(ts) {
          if (start === null) start = ts;
          var progress = Math.min(1, (ts - start) / duration);
          var eased = 1 - Math.pow(1 - progress, 3);
          var value = Math.round(eased * target);
          el.textContent = prefix + value + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { observer.observe(c); });
  }

  function initChoiceTabs() {
    var blocks = content.querySelectorAll('[data-kind="choice"]');
    blocks.forEach(function (block) {
      var tabs = block.querySelectorAll(".choice-tab");
      var panels = block.querySelectorAll(".choice-panel");
      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          var choice = tab.getAttribute("data-choice");
          tabs.forEach(function (t) {
            var active = t === tab;
            t.classList.toggle("is-active", active);
            t.setAttribute("aria-selected", active ? "true" : "false");
          });
          panels.forEach(function (p) {
            p.classList.toggle("is-active", p.getAttribute("data-panel") === choice);
          });
        });
      });
    });
  }

  function initChecklists() {
    var lists = content.querySelectorAll("[data-checklist]");
    lists.forEach(function (list) {
      var name = list.getAttribute("data-checklist");
      var checkboxes = list.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(function (box) {
        var label = box.parentElement.querySelector("span").textContent.trim();
        var key = "rt3_check_" + name + "_" + label;
        try {
          if (localStorage.getItem(key) === "1") box.checked = true;
        } catch (e) {}
        box.addEventListener("change", function () {
          try { localStorage.setItem(key, box.checked ? "1" : "0"); } catch (e) {}
        });
      });
    });
  }

  var ctaMessages = [
    "Pack the cooler. 🚙✨",
    "It's happening. 🌊",
    "Best decision today. 💛",
    "See you at the coast. 🌅"
  ];
  var ctaIndex = 0;

  function spawnConfetti() {
    var colors = ["#ff7a59", "#e8b84d", "#34c2cf", "#57a37c", "#f2a37e"];
    for (var i = 0; i < 70; i++) {
      var piece = document.createElement("div");
      piece.className = "confetti-piece";
      var size = 6 + Math.random() * 6;
      piece.style.left = Math.random() * 100 + "vw";
      piece.style.width = size + "px";
      piece.style.height = size * 0.4 + "px";
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.opacity = String(0.7 + Math.random() * 0.3);
      var duration = 2.2 + Math.random() * 1.6;
      piece.style.animationDuration = duration + "s";
      piece.style.transform = "rotate(" + Math.floor(Math.random() * 360) + "deg)";
      document.body.appendChild(piece);
      (function (el, ms) {
        setTimeout(function () { el.remove(); }, ms * 1000 + 100);
      })(piece, duration);
    }
  }

  function initCta() {
    var btn = document.getElementById("cta-yes");
    var response = document.getElementById("cta-response");
    if (!btn) return;
    btn.addEventListener("click", function () {
      spawnConfetti();
      response.textContent = ctaMessages[ctaIndex % ctaMessages.length];
      ctaIndex++;
    });
  }
})();
