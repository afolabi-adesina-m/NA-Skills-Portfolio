(function () {
  var btn = document.querySelector(".nav-toggle");
  var links = document.getElementById("nav-links");
  if (!btn || !links) return;
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
})();
