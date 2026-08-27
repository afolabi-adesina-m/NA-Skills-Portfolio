(function () {
  const buttons = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll("#project-grid .card");
  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const filter = btn.getAttribute("data-filter");
      buttons.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      cards.forEach(function (card) {
        const type = card.getAttribute("data-type");
        card.classList.toggle("hidden", !(filter === "all" || type === filter));
      });
    });
  });

  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector("#hub-nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 900px)").matches) {
          links.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    });
  }
})();
