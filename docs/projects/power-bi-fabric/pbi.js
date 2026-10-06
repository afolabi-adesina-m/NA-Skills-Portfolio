(function () {
  var ops = [];
  var exceptions = [];
  var selectedPlants = new Set();
  var selectedMonths = new Set();

  function money(n) {
    return "$" + Math.round(n).toLocaleString("en-CA");
  }
  function num(n, digits) {
    return n.toLocaleString("en-CA", { maximumFractionDigits: digits, minimumFractionDigits: digits });
  }
  function sum(rows, field) {
    return rows.reduce(function (s, r) { return s + (+r[field] || 0); }, 0);
  }
  function weighted(rows, rateField) {
    var orders = sum(rows, "orders");
    if (!orders) return 0;
    var acc = rows.reduce(function (s, r) { return s + ((+r[rateField] || 0) * (+r.orders || 0)); }, 0);
    return acc / orders;
  }
  function filteredOps() {
    return ops.filter(function (r) {
      var plantOk = selectedPlants.size === 0 || selectedPlants.has(r.plant);
      var monthOk = selectedMonths.size === 0 || selectedMonths.has(r.month);
      return plantOk && monthOk;
    });
  }
  function filteredEx() {
    return exceptions.filter(function (r) {
      var plantOk = selectedPlants.size === 0 || selectedPlants.has(r.plant);
      var monthOk = selectedMonths.size === 0 || selectedMonths.has(r.month);
      return plantOk && monthOk;
    });
  }
  function render() {
    var rows = filteredOps();
    var ex = filteredEx();
    var orders = sum(rows, "orders");
    var otif = weighted(rows, "otif");
    var fill = weighted(rows, "fill_rate");
    var freight = sum(rows, "freight_spend_cad");
    var tons = sum(rows, "inventory_tons");
    var perTonne = tons ? freight / tons : 0;
    var sales = sum(rows, "sales_cad");
    var gap = (otif - 0.95) * 100;
    var impact = sum(ex, "order_impact");
    document.getElementById("kpi-otif").textContent = num(otif * 100, 1) + "%";
    document.getElementById("kpi-fill").textContent = num(fill * 100, 1) + "%";
    document.getElementById("kpi-freight").textContent = money(perTonne);
    document.getElementById("kpi-sales").textContent = money(sales);
    document.getElementById("kpi-note").textContent =
      orders.toLocaleString("en-CA") + " orders. OTIF vs 95% target: " + num(gap, 1) +
      " percentage points. Exception order impact: " + impact.toLocaleString("en-CA") + ".";

    var byMonth = {};
    rows.forEach(function (r) {
      if (!byMonth[r.month]) byMonth[r.month] = [];
      byMonth[r.month].push(r);
    });
    var months = Object.keys(byMonth).sort();
    Plotly.newPlot("chart-otif", [{
      type: "scatter",
      mode: "lines+markers",
      x: months,
      y: months.map(function (m) { return weighted(byMonth[m], "otif"); }),
      line: { color: "#118dff", width: 3 },
      name: "OTIF"
    }], baseLayout({
      yaxis: { tickformat: ".0%", range: [0.8, 1], gridcolor: "#f3f2f1" },
      shapes: [{ type: "line", x0: months[0], x1: months[months.length - 1], y0: 0.95, y1: 0.95, line: { color: "#e8a317", dash: "dot" } }]
    }), plotOpts);

    var byPlant = {};
    rows.forEach(function (r) {
      byPlant[r.plant] = (byPlant[r.plant] || 0) + (+r.freight_spend_cad || 0);
    });
    var plants = Object.keys(byPlant).sort();
    Plotly.newPlot("chart-freight", [{
      type: "bar",
      x: plants,
      y: plants.map(function (p) { return byPlant[p]; }),
      marker: { color: "#12239e" }
    }], baseLayout({ yaxis: { gridcolor: "#f3f2f1" } }), plotOpts);

    var cause = {};
    ex.forEach(function (r) {
      cause[r.root_cause] = (cause[r.root_cause] || 0) + (+r.order_impact || 0);
    });
    var causes = Object.keys(cause).sort(function (a, b) { return cause[b] - cause[a]; });
    Plotly.newPlot("chart-cause", [{
      type: "bar",
      orientation: "h",
      y: causes,
      x: causes.map(function (c) { return cause[c]; }),
      marker: { color: "#d64550" }
    }], baseLayout({ margin: { t: 10, r: 10, b: 40, l: 150 }, xaxis: { gridcolor: "#f3f2f1" } }), plotOpts);

    var plantRows = {};
    rows.forEach(function (r) {
      if (!plantRows[r.plant]) plantRows[r.plant] = [];
      plantRows[r.plant].push(r);
    });
    var names = Object.keys(plantRows);
    Plotly.newPlot("chart-fill", [{
      type: "scatter",
      mode: "markers+text",
      x: names.map(function (p) { return weighted(plantRows[p], "fill_rate"); }),
      y: names.map(function (p) { return weighted(plantRows[p], "otif"); }),
      text: names,
      textposition: "top center",
      marker: { size: 14, color: "#118dff" }
    }], baseLayout({
      xaxis: { title: "Fill rate", tickformat: ".0%", gridcolor: "#f3f2f1" },
      yaxis: { title: "OTIF", tickformat: ".0%", gridcolor: "#f3f2f1" }
    }), plotOpts);
  }

  var plotOpts = { responsive: true, displayModeBar: false };
  function baseLayout(extra) {
    var layout = {
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      font: { family: "Segoe UI, Arial, sans-serif", color: "#605e5c", size: 11 },
      margin: { t: 16, r: 12, b: 48, l: 48 },
      showlegend: false
    };
    Object.keys(extra || {}).forEach(function (k) { layout[k] = extra[k]; });
    return layout;
  }

  function chip(container, label, set, value) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    btn.setAttribute("aria-pressed", "false");
    btn.addEventListener("click", function () {
      if (set.has(value)) set.delete(value);
      else set.add(value);
      btn.setAttribute("aria-pressed", set.has(value) ? "true" : "false");
      var all = container.parentElement.querySelector(".slicer-all");
      if (all) all.setAttribute("aria-pressed", set.size === 0 ? "true" : "false");
      render();
    });
    container.appendChild(btn);
  }

  function parseCSV(text) {
    var lines = text.trim().split(/\r?\n/);
    var headers = lines[0].split(",");
    return lines.slice(1).filter(Boolean).map(function (line) {
      var cols = line.split(",");
      var row = {};
      headers.forEach(function (h, i) { row[h] = cols[i]; });
      return row;
    });
  }

  var base = "/NA-Skills-Portfolio/assets/data/";
  Promise.all([
    fetch(base + "ops_control_tower.csv").then(function (r) { return r.text(); }),
    fetch(base + "otif_exceptions.csv").then(function (r) { return r.text(); })
  ]).then(function (texts) {
    ops = parseCSV(texts[0]);
    exceptions = parseCSV(texts[1]);
    var plants = Array.from(new Set(ops.map(function (r) { return r.plant; }))).sort();
    var months = Array.from(new Set(ops.map(function (r) { return r.month; }))).sort();
    var plantBox = document.getElementById("slicer-plants");
    var monthBox = document.getElementById("slicer-months");
    plants.forEach(function (p) { chip(plantBox, p, selectedPlants, p); });
    months.forEach(function (m) { chip(monthBox, m, selectedMonths, m); });
    document.querySelectorAll(".slicer-all").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = btn.getAttribute("data-target");
        if (target === "plants") selectedPlants.clear();
        if (target === "months") selectedMonths.clear();
        document.querySelectorAll("#" + (target === "plants" ? "slicer-plants" : "slicer-months") + " button")
          .forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
        btn.setAttribute("aria-pressed", "true");
        render();
      });
    });
    render();
  }).catch(function (err) {
    console.error(err);
    document.getElementById("kpi-note").textContent = "The ops extract did not load.";
  });
})();
