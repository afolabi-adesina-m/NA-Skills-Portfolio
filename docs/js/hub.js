(function () {
  const toggle = document.querySelector(".nav-toggle");
  const drawer = document.querySelector("#hub-nav-links");

  if (toggle && drawer) {
    function setOpen(open) {
      drawer.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.style.overflow = open && window.matchMedia("(max-width: 860px)").matches
        ? "hidden"
        : "";
    }

    toggle.addEventListener("click", function () {
      setOpen(!drawer.classList.contains("open"));
    });

    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 860px)").matches) setOpen(false);
      });
    });

    window.addEventListener("resize", function () {
      if (!window.matchMedia("(max-width: 860px)").matches) setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reveals = document.querySelectorAll(".reveal");

  if (!reveals.length) return;

  if (prefersReduced || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
  );

  reveals.forEach(function (el) { observer.observe(el); });
})();

(function () {
  function address() {
    return ["afolabi", "adesina", "m"].join(".") + "@" + ["gmail", "com"].join(".");
  }

  var bodies = {
    resume: "Hi Afolabi, Please share your tailored resume for our team. (Optional: our focus area is SAP MDM, Supply Chain BI or Applied AI.) Thank you."
  };

  function mailHref(kind) {
    var href = "mailto:" + address();
    var body = bodies[kind];
    if (!body) return href;
    return href + "?subject=" + encodeURIComponent("Resume Request, Afolabi A.") + "&body=" + encodeURIComponent(body);
  }

  document.querySelectorAll("[data-mail]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      var href = mailHref(el.getAttribute("data-mail"));
      el.setAttribute("href", href);
      e.preventDefault();
      window.location.href = href;
    });
  });
})();
