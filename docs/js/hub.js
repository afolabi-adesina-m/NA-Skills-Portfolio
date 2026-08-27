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
})();
