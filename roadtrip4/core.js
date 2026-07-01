(function () {
  "use strict";

  var content = document.getElementById("content");
  var progressBar = document.getElementById("progress-bar");

  /* Content is already in the DOM (no password gate on this version) — just
     wire up the interactions once the document is ready. */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initInteractions);
  } else {
    initInteractions();
  }

  function initInteractions() {
    initLang();
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

  /* ---------------- Language (EN / ES) ----------------
     Priority on load: ?lang= URL param > saved choice > English. The active
     language is always written back into the URL so a copied/shared link
     opens in that language for whoever receives it. */
  var VALID_LANGS = { en: true, es: true };

  function currentLang() {
    return document.documentElement.lang === "es" ? "es" : "en";
  }

  function setLang(lang, persist) {
    if (!VALID_LANGS[lang]) lang = "en";
    document.documentElement.lang = lang;
    var buttons = document.querySelectorAll(".lang-switch button[data-lang]");
    buttons.forEach(function (b) {
      var on = b.getAttribute("data-lang") === lang;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    if (persist) {
      try { localStorage.setItem("rt4_lang", lang); } catch (e) {}
    }
    try {
      var url = new URL(window.location.href);
      url.searchParams.set("lang", lang);
      window.history.replaceState(null, "", url);
    } catch (e) {}
  }

  function initLang() {
    var urlLang, storedLang;
    try { urlLang = new URLSearchParams(window.location.search).get("lang"); } catch (e) {}
    try { storedLang = localStorage.getItem("rt4_lang"); } catch (e) {}
    var initial = VALID_LANGS[urlLang] ? urlLang : (VALID_LANGS[storedLang] ? storedLang : "en");
    // Persist the resolved choice so a param-driven visit sticks on later visits.
    setLang(initial, true);

    var sw = document.querySelector(".lang-switch");
    if (!sw) return;
    sw.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-lang]");
      if (!btn) return;
      setLang(btn.getAttribute("data-lang"), true);
    });
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
        // Prefer a stable, language-independent key so toggling EN/ES doesn't
        // orphan saved checks (the visible label text changes per language).
        var stable = box.getAttribute("data-key");
        var label = stable || box.parentElement.querySelector("span").textContent.trim();
        var key = "rt4_check_" + name + "_" + label;
        try {
          if (localStorage.getItem(key) === "1") box.checked = true;
        } catch (e) {}
        box.addEventListener("change", function () {
          try { localStorage.setItem(key, box.checked ? "1" : "0"); } catch (e) {}
        });
      });
    });
  }

  var ctaMessages = {
    en: [
      "Pack the cooler. 🚙✨",
      "It's happening. 🌊",
      "Best decision today. 💛",
      "See you at the coast. 🌅"
    ],
    es: [
      "Llena la hielera. 🚙✨",
      "Está pasando. 🌊",
      "La mejor decisión de hoy. 💛",
      "Nos vemos en la costa. 🌅"
    ]
  };
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
      var msgs = ctaMessages[currentLang()];
      response.textContent = msgs[ctaIndex % msgs.length];
      ctaIndex++;
    });
  }
})();
