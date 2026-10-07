(function () {
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector("#sa-nav-links");
  if (!toggle || !links) return;
  function setOpen(open) {
    links.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.textContent = open ? "Close" : "Menu";
  }
  toggle.addEventListener("click", function () { setOpen(!links.classList.contains("open")); });
  links.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { setOpen(false); });
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
})();
