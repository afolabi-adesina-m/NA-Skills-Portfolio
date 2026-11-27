(function () {
  var btn = document.querySelector(".pf-toggle");
  var links = document.getElementById("pf-nav-links");
  if (!btn || !links) return;
  btn.addEventListener("click", function () {
    var open = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", open ? "false" : "true");
    btn.setAttribute("aria-label", open ? "Open portfolio menu" : "Close portfolio menu");
    links.classList.toggle("is-open", !open);
  });
})();
