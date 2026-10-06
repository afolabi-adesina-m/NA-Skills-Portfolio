(function () {
  var toggle = document.querySelector(".nav-toggle");
  if (!toggle || toggle.dataset.bound === "1") return;
  var panel = document.getElementById(toggle.getAttribute("aria-controls") || "");
  if (!panel) panel = document.querySelector(".nav-links");
  if (!panel) return;
  toggle.dataset.bound = "1";

  function setOpen(open) {
    panel.classList.toggle("open", open);
    panel.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  toggle.addEventListener("click", function () {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  panel.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      if (window.matchMedia("(max-width: 1100px)").matches) setOpen(false);
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setOpen(false);
  });
})();
