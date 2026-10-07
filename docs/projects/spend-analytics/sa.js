(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Header height feeds the sticky sub-nav offset and section scroll margins */
  var header = document.querySelector(".site-header");
  var subnav = document.querySelector(".sa-subnav");
  function setOffsets() {
    if (header) doc.style.setProperty("--sa-header-h", header.offsetHeight + "px");
    if (subnav) doc.style.setProperty("--sa-subnav-h", subnav.offsetHeight + "px");
  }
  setOffsets();
  window.addEventListener("resize", setOffsets);

  /* Mobile menu */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.getElementById("sa-nav-links");
  function setMenu(open) {
    if (!toggle || !links) return;
    links.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.textContent = open ? "Close" : "Menu";
    setOffsets();
  }
  if (toggle && links) {
    toggle.addEventListener("click", function () { setMenu(!links.classList.contains("open")); });
    links.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  }

  /* Sub-nav: highlight the section in view */
  if (subnav) {
    var navLinks = Array.prototype.slice.call(subnav.querySelectorAll("a[href^='#']"));
    var inner = subnav.querySelector(".sa-subnav-inner");
    var sections = navLinks.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); });
    var current = null;
    function activate(id) {
      if (id === current) return;
      current = id;
      navLinks.forEach(function (a) {
        var on = a.getAttribute("href") === "#" + id;
        a.classList.toggle("is-active", on);
        if (on) {
          a.setAttribute("aria-current", "true");
          if (inner && inner.scrollWidth > inner.clientWidth) {
            var left = a.offsetLeft - (inner.clientWidth - a.offsetWidth) / 2;
            inner.scrollTo({ left: left, behavior: reduceMotion ? "auto" : "smooth" });
          }
        } else {
          a.removeAttribute("aria-current");
        }
      });
    }
    function onScroll() {
      var line = (header ? header.offsetHeight : 0) + subnav.offsetHeight + window.innerHeight * 0.25;
      var id = sections[0] && sections[0].id;
      sections.forEach(function (s) { if (s && s.getBoundingClientRect().top <= line) id = s.id; });
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) id = sections[sections.length - 1].id;
      activate(id);
    }
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; onScroll(); }); }
    }, { passive: true });
    onScroll();
  }

  /* Report viewer: tabs, prev/next, arrow keys */
  var viewer = document.getElementById("sa-viewer");
  if (viewer) {
    var tabs = Array.prototype.slice.call(viewer.querySelectorAll("[role='tab']"));
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute("aria-controls")); });
    var countEl = document.getElementById("sa-count-n");
    var idx = 0;
    function show(i, focusTab) {
      i = (i + tabs.length) % tabs.length;
      if (i === idx && !focusTab) return;
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        panels[k].hidden = !on;
        panels[k].classList.remove("is-entering");
      });
      if (!reduceMotion) { void panels[i].offsetWidth; panels[i].classList.add("is-entering"); }
      idx = i;
      if (countEl) countEl.textContent = String(i + 1);
      var bar = tabs[i].parentNode;
      if (bar.scrollWidth > bar.clientWidth) {
        bar.scrollTo({ left: tabs[i].offsetLeft - (bar.clientWidth - tabs[i].offsetWidth) / 2, behavior: reduceMotion ? "auto" : "smooth" });
      }
      if (focusTab) tabs[i].focus({ preventScroll: true });
    }
    tabs.forEach(function (t, k) { t.addEventListener("click", function () { show(k, false); }); });
    viewer.querySelectorAll("[data-step]").forEach(function (b) {
      b.addEventListener("click", function () { show(idx + Number(b.getAttribute("data-step")), false); });
    });
    viewer.addEventListener("keydown", function (e) {
      var onTab = e.target.getAttribute && e.target.getAttribute("role") === "tab";
      if (e.key === "ArrowRight") { show(idx + 1, onTab); e.preventDefault(); }
      else if (e.key === "ArrowLeft") { show(idx - 1, onTab); e.preventDefault(); }
      else if (onTab && e.key === "Home") { show(0, true); e.preventDefault(); }
      else if (onTab && e.key === "End") { show(tabs.length - 1, true); e.preventDefault(); }
    });
    /* After the page loads, fetch the other pages quietly so switching tabs is instant */
    window.addEventListener("load", function () {
      var warm = function () { viewer.querySelectorAll("img[loading='lazy']").forEach(function (img) { img.loading = "eager"; }); };
      if ("requestIdleCallback" in window) requestIdleCallback(warm, { timeout: 2000 }); else setTimeout(warm, 800);
    });
  }

  /* Gentle fade-in as blocks enter the screen */
  var faders = document.querySelectorAll(".fade");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    faders.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    faders.forEach(function (el) { io.observe(el); });
  }
})();
