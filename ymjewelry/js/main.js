/* YM Jewelry — site behavior */
(function () {
  "use strict";

  /* ----- Footer year ----- */
  document.querySelectorAll("#year").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ----- Mobile nav toggle ----- */
  var toggle = document.querySelector(".nav-toggle");
  var navLinks = document.querySelector(".nav-links");
  if (toggle && navLinks) {
    toggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ----- Scroll reveal ----- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ----- Highlight today's row in the hours table ----- */
  var todayRow = document.querySelector(
    '.hours-table tr[data-day="' + new Date().getDay() + '"]'
  );
  if (todayRow) {
    todayRow.classList.add("today");
  }

  /* ----- Hero carousel ----- */
  var slides = document.querySelectorAll(".hero-slide");
  var dotsWrap = document.querySelector(".hero-dots");
  if (slides.length > 1 && dotsWrap) {
    var slideIndex = 0;
    var timer = null;

    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.className = "hero-dot" + (i === 0 ? " active" : "");
      dot.setAttribute("aria-label", "Go to slide " + (i + 1));
      dot.addEventListener("click", function () {
        goTo(i);
        restart();
      });
      dotsWrap.appendChild(dot);
    });
    var dots = dotsWrap.querySelectorAll(".hero-dot");

    function goTo(i) {
      slides[slideIndex].classList.remove("active");
      dots[slideIndex].classList.remove("active");
      slideIndex = (i + slides.length) % slides.length;
      slides[slideIndex].classList.add("active");
      dots[slideIndex].classList.add("active");
    }

    function restart() {
      clearInterval(timer);
      timer = setInterval(function () { goTo(slideIndex + 1); }, 6000);
    }

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!reduceMotion.matches) {
      restart();
    }
  }

  /* ----- Gallery filtering ----- */
  var filterBtns = document.querySelectorAll(".filter-btn");
  var items = Array.prototype.slice.call(
    document.querySelectorAll(".gallery-item")
  );
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var filter = btn.getAttribute("data-filter");
      items.forEach(function (item) {
        var match = filter === "all" || item.getAttribute("data-category") === filter;
        item.classList.toggle("hidden", !match);
      });
    });
  });

  /* ----- Lightbox ----- */
  var lightbox = document.querySelector(".lightbox");
  if (lightbox && items.length) {
    var lbImg = lightbox.querySelector("img");
    var current = -1;

    function visibleItems() {
      return items.filter(function (item) {
        return !item.classList.contains("hidden");
      });
    }

    function show(index) {
      var list = visibleItems();
      if (!list.length) return;
      current = (index + list.length) % list.length;
      var img = list[current].querySelector("img");
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function close() {
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      current = -1;
    }

    items.forEach(function (item) {
      item.addEventListener("click", function () {
        show(visibleItems().indexOf(item));
      });
    });

    lightbox.querySelector(".lightbox-close").addEventListener("click", close);
    lightbox.querySelector(".lightbox-prev").addEventListener("click", function () {
      show(current - 1);
    });
    lightbox.querySelector(".lightbox-next").addEventListener("click", function () {
      show(current + 1);
    });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) close();
    });
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });
  }
})();
