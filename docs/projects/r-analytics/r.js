/* Statistical Computing in R — family accordion, charts */

(function () {
  "use strict";

  /* ---------- nav ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const drawer = document.getElementById("r-nav");
  if (toggle && drawer) {
    toggle.addEventListener("click", () => {
      const open = drawer.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  /* ---------- inline charts when a problem opens ---------- */
  document.querySelectorAll("details.problem").forEach((el) => {
    el.addEventListener("toggle", () => {
      if (!el.open) return;
      const id = el.dataset.id;
      requestAnimationFrame(() => maybeDrawInlineCharts(id));
    });
  });

  /* Draw featured wine metrics panel is static; section charts below */

  /* ---------- Plotly charts ---------- */
  const plotLayout = {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: { family: "Figtree, sans-serif", size: 11, color: "#5e6778" },
    margin: { t: 24, r: 16, b: 40, l: 44 },
    legend: { orientation: "h", y: 1.12 },
  };

  const accent = "#3a5a6e";
  const navy = "#1a2b3c";

  function drawWine() {
    const el = document.getElementById("chart-wine");
    if (!el || typeof Plotly === "undefined" || el.dataset.drawn) return;
    const actual = [6.2, 6.5, 6.8, 7.1, 7.4, 7.0, 6.6, 7.8, 8.0, 7.3];
    const fitted = [6.1, 6.55, 6.7, 7.05, 7.35, 6.95, 6.7, 7.6, 7.85, 7.25];
    Plotly.newPlot(
      el,
      [
        {
          x: actual,
          y: fitted,
          mode: "markers",
          marker: { size: 9, color: accent },
          name: "Holdout points",
        },
        {
          x: [6, 8.2],
          y: [6, 8.2],
          mode: "lines",
          line: { color: "#1e6b4f", dash: "dot", width: 1.5 },
          name: "Perfect fit",
        },
      ],
      {
        ...plotLayout,
        xaxis: { title: "Actual price index" },
        yaxis: { title: "Fitted price index" },
      },
      { displayModeBar: false, responsive: true }
    );
    el.dataset.drawn = "1";
  }

  function drawRoc() {
    const el = document.getElementById("chart-roc");
    if (!el || typeof Plotly === "undefined" || el.dataset.drawn) return;
    const fpr = [0, 0.05, 0.12, 0.27, 0.45, 0.7, 1];
    const tpr = [0, 0.28, 0.48, 0.64, 0.8, 0.92, 1];
    Plotly.newPlot(
      el,
      [
        {
          x: fpr,
          y: tpr,
          mode: "lines+markers",
          line: { color: accent, width: 2.5 },
          marker: { size: 7 },
          name: "Model ROC",
        },
        {
          x: [0, 1],
          y: [0, 1],
          mode: "lines",
          line: { color: "#9aa3b2", dash: "dash", width: 1 },
          name: "Chance",
        },
      ],
      {
        ...plotLayout,
        xaxis: { title: "False positive rate", range: [0, 1] },
        yaxis: { title: "True positive rate", range: [0, 1] },
      },
      { displayModeBar: false, responsive: true }
    );
    el.dataset.drawn = "1";
  }

  function drawClusters() {
    const el = document.getElementById("chart-clusters");
    if (!el || typeof Plotly === "undefined" || el.dataset.drawn) return;
    Plotly.newPlot(
      el,
      [
        {
          type: "bar",
          name: "Action share",
          x: ["C1", "C2", "C3", "C4", "C5"],
          y: [0.82, 0.15, 0.4, 0.08, 0.55],
          marker: { color: accent },
        },
        {
          type: "bar",
          name: "Romance share",
          x: ["C1", "C2", "C3", "C4", "C5"],
          y: [0.1, 0.78, 0.35, 0.7, 0.2],
          marker: { color: navy },
        },
      ],
      {
        ...plotLayout,
        barmode: "group",
        margin: { t: 28, r: 8, b: 36, l: 40 },
        yaxis: { title: "Mean genre flag", range: [0, 1] },
      },
      { displayModeBar: false, responsive: true }
    );
    el.dataset.drawn = "1";
  }

  function drawAirline() {
    const el = document.getElementById("chart-airline");
    if (!el || typeof Plotly === "undefined" || el.dataset.drawn) return;
    Plotly.newPlot(
      el,
      [
        {
          type: "bar",
          orientation: "h",
          y: ["Regular seats", "Discount seats"],
          x: [100, 66],
          marker: { color: [accent, navy] },
          text: ["100 × $617", "66 × $238"],
          textposition: "auto",
          hoverinfo: "x+y",
        },
      ],
      {
        ...plotLayout,
        margin: { t: 16, r: 16, b: 36, l: 110 },
        xaxis: { title: "Seats allocated (capacity 166)" },
        showlegend: false,
      },
      { displayModeBar: false, responsive: true }
    );
    el.dataset.drawn = "1";
  }

  function maybeDrawInlineCharts(id) {
    if (id === "p11") drawClusters();
    if (id === "p14") drawAirline();
  }

  function initCharts() {
    drawWine();
    drawRoc();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      if (typeof Plotly !== "undefined") initCharts();
      else window.addEventListener("load", initCharts);
    });
  } else if (typeof Plotly !== "undefined") {
    initCharts();
  } else {
    window.addEventListener("load", initCharts);
  }
})();
