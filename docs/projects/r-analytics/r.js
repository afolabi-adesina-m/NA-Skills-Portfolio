/* Statistical Computing in R — expandable table, filters, charts */

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

  /* ---------- expand rows ---------- */
  function closeAll(exceptId) {
    document.querySelectorAll(".problem-row.is-open").forEach((row) => {
      if (row.dataset.id === exceptId) return;
      row.classList.remove("is-open");
      row.setAttribute("aria-expanded", "false");
      const detail = document.querySelector(`.detail-row[data-for="${row.dataset.id}"]`);
      if (detail) detail.hidden = true;
    });
    document.querySelectorAll(".m-card.is-open").forEach((card) => {
      if (card.dataset.id === exceptId) return;
      card.classList.remove("is-open");
    });
  }

  function toggleRow(row) {
    const id = row.dataset.id;
    const detail = document.querySelector(`.detail-row[data-for="${id}"]`);
    const opening = !row.classList.contains("is-open");
    closeAll(opening ? id : null);
    row.classList.toggle("is-open", opening);
    row.setAttribute("aria-expanded", String(opening));
    if (detail) detail.hidden = !opening;
    if (opening) {
      requestAnimationFrame(() => maybeDrawInlineCharts(id));
    }
  }

  document.querySelectorAll(".problem-row").forEach((row) => {
    row.addEventListener("click", () => toggleRow(row));
    row.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleRow(row);
      }
    });
  });

  /* ---------- filters ---------- */
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const f = btn.dataset.filter;
      document.querySelectorAll(".problem-row").forEach((row) => {
        const show = f === "all" || row.dataset.topic === f;
        row.hidden = !show;
        const detail = document.querySelector(`.detail-row[data-for="${row.dataset.id}"]`);
        if (!show) {
          row.classList.remove("is-open");
          row.setAttribute("aria-expanded", "false");
          if (detail) detail.hidden = true;
        }
      });
      document.querySelectorAll(".m-card").forEach((card) => {
        const show = f === "all" || card.dataset.topic === f;
        card.hidden = !show;
        if (!show) card.classList.remove("is-open");
      });
    });
  });

  /* ---------- mobile cards from table ---------- */
  const mobile = document.getElementById("mobile-cards");
  if (mobile) {
    document.querySelectorAll(".problem-row").forEach((row) => {
      const id = row.dataset.id;
      const topic = row.querySelector(".col-topic")?.textContent?.trim() || "";
      const problem = row.querySelector(".col-problem")?.childNodes[0]?.textContent?.trim() || "";
      const approach = row.querySelector(".col-approach")?.textContent?.trim() || "";
      const result = row.querySelector(".col-result")?.textContent?.trim() || "";
      const detail = document.querySelector(`.detail-row[data-for="${id}"]`);
      const panelHtml = detail ? detail.querySelector(".detail-panel")?.innerHTML || "" : "";

      const card = document.createElement("article");
      card.className = "m-card";
      card.dataset.id = id;
      card.dataset.topic = row.dataset.topic;
      card.innerHTML = `
        <div class="m-card-head" tabindex="0" role="button" aria-expanded="false">
          <div>
            <p class="m-topic">${topic}</p>
            <h3>${problem}</h3>
            <p style="margin:0;font-size:0.86rem;color:var(--muted)">${approach}</p>
            <p class="m-result">${result}</p>
          </div>
        </div>
        <div class="m-card-body"><div class="detail-panel">${panelHtml}</div></div>`;
      card.querySelector(".m-card-head").addEventListener("click", () => {
        const open = !card.classList.contains("is-open");
        closeAll(open ? id : null);
        card.classList.toggle("is-open", open);
        card.querySelector(".m-card-head").setAttribute("aria-expanded", String(open));
        if (open) requestAnimationFrame(() => maybeDrawInlineCharts(id));
      });
      mobile.appendChild(card);
    });
  }

  /* ---------- Plotly charts ---------- */
  const plotLayout = {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: { family: "Figtree, sans-serif", size: 11, color: "#5e6778" },
    margin: { t: 24, r: 16, b: 40, l: 44 },
    legend: { orientation: "h", y: 1.12 },
  };

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
          marker: { size: 9, color: "#16324f" },
          name: "Holdout points",
        },
        {
          x: [6, 8.2],
          y: [6, 8.2],
          mode: "lines",
          line: { color: "#2f5d50", dash: "dot", width: 1.5 },
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
          line: { color: "#3a5a6e", width: 2.5 },
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
          marker: { color: "#16324f" },
        },
        {
          type: "bar",
          name: "Romance share",
          x: ["C1", "C2", "C3", "C4", "C5"],
          y: [0.1, 0.78, 0.35, 0.7, 0.2],
          marker: { color: "#5e8a9a" },
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
          marker: { color: ["#16324f", "#5e8a9a"] },
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
