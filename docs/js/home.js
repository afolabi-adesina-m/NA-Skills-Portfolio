(function () {
  /* Mobile menu */
  var btn = document.querySelector(".nav-toggle");
  var links = document.getElementById("nav-links");
  if (btn && links) {
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", open ? "false" : "true");
      btn.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      links.classList.toggle("is-open", !open);
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        btn.setAttribute("aria-expanded", "false");
        btn.setAttribute("aria-label", "Open menu");
        links.classList.remove("is-open");
      }
    });
  }

  /* Active section highlight in the top bar (works with or without motion) */
  if ("IntersectionObserver" in window && links) {
    var navLinks = Array.prototype.slice.call(links.querySelectorAll('a[href^="#"]'));
    var map = {};
    navLinks.forEach(function (a) { var s = document.getElementById(a.getAttribute("href").slice(1)); if (s) map[s.id] = a; });
    var visible = {};
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting; });
      var current = null;
      navLinks.forEach(function (a) { var id = a.getAttribute("href").slice(1); if (visible[id]) current = id; });
      navLinks.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href").slice(1) === current); });
    }, { rootMargin: "-35% 0px -60% 0px" });
    Object.keys(map).forEach(function (id) { spy.observe(document.getElementById(id)); });
  }

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) return;
  document.documentElement.classList.add("motion");

  /* Scroll reveal, staggered among siblings */
  var sel = [".sec-label", ".band .display", ".split-note", ".stat", ".orgs", ".about-lead", ".about-cols p",
    ".bring-list li", ".edu li", ".mini-label", ".xp-intro p", ".xp-item", ".proj", ".lane", ".ai-grid .card",
    ".legend", ".sk-group", ".principles li", ".rec", ".rec-source", ".contact-layout > *"].join(",");
  var items = document.querySelectorAll(sel);
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      io.unobserve(en.target);
      var fig = en.target.querySelector && en.target.querySelector("[data-count]");
      if (fig) countUp(fig);
    });
  }, { rootMargin: "0px 0px -10% 0px" });
  Array.prototype.forEach.call(items, function (el) {
    var i = 0, s = el.previousElementSibling;
    while (s && i < 6) { if (s.matches && s.matches(sel)) i++; s = s.previousElementSibling; }
    el.style.setProperty("--rv-delay", (i * 0.08).toFixed(2) + "s");
    el.classList.add("rv");
    io.observe(el);
  });

  /* Count-up figures: real value stays in a hidden span for screen readers */
  function prep(el) {
    var txt = el.textContent.trim();
    var m = txt.match(/^([^0-9]*)([0-9][0-9,]*(?:\.[0-9]+)?)(.*)$/);
    if (!m || /→/.test(txt)) return;
    var dec = (m[2].split(".")[1] || "").length;
    el.setAttribute("data-count", m[2].replace(/,/g, ""));
    el.setAttribute("data-dec", dec);
    el.innerHTML = '<span class="visually-hidden">' + txt + '</span><span aria-hidden="true">' + m[1] + '<span class="cnt">0</span>' + m[3] + "</span>";
  }
  function countUp(el) {
    var end = parseFloat(el.getAttribute("data-count")), dec = +el.getAttribute("data-dec");
    var out = el.querySelector(".cnt"), t0 = performance.now(), dur = 1600;
    var useComma = end >= 1000;
    function fmt(v) { var s = v.toFixed(dec); return useComma ? Number(s).toLocaleString("en-CA", { minimumFractionDigits: dec, maximumFractionDigits: dec }) : s; }
    (function step(now) {
      var p = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4);
      out.textContent = fmt(end * e);
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  Array.prototype.forEach.call(document.querySelectorAll(".stat-fig, .proj-fig"), prep);

  /* Timeline progress line */
  var list = document.querySelector(".xp-list");
  if (list) {
    var bar = document.createElement("div");
    bar.className = "xp-progress";
    bar.setAttribute("aria-hidden", "true");
    list.appendChild(bar);
  }

  /* Gentle hero parallax and timeline fill, on one scroll handler */
  var hero = document.querySelector(".hero"), photo = document.querySelector(".hero-photo"), nameTop = document.querySelector(".hero-name-top");
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight;
    if (hero && y < hero.offsetHeight) {
      if (photo) photo.style.setProperty("--py", (y * 0.06).toFixed(1) + "px");
      if (nameTop) nameTop.style.setProperty("--ny", (y * 0.16).toFixed(1) + "px");
    }
    if (list) {
      var r = list.getBoundingClientRect();
      var p = (vh * 0.7 - r.top) / r.height;
      list.style.setProperty("--xp", Math.max(0, Math.min(1, p)).toFixed(3));
      bar.style.setProperty("--xp", Math.max(0, Math.min(1, p)).toFixed(3));
    }
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
})();
