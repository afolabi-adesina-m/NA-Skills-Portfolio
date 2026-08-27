(function () {
  const BASE = "/NA-Skills-Portfolio/assets/data/";
  const COLORS = ["#0284C7", "#0EA5E9", "#38BDF8", "#0369A1", "#7DD3FC"];
  const PLOT_LAYOUT = {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: { color: "#486581", family: "Segoe UI, Helvetica Neue, Arial, sans-serif" },
    margin: { t: 24, r: 16, b: 52, l: 56 },
    legend: { orientation: "h", y: -0.18 },
  };

  function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    if (!lines.length) return [];
    const headers = splitCSVLine(lines[0]);
    return lines.slice(1).map(function (line) {
      const cols = splitCSVLine(line);
      const row = {};
      headers.forEach(function (h, i) {
        row[h] = cols[i];
      });
      return row;
    });
  }

  function splitCSVLine(line) {
    const out = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQ = !inQ;
        continue;
      }
      if (ch === "," && !inQ) {
        out.push(cur);
        cur = "";
        continue;
      }
      cur += ch;
    }
    out.push(cur);
    return out;
  }

  async function loadCSV(name) {
    const res = await fetch(BASE + name);
    if (!res.ok) throw new Error("Failed to load " + name);
    return parseCSV(await res.text());
  }

  function avg(arr) {
    if (!arr.length) return 0;
    return arr.reduce(function (s, v) { return s + v; }, 0) / arr.length;
  }

  function fmtPct(v) {
    return (v * 100).toFixed(1) + "%";
  }

  function fmtMoney(v) {
    if (v >= 1e6) return "$" + (v / 1e6).toFixed(2) + "M";
    if (v >= 1e3) return "$" + (v / 1e3).toFixed(0) + "k";
    return "$" + v.toFixed(0);
  }

  function setInsight(html) {
    const el = document.getElementById("insight-banner");
    if (el) el.innerHTML = html;
  }

  function renderKPIs(ops) {
    const latestMonth = ops.map(function (r) { return r.month; }).sort().slice(-1)[0];
    const latest = ops.filter(function (r) { return r.month === latestMonth; });
    const prevMonth = ops.map(function (r) { return r.month; }).sort().filter(function (m) { return m < latestMonth; }).slice(-1)[0];
    const prev = ops.filter(function (r) { return r.month === prevMonth; });

    const otif = avg(latest.map(function (r) { return +r.otif; }));
    const prevOtif = avg(prev.map(function (r) { return +r.otif; }));
    const freight = latest.reduce(function (s, r) { return s + +r.freight_spend_cad; }, 0);
    const prevFreight = prev.reduce(function (s, r) { return s + +r.freight_spend_cad; }, 0);
    const turns = avg(latest.map(function (r) { return +r.inventory_turns; }));
    const fill = avg(latest.map(function (r) { return +r.fill_rate; }));
    const sales = latest.reduce(function (s, r) { return s + +r.sales_cad; }, 0);
    const late = latest.reduce(function (s, r) { return s + +r.late_orders; }, 0);

    const otifDelta = otif - prevOtif;
    const freightDelta = prevFreight ? (freight - prevFreight) / prevFreight : 0;

    document.getElementById("kpis").innerHTML = [
      kpi("OTIF (" + latestMonth + ")", fmtPct(otif), delta(otifDelta, true, true)),
      kpi("Freight spend", fmtMoney(freight), delta(freightDelta, false, false)),
      kpi("Inventory turns", turns.toFixed(1), "Network avg"),
      kpi("Fill rate", fmtPct(fill), "Service level"),
      kpi("Corridor sales", fmtMoney(sales), latestMonth),
      kpi("Late orders", String(late), "Exception volume"),
    ].join("");

    return { latestMonth: latestMonth, latest: latest, otif: otif, late: late, freight: freight };
  }

  function kpi(label, value, deltaHtml) {
    return (
      '<div class="kpi"><div class="label">' + label + '</div><div class="value">' +
      value + '</div><div class="delta">' + deltaHtml + "</div></div>"
    );
  }

  function delta(v, higherIsBetter, isPp) {
    const up = v >= 0;
    const good = higherIsBetter ? up : !up;
    const cls = good ? "up" : "down";
    const arrow = up ? "▲" : "▼";
    const text = isPp
      ? (Math.abs(v) * 100).toFixed(1) + " pp MoM"
      : (Math.abs(v) * 100).toFixed(1) + "% MoM";
    return '<span class="' + cls + '">' + arrow + " " + text + "</span>";
  }

  function plotOtifTrend(ops) {
    const plants = unique(ops.map(function (r) { return r.plant; }));
    const months = unique(ops.map(function (r) { return r.month; })).sort();
    const traces = plants.map(function (p, i) {
      return {
        type: "scatter",
        mode: "lines+markers",
        name: p,
        x: months,
        y: months.map(function (m) {
          const row = ops.find(function (r) { return r.plant === p && r.month === m; });
          return row ? +row.otif : null;
        }),
        line: { color: COLORS[i % COLORS.length], width: 2.4 },
        marker: { size: 6 },
      };
    });
    Plotly.newPlot(
      "chart-otif",
      traces,
      Object.assign({}, PLOT_LAYOUT, {
        yaxis: { tickformat: ".0%", gridcolor: "#D9E2EC", range: [0.84, 1], title: "OTIF" },
        xaxis: { gridcolor: "#D9E2EC" },
        shapes: [{
          type: "line",
          xref: "paper",
          x0: 0,
          x1: 1,
          y0: 0.95,
          y1: 0.95,
          line: { color: "#0D9488", width: 1.5, dash: "dot" },
        }],
      }),
      { responsive: true, displayModeBar: false }
    );
  }

  function plotFreight(latest) {
    Plotly.newPlot(
      "chart-freight",
      [{
        type: "bar",
        x: latest.map(function (r) { return r.plant; }),
        y: latest.map(function (r) { return +r.freight_spend_cad; }),
        marker: {
          color: latest.map(function (r) {
            return r.country === "US" ? "#0284C7" : "#38BDF8";
          }),
        },
        hovertemplate: "%{x}<br>%{y:$,.0f}<extra></extra>",
      }],
      Object.assign({}, PLOT_LAYOUT, {
        yaxis: { title: "CAD", gridcolor: "#D9E2EC" },
        xaxis: { gridcolor: "#D9E2EC" },
        margin: { t: 20, r: 10, b: 60, l: 56 },
        showlegend: false,
      }),
      { responsive: true, displayModeBar: false }
    );
  }

  function plotInventory(latest) {
    Plotly.newPlot(
      "chart-inv",
      [{
        type: "scatter",
        mode: "markers+text",
        x: latest.map(function (r) { return +r.inventory_turns; }),
        y: latest.map(function (r) { return +r.fill_rate; }),
        text: latest.map(function (r) { return r.plant; }),
        textposition: "top center",
        marker: {
          size: latest.map(function (r) { return Math.max(12, (+r.orders) / 70); }),
          color: latest.map(function (r) { return +r.otif; }),
          colorscale: [[0, "#E11D48"], [0.5, "#38BDF8"], [1, "#0D9488"]],
          cmin: 0.86,
          cmax: 0.98,
          showscale: true,
          colorbar: { title: "OTIF", thickness: 12, len: 0.7 },
        },
        hovertemplate: "%{text}<br>Turns %{x:.1f}<br>Fill %{y:.1%}<extra></extra>",
      }],
      Object.assign({}, PLOT_LAYOUT, {
        xaxis: { title: "Inventory turns", gridcolor: "#D9E2EC" },
        yaxis: { title: "Fill rate", tickformat: ".0%", gridcolor: "#D9E2EC", range: [0.88, 1] },
        showlegend: false,
      }),
      { responsive: true, displayModeBar: false }
    );
  }

  function plotRegional(regional, latestMonth) {
    const latest = regional.filter(function (r) { return r.month === latestMonth; });
    Plotly.newPlot(
      "chart-regional",
      [{
        type: "bar",
        orientation: "h",
        y: latest.map(function (r) { return r.country + " · " + r.region; }),
        x: latest.map(function (r) { return +r.otif; }),
        text: latest.map(function (r) { return fmtPct(+r.otif); }),
        textposition: "auto",
        marker: {
          color: latest.map(function (r) {
            return +r.otif >= 0.95 ? "#0D9488" : (+r.otif >= 0.92 ? "#0EA5E9" : "#E11D48");
          }),
        },
        hovertemplate: "%{y}<br>OTIF %{x:.1%}<br>Sales %{customdata}<extra></extra>",
        customdata: latest.map(function (r) { return fmtMoney(+r.sales_cad); }),
      }],
      Object.assign({}, PLOT_LAYOUT, {
        xaxis: { tickformat: ".0%", range: [0.8, 1], gridcolor: "#D9E2EC", title: "OTIF" },
        yaxis: { automargin: true },
        margin: { t: 16, r: 20, b: 48, l: 140 },
        showlegend: false,
      }),
      { responsive: true, displayModeBar: false }
    );

    Plotly.newPlot(
      "chart-geo",
      [{
        type: "scattergeo",
        lon: latestMonthPlantsLon(window.__latestPlants || []),
        lat: latestMonthPlantsLat(window.__latestPlants || []),
        text: (window.__latestPlants || []).map(function (r) {
          return r.plant + "<br>OTIF " + fmtPct(+r.otif) + "<br>" + r.market;
        }),
        marker: {
          size: (window.__latestPlants || []).map(function (r) { return Math.max(12, (+r.orders) / 80); }),
          color: (window.__latestPlants || []).map(function (r) { return +r.otif; }),
          colorscale: [[0, "#E11D48"], [0.5, "#38BDF8"], [1, "#0D9488"]],
          cmin: 0.86,
          cmax: 0.98,
          line: { width: 1, color: "#102A43" },
          colorbar: { title: "OTIF", thickness: 12 },
        },
        hoverinfo: "text",
      }],
      Object.assign({}, PLOT_LAYOUT, {
        geo: {
          scope: "north america",
          projection: { type: "natural earth" },
          center: { lat: 43.2, lon: -80.5 },
          lataxis: { range: [40.5, 46.5] },
          lonaxis: { range: [-88, -72] },
          showland: true,
          landcolor: "#E8F1F8",
          showlakes: true,
          lakecolor: "#F7FAFC",
          bgcolor: "rgba(0,0,0,0)",
          countrycolor: "#9FB3C8",
          coastlinecolor: "#829AB1",
        },
        margin: { t: 10, r: 10, b: 10, l: 10 },
        showlegend: false,
      }),
      { responsive: true, displayModeBar: false }
    );
  }

  function latestMonthPlantsLon(plants) {
    return plants.map(function (r) { return +r.lon; });
  }
  function latestMonthPlantsLat(plants) {
    return plants.map(function (r) { return +r.lat; });
  }

  function plotCategory(sales, latestMonth) {
    const rows = sales.filter(function (r) { return r.month === latestMonth; });
    const byCat = {};
    rows.forEach(function (r) {
      byCat[r.category] = (byCat[r.category] || 0) + +r.revenue_cad;
    });
    const cats = Object.keys(byCat).sort(function (a, b) { return byCat[b] - byCat[a]; });

    Plotly.newPlot(
      "chart-category",
      [{
        type: "bar",
        x: cats,
        y: cats.map(function (c) { return byCat[c]; }),
        marker: { color: ["#0284C7", "#0EA5E9", "#38BDF8", "#7DD3FC"] },
        hovertemplate: "%{x}<br>%{y:$,.0f}<extra></extra>",
      }],
      Object.assign({}, PLOT_LAYOUT, {
        yaxis: { title: "Revenue CAD", gridcolor: "#D9E2EC" },
        xaxis: { gridcolor: "#D9E2EC" },
        showlegend: false,
      }),
      { responsive: true, displayModeBar: false }
    );

    const byLine = {};
    rows.forEach(function (r) {
      const key = r.product_line;
      byLine[key] = (byLine[key] || 0) + +r.revenue_cad;
    });
    const lines = Object.keys(byLine).sort(function (a, b) { return byLine[b] - byLine[a]; }).slice(0, 7);
    Plotly.newPlot(
      "chart-product",
      [{
        type: "bar",
        orientation: "h",
        y: lines.slice().reverse(),
        x: lines.slice().reverse().map(function (k) { return byLine[k]; }),
        marker: { color: "#0284C7" },
        hovertemplate: "%{y}<br>%{x:$,.0f}<extra></extra>",
      }],
      Object.assign({}, PLOT_LAYOUT, {
        xaxis: { title: "Revenue CAD", gridcolor: "#D9E2EC" },
        yaxis: { automargin: true },
        margin: { t: 16, r: 16, b: 48, l: 130 },
        showlegend: false,
      }),
      { responsive: true, displayModeBar: false }
    );
  }

  function renderExceptions(exceptions, latestMonth) {
    const rows = exceptions
      .filter(function (r) { return r.month === latestMonth; })
      .sort(function (a, b) {
        const rank = { Critical: 0, Action: 1, Watch: 2 };
        return (rank[a.severity] - rank[b.severity]) || (+b.order_impact - +a.order_impact);
      })
      .slice(0, 10);

    const causeCount = {};
    exceptions.filter(function (r) { return r.month === latestMonth; }).forEach(function (r) {
      causeCount[r.root_cause] = (causeCount[r.root_cause] || 0) + +r.order_impact;
    });
    const causes = Object.keys(causeCount).sort(function (a, b) { return causeCount[b] - causeCount[a]; }).slice(0, 6);

    Plotly.newPlot(
      "chart-causes",
      [{
        type: "bar",
        x: causes,
        y: causes.map(function (c) { return causeCount[c]; }),
        marker: { color: "#0369A1" },
        hovertemplate: "%{x}<br>%{y} orders impacted<extra></extra>",
      }],
      Object.assign({}, PLOT_LAYOUT, {
        yaxis: { title: "Orders impacted", gridcolor: "#D9E2EC" },
        xaxis: { tickangle: -18, gridcolor: "#D9E2EC" },
        margin: { t: 16, r: 12, b: 90, l: 56 },
        showlegend: false,
      }),
      { responsive: true, displayModeBar: false }
    );

    const tbody = document.querySelector("#exceptions-table tbody");
    if (!tbody) return;
    tbody.innerHTML = rows.map(function (r) {
      const badge =
        r.severity === "Critical" ? "badge-bad" :
        r.severity === "Action" ? "badge-warn" : "badge-ok";
      return (
        "<tr>" +
        "<td>" + r.exception_id + "</td>" +
        "<td>" + r.plant + "</td>" +
        "<td>" + r.root_cause + "</td>" +
        "<td>" + r.order_impact + "</td>" +
        "<td><span class='badge " + badge + "'>" + r.severity + "</span></td>" +
        "<td>" + r.owner + "</td>" +
        "</tr>"
      );
    }).join("");
  }

  function unique(arr) {
    return Array.from(new Set(arr));
  }

  function wireNav() {
    const toggle = document.querySelector(".nav-toggle");
    const links = document.querySelector(".nav-links");
    if (toggle && links) {
      toggle.addEventListener("click", function () {
        const open = links.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
  }

  (async function init() {
    wireNav();
    try {
      const [ops, sales, exceptions, regional] = await Promise.all([
        loadCSV("ops_control_tower.csv"),
        loadCSV("sales_by_category.csv"),
        loadCSV("otif_exceptions.csv"),
        loadCSV("regional_performance.csv"),
      ]);

      const summary = renderKPIs(ops);
      window.__latestPlants = summary.latest;
      plotOtifTrend(ops);
      plotFreight(summary.latest);
      plotInventory(summary.latest);
      plotRegional(regional, summary.latestMonth);
      plotCategory(sales, summary.latestMonth);
      renderExceptions(exceptions, summary.latestMonth);

      const weak = summary.latest.slice().sort(function (a, b) { return +a.otif - +b.otif; })[0];
      const topCauseRows = exceptions.filter(function (r) { return r.month === summary.latestMonth; });
      const causeMap = {};
      topCauseRows.forEach(function (r) {
        causeMap[r.root_cause] = (causeMap[r.root_cause] || 0) + +r.order_impact;
      });
      const topCause = Object.keys(causeMap).sort(function (a, b) { return causeMap[b] - causeMap[a]; })[0] || "carrier delay";

      setInsight(
        "<strong>Insight · " + summary.latestMonth + ":</strong> Network OTIF is " +
        fmtPct(summary.otif) + " with " + summary.late + " late orders. " +
        (weak ? (weak.plant + " is the softest plant at " + fmtPct(+weak.otif) + ". ") : "") +
        "Top exception driver: <em>" + topCause + "</em>. Freight at " +
        fmtMoney(summary.freight) + " — review US cross-border lanes before the next planning cycle."
      );
    } catch (err) {
      console.error(err);
      setInsight("<strong>Data load issue:</strong> Could not fetch Tableau-ready CSVs from assets. Check GitHub Pages paths.");
    }
  })();
})();
