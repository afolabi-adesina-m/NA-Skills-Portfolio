(function () {
  var YEAR = "2024";
  var monthly = [];
  var tiers = [];
  var drivers = [];

  var FONT = "Segoe UI, Helvetica Neue, Arial, sans-serif";
  var INK = "#1D2D3E";
  var MUTED = "#556B82";
  var GRID = "#D9DEE4";
  var BLUE = "#0062D6";
  var TEAL = "#037C77";
  var ORANGE = "#E76500";
  var RED = "#C0392B";

  function parseCsv(text) {
    var lines = text.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
    var heads = splitLine(lines[0]);
    return lines.slice(1).filter(Boolean).map(function (line) {
      var cells = splitLine(line);
      var row = {};
      heads.forEach(function (h, i) { row[h] = cells[i] == null ? "" : cells[i]; });
      return row;
    });
  }

  function splitLine(line) {
    var out = [];
    var cur = "";
    var q = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (ch === '"') q = !q;
      else if (ch === "," && !q) { out.push(cur); cur = ""; }
      else cur += ch;
    }
    out.push(cur);
    return out;
  }

  function num(v) { return Number(v) || 0; }

  function rowsFor(year) {
    if (year === "all") return monthly;
    return monthly.filter(function (r) { return r.shipment_year === year; });
  }

  function sum(rows, key) {
    return rows.reduce(function (s, r) { return s + num(r[key]); }, 0);
  }

  function weighted(rows, key) {
    var w = sum(rows, "total_shipments");
    if (!w) return 0;
    return rows.reduce(function (s, r) { return s + num(r[key]) * num(r.total_shipments); }, 0) / w;
  }

  function pack(rows) {
    return {
      revenue: sum(rows, "total_revenue"),
      shipments: sum(rows, "total_shipments"),
      failed: sum(rows, "total_failed_deliveries"),
      drivers: rows.reduce(function (m, r) { return Math.max(m, num(r.active_drivers)); }, 0),
      onTime: weighted(rows, "overall_on_time_rate_pct"),
      delay: weighted(rows, "avg_delay_days")
    };
  }

  function rel(now, then) {
    if (!then) return 0;
    return ((now - then) / then) * 100;
  }

  function money(n) { return "$" + (n / 1e6).toFixed(1) + "M"; }
  function commas(n) { return Math.round(n).toLocaleString("en-US"); }
  function one(n) { return (Math.round(n * 10) / 10).toFixed(1); }
  function signed(n) { return (n < 0 ? "" : "") + Math.abs(n).toFixed(1); }

  function delta(now, then, kind) {
    if (YEAR === "all") return { text: "2023 and 2024 combined", tone: "flat" };
    var betterWhenLower = kind === "failed" || kind === "delay";
    var change = now - then;
    var down = change < 0;
    var tone = "flat";
    if (Math.abs(kind === "delay" ? change : rel(now, then)) >= 0.05) {
      tone = betterWhenLower ? (down ? "good" : "bad") : (down ? "bad" : "good");
    }
    var text;
    if (kind === "delay") {
      text = Math.abs(change).toFixed(2) + " days " + (down ? "lower" : "higher") + " than " + then.toFixed(2);
    } else if (kind === "onTime") {
      text = signed(rel(now, then)) + "% " + (down ? "lower" : "higher") + " than " + one(then) + "%";
    } else if (kind === "revenue") {
      text = signed(rel(now, then)) + "% " + (down ? "lower" : "higher") + " than " + money(then);
    } else {
      text = signed(rel(now, then)) + "% " + (down ? "lower" : "higher") + " than " + commas(then);
    }
    if (kind === "drivers") text += ", peak month";
    return { text: text, tone: tone };
  }

  function card(label, value, d) {
    return '<article class="kpi"><p class="kpi-label">' + label + '</p><p class="kpi-value">' + value +
      '</p><p class="kpi-delta ' + d.tone + '">' + d.text + "</p></article>";
  }

  function renderKpis() {
    var now = pack(rowsFor(YEAR));
    var prior = pack(rowsFor(YEAR === "2024" ? "2023" : "2024"));
    var note = document.getElementById("year-note");
    if (YEAR === "all") note.textContent = "2023 and 2024 combined.";
    else note.textContent = YEAR + ". Change versus " + (YEAR === "2024" ? "2023" : "2024") + ".";
    document.getElementById("kpis").innerHTML = [
      card("Total Revenue ($M)", (now.revenue / 1e6).toFixed(1), delta(now.revenue, prior.revenue, "revenue")),
      card("Total Shipments", commas(now.shipments), delta(now.shipments, prior.shipments, "count")),
      card("Failed Deliveries", commas(now.failed), delta(now.failed, prior.failed, "failed")),
      card("Active Drivers", commas(now.drivers), delta(now.drivers, prior.drivers, "drivers")),
      card("On-Time Rate", one(now.onTime) + "%", delta(now.onTime, prior.onTime, "onTime")),
      card("Avg Delay (Days)", one(now.delay), delta(now.delay, prior.delay, "delay"))
    ].join("");
  }

  function baseLayout(height) {
    return {
      height: height,
      margin: { t: 28, r: 52, b: 64, l: 52 },
      paper_bgcolor: "#fff",
      plot_bgcolor: "#fff",
      font: { family: FONT, color: INK, size: 12 },
      legend: { orientation: "h", y: 1.18, font: { color: INK, size: 12 } },
      hoverlabel: { bgcolor: "#1A2B3C", font: { color: "#E8EEF5", family: FONT } }
    };
  }

  function axis(title) {
    return { title: { text: title, font: { color: MUTED, size: 12 } }, gridcolor: GRID, zeroline: false, tickfont: { color: INK } };
  }

  function renderVolume() {
    var rows = rowsFor(YEAR);
    var x = rows.map(function (r) { return r.year_month; });
    Plotly.react("chart-volume", [
      { type: "bar", name: "Shipments", x: x, y: rows.map(function (r) { return num(r.total_shipments); }), marker: { color: BLUE }, hovertemplate: "%{x}<br>Shipments: %{y}<extra></extra>" },
      { type: "scatter", mode: "lines+markers", name: "On time %", x: x, y: rows.map(function (r) { return num(r.overall_on_time_rate_pct); }), yaxis: "y2", line: { color: TEAL, width: 2 }, marker: { size: 5, color: TEAL }, hovertemplate: "%{x}<br>On time: %{y}%<extra></extra>" }
    ], Object.assign(baseLayout(380), {
      yaxis: axis("Shipments"),
      yaxis2: { title: { text: "On time %", font: { color: MUTED, size: 12 } }, overlaying: "y", side: "right", range: [0, 45], showgrid: false, ticksuffix: "%", tickfont: { color: INK } },
      xaxis: { tickangle: -45, tickfont: { color: INK }, gridcolor: "#F5F6F7" },
      barmode: "group"
    }), { responsive: true, displayModeBar: false });
  }

  function tierLabel(raw) {
    if (/unmatched/i.test(raw) || raw === "" || raw == null) return "Unmatched";
    return raw;
  }

  function renderTier() {
    var order = ["Bronze", "Gold", "Silver", "Platinum", "Unknown", "Unmatched"];
    var map = {};
    tiers.forEach(function (t) { map[tierLabel(t.customer_tier)] = t; });
    var labels = order.filter(function (k) { return map[k]; });
    Plotly.react("chart-tier", [{
      type: "bar",
      x: labels,
      y: labels.map(function (k) { return num(map[k].total_declared_value) / 1e6; }),
      marker: { color: BLUE },
      customdata: labels.map(function (k) {
        var t = map[k];
        var note = k === "Unmatched"
          ? "Customer id did not match a customer row."
          : (k === "Unknown" ? "Tier was missing on the customer record." : "");
        return [commas(num(t.total_shipments)), commas(num(t.total_customers)), note];
      }),
      hovertemplate: "%{x}<br>$%{y:.2f} million<br>%{customdata[0]} shipments<br>%{customdata[1]} customers<br>%{customdata[2]}<extra></extra>"
    }], Object.assign(baseLayout(340), {
      margin: { t: 16, r: 16, b: 48, l: 48 },
      yaxis: axis("Revenue ($M)"),
      xaxis: { tickfont: { color: INK } },
      showlegend: false
    }), { responsive: true, displayModeBar: false });
  }

  function driverName(r) {
    var name = (r.full_name || "").trim();
    return name ? name : ("Driver " + r.driver_id);
  }

  function renderDrivers() {
    var names = drivers.map(driverName);
    Plotly.react("chart-drivers", [
      { type: "bar", name: "On time", x: names, y: drivers.map(function (r) { return num(r.on_time_deliveries); }), marker: { color: TEAL }, hovertemplate: "%{x}<br>On time: %{y}<extra></extra>" },
      { type: "bar", name: "Late", x: names, y: drivers.map(function (r) { return num(r.late_deliveries); }), marker: { color: ORANGE }, hovertemplate: "%{x}<br>Late: %{y}<extra></extra>" }
    ], Object.assign(baseLayout(340), {
      barmode: "stack",
      margin: { t: 36, r: 12, b: 88, l: 40 },
      yaxis: axis("Deliveries"),
      xaxis: { tickangle: -40, tickfont: { color: INK, size: 11 } }
    }), { responsive: true, displayModeBar: false });
  }

  function renderRates() {
    var rows = rowsFor(YEAR);
    var x = rows.map(function (r) { return r.year_month; });
    Plotly.react("chart-rates", [
      { type: "scatter", mode: "lines+markers", name: "Failure rate %", x: x, y: rows.map(function (r) { return num(r.failure_rate_pct); }), line: { color: RED, width: 2 }, marker: { size: 5, color: RED }, hovertemplate: "%{x}<br>Failure: %{y}%<extra></extra>" },
      { type: "scatter", mode: "lines+markers", name: "On time rate %", x: x, y: rows.map(function (r) { return num(r.overall_on_time_rate_pct); }), line: { color: TEAL, width: 2 }, marker: { size: 5, color: TEAL }, hovertemplate: "%{x}<br>On time: %{y}%<extra></extra>" }
    ], Object.assign(baseLayout(360), {
      yaxis: Object.assign(axis("Percent"), { ticksuffix: "%" }),
      xaxis: { tickangle: -45, tickfont: { color: INK } }
    }), { responsive: true, displayModeBar: false });
  }

  function render() {
    renderKpis();
    renderVolume();
    renderTier();
    renderDrivers();
    renderRates();
  }

  function bindYears() {
    document.querySelectorAll(".years button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        YEAR = btn.getAttribute("data-year");
        document.querySelectorAll(".years button").forEach(function (b) {
          b.setAttribute("aria-pressed", b === btn ? "true" : "false");
        });
        render();
      });
    });
  }

  Promise.all([
    fetch("data/gold_monthly_kpi_summary.csv").then(function (r) { return r.text(); }),
    fetch("data/revenue_by_tier.csv").then(function (r) { return r.text(); }),
    fetch("data/gold_driver_performance_top10.csv").then(function (r) { return r.text(); })
  ]).then(function (parts) {
    monthly = parseCsv(parts[0]);
    tiers = parseCsv(parts[1]);
    drivers = parseCsv(parts[2]);
    bindYears();
    render();
    window.addEventListener("resize", function () {
      ["chart-volume", "chart-tier", "chart-drivers", "chart-rates"].forEach(function (id) {
        var el = document.getElementById(id);
        if (el && el.data) Plotly.Plots.resize(el);
      });
    });
  }).catch(function () {
    document.getElementById("kpis").innerHTML = '<p class="year-note">The gold extracts did not load.</p>';
  });
})();
