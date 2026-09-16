/* Python Skills Showcase — closed table, filters, charts-first */

(function () {
  "use strict";

  const toggle = document.querySelector(".nav-toggle");
  const drawer = document.getElementById("py-nav");
  if (toggle && drawer) {
    toggle.addEventListener("click", () => {
      const open = drawer.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  function openRow(row) {
    const id = row.dataset.id;
    row.classList.add("is-open");
    row.setAttribute("aria-expanded", "true");
    const detail = document.querySelector(`.detail-row[data-for="${id}"]`);
    if (detail) detail.hidden = false;
    requestAnimationFrame(() => maybeDrawInlineCharts(id));
  }

  function closeRow(row) {
    const id = row.dataset.id;
    row.classList.remove("is-open");
    row.setAttribute("aria-expanded", "false");
    const detail = document.querySelector(`.detail-row[data-for="${id}"]`);
    if (detail) detail.hidden = true;
  }

  function openCard(card) {
    const id = card.dataset.id;
    card.classList.add("is-open");
    const head = card.querySelector(".m-card-head");
    if (head) head.setAttribute("aria-expanded", "true");
    requestAnimationFrame(() => maybeDrawInlineCharts(id));
  }

  function closeCard(card) {
    card.classList.remove("is-open");
    const head = card.querySelector(".m-card-head");
    if (head) head.setAttribute("aria-expanded", "false");
  }

  function toggleRow(row) {
    if (row.classList.contains("is-open")) closeRow(row);
    else openRow(row);
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

  // Keep snippet <details> clicks from toggling the parent row
  document.querySelectorAll(".snippet-details").forEach((el) => {
    el.addEventListener("click", (e) => e.stopPropagation());
  });

  const filterBtns = document.querySelectorAll(".filter-btn[data-filter]");
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
          closeRow(row);
        }
      });
      document.querySelectorAll(".m-card").forEach((card) => {
        const show = f === "all" || card.dataset.topic === f;
        card.hidden = !show;
        if (!show) closeCard(card);
      });
    });
  });

  const mobile = document.getElementById("mobile-cards");
  if (mobile) {
    document.querySelectorAll(".problem-row").forEach((row) => {
      const id = row.dataset.id;
      const skill = row.querySelector(".col-skill")?.textContent?.trim() || "";
      const result = row.querySelector(".col-result")?.textContent?.trim() || "";
      const metric = row.querySelector(".col-metric")?.textContent?.trim() || "";
      const detail = document.querySelector(`.detail-row[data-for="${id}"]`);
      const panelHtml = detail ? detail.querySelector(".detail-panel")?.innerHTML || "" : "";

      const card = document.createElement("article");
      card.className = "m-card";
      card.dataset.id = id;
      card.dataset.topic = row.dataset.topic;
      card.innerHTML = `
        <div class="m-card-head" tabindex="0" role="button" aria-expanded="false">
          <div>
            <p class="m-topic">${skill}</p>
            <h3>${skill}</h3>
            <p class="m-result">${result}</p>
            <p class="m-metric">${metric}</p>
          </div>
          <span class="course-toggle">Details</span>
        </div>
        <div class="m-card-body"><div class="detail-panel">${panelHtml}</div></div>
      `;
      const head = card.querySelector(".m-card-head");
      const toggleCard = () => {
        if (card.classList.contains("is-open")) closeCard(card);
        else openCard(card);
      };
      head.addEventListener("click", toggleCard);
      head.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleCard();
        }
      });
      card.querySelectorAll(".snippet-details").forEach((el) => {
        el.addEventListener("click", (e) => e.stopPropagation());
      });
      mobile.appendChild(card);
    });
    // Intentionally closed by default — no expandAll()
  }

  const plotLayout = {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: { family: "Figtree, sans-serif", color: "#2a3140", size: 11 },
    margin: { t: 28, r: 16, b: 40, l: 48 },
  };

  function drawSentiment(el) {
    if (!el || el.dataset.drawn === "1" || typeof Plotly === "undefined") return;
    Plotly.newPlot(
      el,
      [
        {
          type: "bar",
          x: ["Negative", "Neutral", "Positive"],
          y: [18, 41, 27],
          marker: { color: ["#8a4b4b", "#8a8f98", "#2f5d50"] },
          hovertemplate: "%{x}: %{y}<extra></extra>",
        },
      ],
      {
        ...plotLayout,
        yaxis: { title: "Posts (demo)", gridcolor: "rgba(18,21,28,0.08)" },
        xaxis: { title: "" },
      },
      { displayModeBar: false, responsive: true }
    );
    el.dataset.drawn = "1";
  }

  function maybeDrawInlineCharts(id) {
    if (id === "c06") {
      drawSentiment(document.getElementById("chart-sentiment"));
    }
  }

  function drawMainCharts() {
    if (typeof Plotly === "undefined") return;
    const cv = document.getElementById("chart-cv");
    if (cv && cv.dataset.drawn !== "1") {
      Plotly.newPlot(
        cv,
        [
          {
            type: "bar",
            x: ["Fold 1", "Fold 2", "Fold 3", "Fold 4", "Fold 5"],
            y: [0.79, 0.84, 0.8, 0.83, 0.78],
            marker: { color: "#3776AB" },
            hovertemplate: "%{x}: %{y:.2f}<extra></extra>",
          },
        ],
        {
          ...plotLayout,
          yaxis: { title: "F1", range: [0.6, 1], gridcolor: "rgba(18,21,28,0.08)" },
          shapes: [
            {
              type: "line",
              x0: -0.5,
              x1: 4.5,
              y0: 0.808,
              y1: 0.808,
              line: { color: "#8a6a2f", dash: "dot", width: 1.5 },
            },
          ],
          annotations: [
            {
              x: 4,
              y: 0.808,
              text: "mean ≈ 0.81",
              showarrow: false,
              xanchor: "right",
              yshift: 10,
              font: { size: 10, color: "#8a6a2f" },
            },
          ],
        },
        { displayModeBar: false, responsive: true }
      );
      cv.dataset.drawn = "1";
    }
    drawSentiment(document.getElementById("chart-sent-main"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", drawMainCharts);
  } else {
    drawMainCharts();
  }
  window.addEventListener("load", drawMainCharts);
})();
