/* Python Skills Showcase — expandable table, filters, charts */

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

  const mobile = document.getElementById("mobile-cards");
  if (mobile) {
    document.querySelectorAll(".problem-row").forEach((row) => {
      const id = row.dataset.id;
      const topic = row.querySelector(".col-topic")?.textContent?.trim() || "";
      const problem =
        row.querySelector(".col-problem")?.childNodes[0]?.textContent?.trim() || "";
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
          <span class="course-toggle">Details</span>
        </div>
        <div class="m-card-body"><div class="detail-panel">${panelHtml}</div></div>
      `;
      const head = card.querySelector(".m-card-head");
      const openCard = () => {
        const opening = !card.classList.contains("is-open");
        closeAll(opening ? id : null);
        card.classList.toggle("is-open", opening);
        head.setAttribute("aria-expanded", String(opening));
        if (opening) requestAnimationFrame(() => maybeDrawInlineCharts(id));
      };
      head.addEventListener("click", openCard);
      head.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openCard();
        }
      });
      mobile.appendChild(card);
    });
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
