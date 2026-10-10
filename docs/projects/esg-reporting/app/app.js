/* ESG Reporting app: hash routing (forecast view added 10 October 2026), hand rolled SVG charts, no dependencies. Same pattern as the Supplier Spend app. */
(function () {
  "use strict";
  var state = { view: "mix", fy: "all", fs: "fed", lpm: 1000, months: 12, sites: 1 };
  var D = null;
  var VIEWS = ["mix", "emissions", "diesel", "forecast", "about"];
  var C = { loc: "#0070F2", for: "#049F9A", s1: "#0070F2", s2: "#89D1FF", fleet: "#1D2D3E" };
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  function money(v) {
    var a = Math.abs(v);
    if (a >= 1e9) return "C$" + (v / 1e9).toFixed(1) + "B";
    if (a >= 1e6) return "C$" + (v / 1e6).toFixed(1) + "M";
    if (a >= 1e3) return "C$" + (v / 1e3).toFixed(0) + "K";
    return "C$" + Math.round(v);
  }
  var num = function (v, d) { return Number(v).toLocaleString("en-CA", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); };
  var pct = function (v, d) { return (v * 100).toFixed(d == null ? 1 : d) + "%"; };
  var kt = function (v) { return num(v, 1) + " kt"; };
  var fyShort = function (y) { return "FY'" + y.slice(-2); };            // "2024-25" or "FY2024-25" to "FY'25"
  var fyLabel = function () { return state.fy === "all" ? "FY'24 to FY'26" : "FY'" + state.fy.slice(2); };
  var small = function () { return window.innerWidth < 700; };
  var chip = function (t) { return '<span class="scope">' + esc(t) + "</span>"; };
  var short = function (n) { return n === "United Kingdom of Great Britain and Northern Ireland" ? "United Kingdom" : n; };

  /* ---------- small UI builders ---------- */
  function comment(t) { return '<section class="card comment"><h2>What the numbers show</h2><p>' + esc(t) + "</p></section>"; }
  function tile(t) {
    var tag = t.go ? "button" : "div";
    return "<" + tag + ' class="tile"' + (t.go ? ' type="button" data-go="' + t.go + '"' : "") + ">" +
      '<span class="tile-title">' + esc(t.title) + "</span>" +
      '<span class="tile-sub">' + esc(t.sub || "") + "</span>" +
      '<span class="tile-val ' + (t.tone || "") + '">' + esc(t.val) + "</span>" +
      '<span class="tile-foot">' + esc(t.foot || "") + "</span>" + "</" + tag + ">";
  }
  function bars(rows) {
    var max = Math.max.apply(null, rows.map(function (r) { return r.v; })) || 1;
    return '<ul class="bars">' + rows.map(function (r) {
      return '<li><div class="bar-row"><span class="bar-name" title="' + esc(r.name) + '">' + esc(r.name) + '</span><span class="bar-val">' + esc(r.label) + "</span>" +
        '<span class="bar-track"><span class="bar-fill ' + (r.tone || "") + '" style="width:' + Math.max(0.6, (r.v / max) * 100).toFixed(2) + '%"></span></span></div></li>';
    }).join("") + "</ul>";
  }
  function legend(items) { return '<div class="legend">' + items.map(function (i) { return '<span><i style="background:' + i[1] + '"></i>' + esc(i[0]) + "</span>"; }).join("") + "</div>"; }
  function stacked(data, colors, names, opt) {
    // data: [[label, [v1, v2, ...]]]
    var W = opt.W || 640, H = 220, pl = 46, pb = 26, pt = 10, n = data.length;
    var max = Math.max.apply(null, data.map(function (d) { return d[1].reduce(function (a, b) { return a + b; }, 0); })) || 1;
    var bw = (W - pl - 8) / n, s = "";
    [0, 0.5, 1].forEach(function (f) {
      var y = pt + (H - pt - pb) * (1 - f);
      s += '<line class="axis" x1="' + pl + '" x2="' + W + '" y1="' + y + '" y2="' + y + '"/><text x="' + (pl - 6) + '" y="' + (y + 4) + '" text-anchor="end">' + esc(opt.axis(max * f)) + "</text>";
    });
    data.forEach(function (d, i) {
      var x = pl + i * bw + bw * 0.14, base = H - pb;
      d[1].forEach(function (v, j) {
        var h = (H - pt - pb) * v / max;
        s += '<rect x="' + x.toFixed(1) + '" y="' + (base - h).toFixed(1) + '" width="' + (bw * 0.72).toFixed(1) + '" height="' + h.toFixed(1) + '" fill="' + colors[j] + '"><title>' + esc(d[0] + ", " + names[j] + ": " + opt.fmt(v)) + "</title></rect>";
        base -= h;
      });
      if (!opt.every || i % opt.every === 0 || i === n - 1) s += '<text x="' + (x + bw * 0.36).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle">' + esc(d[0]) + "</text>";
    });
    return '<svg class="chart" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(opt.aria) + '">' + s + "</svg>";
  }
  function split(a, b, la, lb) {
    var t = a + b || 1;
    return '<div class="split-lab"><span><strong>' + esc(la) + "</strong> " + pct(a / t) + '</span><span><strong>' + esc(lb) + "</strong> " + pct(b / t) + "</span></div>" +
      '<div class="split" role="img" aria-label="' + esc(la + " " + pct(a / t) + ", " + lb + " " + pct(b / t)) + '"><span class="loc" style="width:' + (a / t * 100).toFixed(2) + '%"></span><span class="for" style="width:' + (b / t * 100).toFixed(2) + '%"></span></div>';
  }

  /* ---------- views ---------- */
  function mix() {
    var P = D.proc, S = P[state.fy], L = S.local, F = S.foreign;
    var seg = '<section class="filterbar inline" aria-label="Filters"><div class="fb-group" role="group" aria-labelledby="fb-fy"><span class="fb-label" id="fb-fy">Fiscal year</span><div class="seg" id="f-fy">' +
      ["all", "fy24", "fy25", "fy26"].map(function (k) { return '<button type="button" data-fy="' + k + '" aria-pressed="' + (state.fy === k) + '">' + (k === "all" ? "All" : "FY'" + k.slice(2)) + "</button>"; }).join("") + "</div></div></section>";
    var fyData = P.byFY.map(function (r) { return [r[0], [r[1], r[2]]]; });
    var fyRows = P.byFY.map(function (r) { return "<tr><td>" + esc(r[0]) + '</td><td class="num">' + num(r[3]) + '</td><td class="num">' + num(r[4]) + '</td><td class="num">' + pct(r[2] / (r[1] + r[2])) + "</td></tr>"; }).join("");
    var provRows = S.provinces.map(function (p) { return { name: p[0], v: p[1], label: money(p[1]) + ", " + num(p[2]) + " suppliers", tone: p[0] === "Postal code not usable" ? "muted" : "" }; });
    var ctyRows = S.countries.map(function (c) { return { name: short(c[0]), v: c[1], label: money(c[1]) + ", " + num(c[2]) + " suppliers", tone: "foreign" }; });
    var top3 = S.topForeign.slice(0, 3).reduce(function (a, t) { return a + t[2]; }, 0);
    var on = S.provinces.filter(function (p) { return p[0] === "Ontario"; })[0];
    var topRows = S.topForeign.map(function (t, i) { return '<tr><td class="num">' + (i + 1) + "</td><td>" + esc(t[0]) + '</td><td class="hide-sm">' + esc(short(t[1])) + '</td><td class="num">' + money(t[2]) + '</td><td class="num hide-sm">' + pct(t[2] / F.spend) + "</td></tr>"; }).join("");
    return '<h1 class="v-title">Supplier mix, local and foreign ' + chip(fyLabel()) + "</h1>" + seg +
      '<div class="tiles">' + [
        { title: "Suppliers paid", sub: "Suggested masters", val: num(S.suppliers), foot: num(S.contracts) + " contracts" },
        { title: "Local suppliers", sub: "Canadian address", val: num(L.suppliers), tone: "info", foot: pct(L.suppliers / S.suppliers) + " of suppliers" },
        { title: "Foreign suppliers", sub: "Address outside Canada", val: num(F.suppliers), foot: num(F.countries) + " countries" },
        { title: "Local spend", sub: "Contract value", val: money(L.spend), tone: "info", foot: pct(L.spend / S.spend) + " of spend" },
        { title: "Foreign spend", sub: "Contract value", val: money(F.spend), foot: pct(F.spend / S.spend) + " of spend" }
      ].map(tile).join("") + "</div>" +
      '<div class="grid two"><section class="card"><h2>Split by count and spend</h2>' +
      '<p class="c-sub">Suppliers</p>' + split(L.suppliers, F.suppliers, "Local", "Foreign") +
      '<p class="c-sub">Spend</p>' + split(L.spend, F.spend, "Local", "Foreign") +
      '<p class="c-sub">Contracts</p>' + split(L.contracts, F.contracts, "Local", "Foreign") + "</section>" +
      '<section class="card"><h2>Spend by fiscal year</h2>' + stacked(fyData, [C.loc, C.for], ["Local", "Foreign"], { W: small() ? 360 : 640, axis: function (v) { return money(v).replace("C$", ""); }, fmt: money, aria: "Local and foreign spend by fiscal year" }) +
      legend([["Local", C.loc], ["Foreign", C.for]]) + "</section></div>" +
      '<div class="grid two"><section class="card"><h2>Local spend by province</h2><p class="c-sub">From the supplier postal code</p>' + bars(provRows) + "</section>" +
      '<section class="card"><h2>Foreign spend by country</h2><p class="c-sub">Top 8 countries</p>' + bars(ctyRows) +
      '<p class="note">Other ' + num(S.otherCountries.countries) + " countries: " + money(S.otherCountries.spend) + ".</p></section></div>" +
      '<div class="grid two"><section class="card"><h2>Largest foreign suppliers</h2><div class="table-wrap"><table><thead><tr><th class="num">#</th><th>Supplier</th><th class="hide-sm">Country</th><th class="num">Spend</th><th class="num hide-sm">Share of foreign</th></tr></thead><tbody>' + topRows + "</tbody></table></div></section>" +
      '<section class="card"><h2>Suppliers by fiscal year</h2><div class="table-wrap"><table><thead><tr><th>Year</th><th class="num">Local</th><th class="num">Foreign</th><th class="num">Foreign spend</th></tr></thead><tbody>' + fyRows + "</tbody></table></div></section></div>" +
      comment(pct(L.suppliers / S.suppliers) + " of suppliers and " + pct(L.spend / S.spend) + " of spend are local in " + fyLabel() + ". Foreign spend is concentrated: the top 3 suppliers hold " + pct(top3 / F.spend) + " of foreign spend. " + (on ? "Ontario takes " + pct(on[1] / L.spend) + " of local spend." : ""));
  }
  function emissions() {
    var E = D.em, d = E.diesel;
    var cut = 1 - E.total / E.baseTotal, yoy = E.total / E.prevTotal - 1;
    var src = E.bySourceScope.map(function (r, i) { return { name: r[0], v: r[1], label: kt(r[1]) + ", " + pct(r[1] / E.total), tone: ["", "s2", "fleet"][i] }; });
    var cat = E.byCategory.map(function (c) { return { name: c[0] + ", scope " + c[1], v: c[2], label: kt(c[2]), tone: c[1] === 2 ? "s2" : "" }; });
    var tr = E.trend.map(function (t) { return [fyShort(t[0]), [t[1], t[2], t[3]]]; });
    var fleet = E.fleetTypes.map(function (f) { return { name: f[0], v: f[1], label: kt(f[1]), tone: "fleet" }; });
    var nameLoc = { NU: "Nunavut", QC: "Quebec", BC: "British Columbia", NS: "Nova Scotia", ON: "Ontario" };
    return '<h1 class="v-title">Emissions by scope and source ' + chip(fyShort(E.year) + ", federal operations") + "</h1>" +
      '<div class="tiles">' + [
        { title: "Scope 1 and 2", sub: fyShort(E.year) + ", " + E.orgs + " organizations", val: kt(E.total), foot: "Facilities and fleet" },
        { title: "Scope 1", sub: "Fuel burned on site and in vehicles", val: kt(E.scope1), tone: "info", foot: pct(E.scope1 / E.total) + " of total" },
        { title: "Scope 2", sub: "Purchased electricity, heat, cooling", val: kt(E.scope2), foot: pct(E.scope2 / E.total) + " of total" },
        { title: "Since " + fyShort(E.base), sub: "Change in total", val: "minus " + pct(cut), tone: "pos", foot: kt(E.baseTotal) + " in " + fyShort(E.base) },
        { title: "Since " + fyShort("2023-24"), sub: "Change in total", val: (yoy < 0 ? "minus " : "plus ") + pct(Math.abs(yoy)), tone: yoy < 0 ? "pos" : "crit", foot: kt(E.prevTotal) + " in FY'24" }
      ].map(tile).join("") + "</div>" +
      '<div class="grid two"><section class="card"><h2>By source and scope</h2>' + bars(src) +
      '<p class="note">Facilities cover offices, defence bases, laboratories, warehouses and other buildings.</p></section>' +
      '<section class="card"><h2>By energy type</h2>' + bars(cat) + "</section></div>" +
      '<section class="card"><h2>Trend since ' + fyShort(E.base) + "</h2>" + stacked(tr, [C.s1, C.s2, C.fleet], ["Facilities, scope 1", "Facilities, scope 2", "Fleet, scope 1"], { W: small() ? 360 : 1100, every: small() ? 5 : 3, axis: function (v) { return num(v, 0); }, fmt: kt, aria: "Federal scope 1 and 2 emissions by year, kilotonnes" }) +
      legend([["Facilities, scope 1", C.s1], ["Facilities, scope 2", C.s2], ["Fleet, scope 1", C.fleet]]) + '<p class="note">No data published for FY\'07 to FY\'10.</p></section>' +
      '<div class="grid two"><section class="card"><h2>Diesel in ' + fyShort(E.year) + "</h2>" +
      '<div class="facets"><div class="facet"><span>Facilities</span><strong>' + num(d.facilityKt, 1) + ' kt</strong></div><div class="facet"><span>Fleet</span><strong>' + num(d.fleetKt, 1) + ' kt</strong></div><div class="facet"><span>Fleet litres</span><strong>' + num(d.fleetL / 1e6, 1) + " million</strong></div></div>" +
      '<p class="c-sub">Facility diesel by location</p>' + bars(d.facilityTop.map(function (t) { return { name: nameLoc[t[0]] || t[0], v: t[1], label: num(t[1], 2) + " kt" }; })) +
      '<p class="note"><a href="#/diesel">Try the diesel calculator</a></p></section>' +
      '<section class="card"><h2>Fleet by type</h2>' + bars(fleet) + "</section></div>" +
      comment("Federal operations emitted " + kt(E.total) + " in " + fyShort(E.year) + ", " + pct(cut) + " below " + fyShort(E.base) + ". Scope 1 is " + pct(E.scope1 / E.total) + " of the total, and natural gas is the largest single source. Scope 2 fell from " + kt(E.trend[0][2]) + " to " + kt(E.scope2) + " over the period. Diesel at facilities added " + num(d.facilityKt, 1) + " kt, led by Nunavut.");
  }
  function calc() {
    var f = D.factor, L = state.lpm * state.months * state.sites;
    return { L: L, t: L * f.co2e / 1e6, co2: L * f.co2 / 1e6, ch4: L * f.ch4 * f.gwpCh4 / 1e6, n2o: L * f.n2o * f.gwpN2o / 1e6 };
  }
  function dieselOut() {
    var f = D.factor, r = calc(), share = r.t / (D.em.diesel.facilityKt * 1000);
    return '<div class="calc-out">' + [
      { title: "Diesel burned", sub: "Litres", val: num(r.L) },
      { title: "Emissions", sub: "Tonnes CO2e", val: num(r.t, r.t < 10 ? 2 : 1), tone: "info" },
      { title: "Factor", sub: "kg CO2e per litre", val: num(f.co2e / 1000, 3) }
    ].map(tile).join("") + "</div>" +
      '<section class="card"><h2>By gas</h2><div class="table-wrap"><table><thead><tr><th>Gas</th><th class="num hide-sm">g per litre</th><th class="num hide-sm">GWP</th><th class="num">g CO2e per litre</th><th class="num">Tonnes CO2e</th></tr></thead><tbody>' +
      [["CO2", f.co2, 1, r.co2], ["CH4", f.ch4, f.gwpCh4, r.ch4], ["N2O", f.n2o, f.gwpN2o, r.n2o]].map(function (g) {
        return "<tr><td>" + g[0] + '</td><td class="num hide-sm">' + num(g[1], g[1] < 1 ? 3 : 0) + '</td><td class="num hide-sm">' + g[2] + '</td><td class="num">' + num(g[1] * g[2], 3) + '</td><td class="num">' + num(g[3], 3) + "</td></tr>";
      }).join("") + '<tr><td><strong>Total</strong></td><td class="hide-sm"></td><td class="hide-sm"></td><td class="num"><strong>' + num(f.co2e, 3) + '</strong></td><td class="num"><strong>' + num(r.t, 3) + "</strong></td></tr></tbody></table></div>" +
      '<p class="formula">Tonnes CO2e = litres &times; ' + num(f.co2e, 3) + " g &divide; 1,000,000</p></section>" +
      comment(num(r.L) + " litres of diesel give " + num(r.t, 1) + " tonnes CO2e. CO2 is " + pct(f.co2 / f.co2e) + " of the total. That equals " + pct(share, share < 0.01 ? 2 : 1) + " of the diesel emissions from all federal facilities in " + fyShort(D.em.year) + ".");
  }
  function diesel() {
    var field = function (id, lab, v, hint, max) { return '<div class="field"><label for="' + id + '">' + lab + '</label><input type="number" id="' + id + '" inputmode="decimal" min="0" max="' + max + '" step="any" value="' + v + '" /><span class="hint">' + hint + "</span></div>"; };
    return '<h1 class="v-title">Diesel generator calculator ' + chip("ECCC factor") + "</h1>" +
      '<div class="grid two"><section class="card"><h2>Inputs</h2><form class="form" id="calc" novalidate>' +
      field("c-lpm", "Litres per month, per site", state.lpm, "Example value. Change it.", 10000000) +
      field("c-months", "Months", state.months, "1 to 12", 12) +
      field("c-sites", "Sites", state.sites, "Generators or sites", 100000) +
      "</form></section>" +
      '<section class="card"><h2>Official factor</h2><p class="c-sub">ECCC, Emission Factors and Reference Values, Version 4.0, Table 4.3 (2026), stationary diesel. GWP from the Greenhouse Gas Pollution Pricing Act, Schedule 3.</p>' +
      '<div class="facets"><div class="facet"><span>CO2</span><strong>' + num(D.factor.co2) + ' g/L</strong></div><div class="facet"><span>CH4</span><strong>' + D.factor.ch4 + ' g/L</strong></div><div class="facet"><span>N2O</span><strong>' + D.factor.n2o + " g/L</strong></div></div></section></div>" +
      '<div id="calc-out">' + dieselOut() + "</div>";
  }
  function about() {
    var P = D.proc, A = P.all, np = A.provinces.filter(function (p) { return p[0] === "Postal code not usable"; })[0];
    var src = [
      ["Proactive Publication, Contracts", "Treasury Board of Canada Secretariat. 179,829 contracts, 1 April 2023 to 31 March 2026. Open Government Licence, Canada. Accessed 6 October 2026.", "https://open.canada.ca/data/en/dataset/d8f85d91-7dec-4fd1-8055-483b77225d8b"],
      ["Greenhouse Gas Emissions Inventory, Items 1 to 3", "Treasury Board of Canada Secretariat, Centre for Greening Government. FY'06 and FY'11 to FY'25, published 17 February 2026. Open Government Licence, Canada. Accessed 7 October 2026.", "https://open.canada.ca/data/en/dataset/6bed41cd-9816-4912-a2b8-b0b224909396"],
      ["Emission Factors and Reference Values, Version 4.0", "Environment and Climate Change Canada, September 2026, Table 4.3, from the National Inventory Report 1990 to 2023, Part 2, Table A6.1-6. Crown copyright, cited with credit for non-commercial use.", "https://publications.gc.ca/site/eng/9.964686/publication.html"],
      ["Greenhouse Gas Pollution Pricing Act, Schedule 3", "Global warming potentials: CH4 28, N2O 265. Justice Laws Website.", "https://laws-lois.justice.gc.ca/eng/acts/G-11.55/FullText.html"]
    ];
    return '<div class="about"><h1 class="v-title">Data and method</h1>' +
      '<section class="card"><h2>Sources and licences</h2><ol class="src-list">' + src.map(function (s) { return '<li><a href="' + s[2] + '" target="_blank" rel="noopener">' + esc(s[0]) + "</a><span>" + esc(s[1]) + "</span></li>"; }).join("") + "</ol></section>" +
      '<div class="grid two"><section class="card"><h2>Method</h2><ol class="plain">' +
      "<li>Suppliers are the cleaned master names from the Supplier Spend app.</li>" +
      "<li>Local means the vendor country on the contract is Canada. Each master takes the country of its highest spend name. " + num(P.mixedCountryMasters) + " masters had names in more than one country.</li>" +
      "<li>Province comes from the first letter of the postal code. " + num(np ? np[2] : 0) + " local suppliers have no usable code.</li>" +
      "<li>Spend is contract value in Canadian dollars. FY'25 runs April 2024 to March 2025.</li>" +
      "<li>Emissions are kilotonnes CO2e as published. Energy types are grouped into simple labels.</li></ol></section>" +
      '<section class="card"><h2>Limits</h2><ul class="plain">' +
      "<li>Vendor country is the address on the contract, not the owner. A Canadian branch of a foreign firm counts as local.</li>" +
      "<li>The open emissions data leaves out CSE and some facilities, so totals can differ slightly from the summary tables on canada.ca.</li>" +
      "<li>Spend and emissions are separate datasets shown side by side. Scope 3 supply chain emissions are not covered.</li>" +
      "<li>The calculator uses the stationary diesel factor. Vehicles use different CH4 and N2O factors.</li></ul></section></div>" +
      comment("All figures come from public Government of Canada files. The supplier split reuses the cleaned supplier keys from the spend work, and the calculator uses the published ECCC factor with no changes. Figures are unaudited.") + "</div>";
  }
  /* ---------- forecast view (precomputed in Python, data/forecast.json) ---------- */
  var FC = null, fcLoading = false;
  var MC = { act: "#1D2D3E", ets: "#0070F2", arima: "#7858FF", linear: "#E76500", snaive: "#6A7682", path: "#AA0808", gg: "#256F3A" };
  var MN = { ets: "ETS", arima: "AutoARIMA", linear: "Linear trend", snaive: "Seasonal naive" };
  var SERIES = ["fed", "can", "us"];
  function n2(v) { return num(v, 2); }
  function fcSeries() { return FC.series.filter(function (s) { return s.key === state.fs; })[0]; }
  function yLab(S, y) { return S.key === "fed" ? "FY'" + String(y + 1).slice(-2) : String(y); }        // fed years are fiscal start years
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function tLab(S, t) { if (S.freq === "year") return yLab(S, t); var p = String(t).split("-"); return MONTHS[+p[1] - 1] + " " + p[0]; }
  function xOf(S, t) { if (S.freq === "year") return t; var p = String(t).split("-"); return +p[0] + (+p[1] - 1) / 12; }
  function amt(S, v) { return num(v, 1) + " " + S.unit.split(" ")[0]; }
  function fcChart(S) {
    var W = small() ? 360 : 1100, H = small() ? 300 : 340, pl = small() ? 40 : 52, pr = small() ? 18 : 24, pt = 12, pb = 26;
    var from = S.chartFrom ? xOf(S, S.chartFrom) : xOf(S, S.actual.t[0]), x0 = S.key === "fed" ? 2005 : from, x1 = S.freq === "year" ? FC.end : FC.end + 11 / 12;
    var act = S.actual.t.map(function (t, i) { return [xOf(S, t), S.actual.v[i]]; }).filter(function (p) { return p[0] >= from; });
    var fx = S.fcT.map(function (t) { return xOf(S, t); });
    var monthly = S.freq === "month", pv = function (y) { return S.pathway[y] / (monthly ? 12 : 1); };
    var path = [];
    for (var y = FC.baseYear; y <= FC.end; y++) { path.push([y, pv(y)]); if (monthly) path.push([y + 11 / 12, pv(y)]); }
    var b = S.fc[S.best], vals = act.map(function (p) { return p[1]; }).concat(b.lo80, b.hi80, path.map(function (p) { return p[1]; }));
    ["ets", "arima", "linear", "snaive"].forEach(function (k) { vals = vals.concat(S.fc[k].mean); });
    if (S.gg) vals.push(S.gg.base, S.gg.target2025);
    var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals), raw = (hi - lo) / 4, mag = Math.pow(10, Math.floor(Math.log10(raw)));
    var tick = [1, 2, 2.5, 5, 10].map(function (k) { return k * mag; }).filter(function (k) { return k >= raw; })[0];
    lo = Math.floor(lo / tick) * tick; hi = Math.ceil(hi / tick) * tick;
    var X = function (v) { return pl + (W - pl - pr) * (v - x0) / (x1 - x0); }, Y = function (v) { return pt + (H - pt - pb) * (1 - (v - lo) / (hi - lo)); };
    var line = function (pts) { return pts.map(function (p, i) { return (i ? "L" : "M") + X(p[0]).toFixed(1) + " " + Y(p[1]).toFixed(1); }).join(""); };
    var last = act[act.length - 1], s = "";
    for (var v = lo; v <= hi + tick / 2; v += tick) {
      var yy = Y(v);
      s += '<line class="axis" x1="' + pl + '" x2="' + (W - pr) + '" y1="' + yy.toFixed(1) + '" y2="' + yy.toFixed(1) + '"/><text x="' + (pl - 6) + '" y="' + (yy + 4).toFixed(1) + '" text-anchor="end">' + num(v, 0) + "</text>";
    }
    var step = S.freq === "year" ? (small() ? 10 : 5) : (small() ? 5 : 2), first = Math.ceil(x0 / step) * step;
    for (var t = first; t <= Math.floor(x1); t += step) s += '<text x="' + X(t).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="' + (X(t) > W - 30 ? "end" : "middle") + '">' + esc(S.freq === "year" ? yLab(S, t) : String(t)) + "</text>";
    var bandUp = fx.map(function (x, i) { return [x, b.hi80[i]]; }), bandDn = fx.map(function (x, i) { return [x, b.lo80[i]]; }).reverse();
    s += '<path d="' + line(bandUp) + line(bandDn).replace("M", "L") + 'Z" fill="' + MC[S.best] + '" fill-opacity=".14" stroke="none"><title>80% range, ' + esc(MN[S.best]) + "</title></path>";
    if (S.gg) {
      var gy = Y(S.gg.target2025);
      s += '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + gy.toFixed(1) + '" y2="' + gy.toFixed(1) + '" stroke="' + MC.gg + '" stroke-dasharray="2 4" stroke-width="1.5"><title>Greening Government target: 40% below FY\'06 by 2025, ' + kt(S.gg.target2025) + "</title></line>";
      s += '<circle cx="' + X(2005).toFixed(1) + '" cy="' + Y(S.gg.base).toFixed(1) + '" r="4" fill="' + MC.act + '"><title>FY\'06: ' + kt(S.gg.base) + "</title></circle>";
    }
    s += '<path d="' + line(path) + '" fill="none" stroke="' + MC.path + '" stroke-width="2" stroke-dasharray="7 5"><title>SBTi Absolute Contraction, 4.2% a year from ' + FC.baseYear + "</title></path>";
    s += '<path d="' + line([last].concat(fx.map(function (x, i) { return [x, S.fc.snaive.mean[i]]; }))) + '" fill="none" stroke="' + MC.snaive + '" stroke-width="1.5" stroke-dasharray="3 4"/>';
    ["linear", "arima", "ets"].forEach(function (k) {
      s += '<path d="' + line([last].concat(fx.map(function (x, i) { return [x, S.fc[k].mean[i]]; }))) + '" fill="none" stroke="' + MC[k] + '" stroke-width="' + (k === S.best ? 2.6 : 1.6) + '"><title>' + esc(MN[k]) + "</title></path>";
    });
    s += '<path d="' + line(act) + '" fill="none" stroke="' + MC.act + '" stroke-width="2"/>';
    if (S.freq === "year") act.forEach(function (p) { s += '<circle cx="' + X(p[0]).toFixed(1) + '" cy="' + Y(p[1]).toFixed(1) + '" r="2.4" fill="' + MC.act + '"><title>' + esc(yLab(S, p[0]) + ": " + amt(S, p[1])) + "</title></circle>"; });
    return '<svg class="chart" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(S.name + ": actuals, three model forecasts to " + FC.end + ", seasonal naive reference and the SBTi pathway") + '">' + s + "</svg>";
  }
  function overlapNote(S) {
    var same = ["ets", "arima"].filter(function (k) { return S.fc[k].mean.every(function (v, i) { return Math.abs(v - S.fc.snaive.mean[i]) < 0.01 * S.fc.snaive.mean[i]; }); });
    return same.length ? '<p class="note">' + same.map(function (k) { return MN[k]; }).join(" and ") + " give the same flat forecast as the seasonal naive line here, so the lines sit on top of each other.</p>" : "";
  }
  function fcLegend(S) {
    var it = [["Actual", MC.act, ""], ["ETS", MC.ets, ""], ["AutoARIMA", MC.arima, ""], ["Linear trend", MC.linear, ""], ["Seasonal naive, reference", MC.snaive, "dash"], ["SBTi 1.5C pathway" + (S.freq === "month" ? ", monthly average" : ""), MC.path, "dash"], ["80% range, " + MN[S.best], MC[S.best], "band"]];
    if (S.gg) it.push(["Greening Government 2025 target", MC.gg, "dot"]);
    return '<div class="legend">' + it.map(function (i) { return '<span><i class="ln ' + i[2] + '" style="--c:' + i[1] + '"></i>' + esc(i[0]) + "</span>"; }).join("") + "</div>";
  }
  function formulaCards(S) {
    var e = S.ets, a = S.arima, L = S.linear, best = S.holdout[S.best], c = [];
    var sym = function (rows) { return '<ul class="sym">' + rows.map(function (r) { return "<li><strong>" + r[0] + "</strong> " + esc(r[1]) + "</li>"; }).join("") + "</ul>"; };
    var card = function (h, f, s, ex) { return '<section class="card fcard"><h2>' + esc(h) + '</h2><p class="formula">' + f + "</p>" + s + '<p class="c-sub ex-h">Worked example</p><p class="formula ex">' + ex + "</p></section>"; };
    var firstT = tLab(S, S.fcT[0]), endT = S.freq === "year" ? yLab(S, FC.end) : "December " + FC.end;
    // ETS
    if (e.trend === "N" && e.season === "N") {
      c.push(card("ETS, chosen model " + e.method, "l<sub>t</sub> = &alpha; &times; y<sub>t</sub> + (1 - &alpha;) &times; l<sub>t-1</sub><br>forecast = l<sub>T</sub> for every future year",
        sym([["l", "level, the smoothed value"], ["y", "actual emissions"], ["\u03b1", "weight on the newest year, from 0 to 1, fitted"], ["T", "last year with data"]]),
        "&alpha; = " + num(e.alpha, 4) + ", y<sub>T</sub> = " + n2(e.lastY) + ", l<sub>T-1</sub> = " + n2(e.prevLevel) + "<br>l<sub>T</sub> = " + num(e.alpha, 4) + " &times; " + n2(e.lastY) + " + " + num(1 - e.alpha, 4) + " &times; " + n2(e.prevLevel) + " = " + n2(e.level) + "<br>Forecast for " + esc(firstT) + " and every year after: " + n2(e.fc1)));
    } else {
      c.push(card("ETS, chosen model " + e.method, "forecast<sub>T+h</sub> = l<sub>T</sub> + (&phi; + &phi;<sup>2</sup> + ... + &phi;<sup>h</sup>) &times; b<sub>T</sub> + s<sub>month</sub>",
        sym([["l", "level, updated with weight \u03b1 = " + num(e.alpha, 4)], ["b", "trend per month, updated with weight \u03b2 = " + num(e.beta, 4)], ["\u03c6", "damping, " + num(e.phi, 4) + ", so the trend fades out"], ["s", "seasonal effect of the month, updated with weight \u03b3 = " + num(e.gamma, 4)], ["h", "months ahead"]]),
        "l<sub>T</sub> = " + n2(e.level) + ", b<sub>T</sub> = " + num(e.slope, 4) + ", s for " + esc(firstT) + " = " + n2(e.seasonUsed) + "<br>" + esc(firstT) + ": " + n2(e.level) + " + " + num(e.phi, 4) + " &times; (" + num(e.slope, 4) + ") + " + n2(e.seasonUsed) + " = " + n2(e.fc1)));
    }
    // ARIMA
    if (a.p === 0 && a.q === 0 && a.d === 1 && a.m === 1) {
      c.push(card("AutoARIMA, chosen orders " + a.label, "y<sub>t</sub> - y<sub>t-1</sub> = &epsilon;<sub>t</sub><br>forecast = y<sub>T</sub> for every future year",
        sym([["p, d, q", "0 past values, 1 difference, 0 past errors, chosen by lowest AICc"], ["\u03b5", "random error"], ["y", "actual emissions"]]),
        "y<sub>T</sub> = " + n2(a.lastY) + "<br>Forecast for " + esc(firstT) + " and every year after: " + n2(a.fc1)));
    } else if (a.m === 1 && a.d === 2 && a.p === 0 && a.q === 1) {
      var th = a.coef.ma1;
      c.push(card("AutoARIMA, chosen orders " + a.label, "forecast<sub>T+1</sub> = 2 &times; y<sub>T</sub> - y<sub>T-1</sub> + &theta; &times; e<sub>T</sub>",
        sym([["p, d, q", "0 past values, 2 differences, 1 past error, chosen by lowest AICc"], ["\u03b8", "weight on the last error, fitted"], ["e", "last one step error"]]),
        "y<sub>T</sub> = " + n2(a.lastY) + ", y<sub>T-1</sub> = " + n2(a.prevY) + ", &theta; = " + num(th, 4) + ", e<sub>T</sub> = " + n2(a.lastRes) + "<br>" + esc(firstT) + ": 2 &times; " + n2(a.lastY) + " - " + n2(a.prevY) + " + (" + num(th, 4) + ") &times; (" + n2(a.lastRes) + ") = " + n2(a.fc1)));
    } else {
      var SYM = { ma1: "&theta;<sub>1</sub>", ma2: "&theta;<sub>2</sub>", sar1: "&Phi;<sub>1</sub>", sar2: "&Phi;<sub>2</sub>", sma1: "&Theta;<sub>1</sub>" };
      var cf = Object.keys(a.coef).map(function (k) { return (SYM[k] || esc(k)) + " = " + num(a.coef[k], 4); }).join(", ");
      var exact = a.p === 0 && a.q === 2 && a.P === 2 && a.Q === 1 && a.d === 1 && a.D === 1;
      c.push(card("AutoARIMA, chosen orders " + a.label, !exact ? "seasonal ARIMA, see the orders and weights below" : "(1 - &Phi;<sub>1</sub>B<sup>12</sup> - &Phi;<sub>2</sub>B<sup>24</sup>)(1 - B)(1 - B<sup>12</sup>) y<sub>t</sub> = (1 + &theta;<sub>1</sub>B + &theta;<sub>2</sub>B<sup>2</sup>)(1 + &Theta;<sub>1</sub>B<sup>12</sup>) &epsilon;<sub>t</sub>",
        sym([["(p,d,q)", "(" + a.p + "," + a.d + "," + a.q + "): past values, differences and past errors month to month"], ["(P,D,Q)[12]", "(" + a.P + "," + a.D + "," + a.Q + "): the same, year to year"], ["B", "back one month, so B\u00b9\u00b2 y is the same month last year"], ["\u03b8, \u0398, \u03a6", "fitted weights"]]),
        cf + "<br>Forecast for " + esc(firstT) + ": " + n2(a.fc1) + ". The model has too many terms to show by hand."));
    }
    // Linear
    var tEnd = S.freq === "year" ? FC.end - xOf(S, S.actual.t[0]) : (FC.end - xOf(S, S.actual.t[0])) * 12 + 11;
    var lin = L.a + L.b * tEnd + (L.month ? L.month[11] : 0);
    c.push(card("Linear trend", S.freq === "year" ? "forecast = a + b &times; t" : "forecast = a + b &times; t + s<sub>month</sub>",
      sym([["t", S.freq === "year" ? (S.key === "fed" ? "years since FY'11" : "years since " + S.actual.t[0]) : "months since January " + String(S.actual.t[0]).slice(0, 4)], ["a, b", "intercept and slope from least squares on the last 10 years"]].concat(S.freq === "year" ? [] : [["s", "month effect against January"]])),
      "a = " + num(L.a, 2) + ", b = " + num(L.b, 4) + " per " + (S.freq === "year" ? "year" : "month") + (L.month ? ", s for December = " + n2(L.month[11]) : "") + "<br>" + esc(endT) + ", t = " + tEnd + ": " + num(L.a, 2) + " + (" + num(L.b, 4) + ") &times; " + tEnd + (L.month ? " + (" + n2(L.month[11]) + ")" : "") + " = " + n2(lin)));
    // SBTi
    var bY = yLab(S, FC.baseYear);
    c.push(card("SBTi Absolute Contraction", "P<sub>y</sub> = B &times; (1 - 0.042 &times; (y - " + FC.baseYear + "))",
      sym([["B", "emissions in the base year, " + bY + " here"], ["0.042", "4.2% of the base cut each year, the SBTi rate for 1.5C"], ["P", "pathway value in year y"]]),
      "B = " + n2(S.base) + "<br>" + esc(yLab(S, FC.end)) + ": " + n2(S.base) + " &times; (1 - 0.042 &times; " + (FC.end - FC.baseYear) + ") = " + n2(S.base) + " &times; " + num(1 - 0.042 * (FC.end - FC.baseYear), 3) + " = " + n2(S.pathway[FC.end]) + (S.freq === "month" ? " for the year" : "")));
    // WAPE
    c.push(card("WAPE, the test error", "WAPE = &Sigma; |forecast - actual| &divide; &Sigma; actual &times; 100",
      sym([["\u03a3", "sum over every test " + S.freq], ["test", S.holdout[S.best].folds.length + " windows of " + S.testCfg.horizon + " " + S.freq + "s, starting " + S.testStarts.map(function (t) { return tLab(S, t); }).join(", ") + "; each model saw only earlier data"]]),
      MN[S.best] + ": " + n2(best.sumAbsErr) + " &divide; " + n2(best.sumActual) + " &times; 100 = " + n2(best.wape) + "%"));
    return '<div class="grid two fcards">' + c.join("") + "</div>";
  }
  function fcComment(S) {
    var H = S.holdout, b = S.best, sn = H.snaive.wape, out = [], unit = S.unit, endY = yLab(S, FC.end);
    out.push(MN[b] + " had the lowest test error, " + n2(H[b].wape) + "%, against " + n2(sn) + "% for the seasonal naive line, which repeats the last " + (S.freq === "year" ? "year" : "12 months") + ".");
    var same = ["ets", "arima"].filter(function (k) { return Math.abs(S.f2030[k] - S.f2030.snaive) / S.f2030.snaive < 0.005; });
    if (same.length) out.push(same.map(function (k) { return MN[k]; }).join(" and ") + (same.length > 1 ? " end" : " ends") + " at the same " + endY + " value as the seasonal naive line, so on this yearly series simple methods are hard to beat.");
    if (Math.abs(H.ets.wape - H.arima.wape) < 0.05) out.push("ETS and AutoARIMA are close to a tie on test error.");
    out.push("The " + (b === "linear" ? "linear trend" : MN[b]) + " forecast for " + endY + " is " + num(S.f2030[b], 1) + " " + unit + ", " + num(S.gap2030[b], 1) + "% above the 1.5C pathway of " + num(S.pathway[FC.end], 1) + " " + unit + ".");
    if (S.best80) out.push("The low end of its 80% range, " + num(S.best80[0], 1) + ", is still above the pathway.");
    else { var mlo = Math.min.apply(null, S.fc[b].lo80.slice(-12)); if (mlo > S.pathway[FC.end] / 12) out.push("Every month of its 80% range in " + FC.end + " is above the monthly pathway average."); }
    out.push("Reaching the pathway needs a cut of " + n2(S.cutNeeded) + "% of the " + yLab(S, FC.baseYear) + " level each year from " + yLab(S, S.latestYear) + ".");
    if (S.key !== "fed") out.push("SBTi targets are for companies, so this pathway is only an illustration for a national series.");
    else out.push("The federal total already meets the Greening Government target of 40% below FY'06 by 2025, which is a different and less steep target.");
    return comment(out.join(" "));
  }
  function forecast() {
    if (!FC) { loadFC(); return '<p class="loading">Loading forecast data&hellip;</p>'; }
    var S = fcSeries(), b = S.best, H = S.holdout, endY = yLab(S, FC.end), u = S.unit;
    var seg = '<section class="filterbar inline" aria-label="Series"><div class="fb-group" role="group" aria-labelledby="fb-s"><span class="fb-label" id="fb-s">Series</span><div class="seg" id="f-s">' +
      FC.series.map(function (x) { return '<button type="button" data-s="' + x.key + '" aria-pressed="' + (state.fs === x.key) + '">' + esc(x.name) + "</button>"; }).join("") + "</div></div></section>";
    var rows = ["ets", "arima", "linear", "snaive"].map(function (k) {
      return '<tr class="' + (k === b ? "best" : "") + '"><td>' + esc(MN[k]) + (k === b ? ' <span class="badge ok">Best</span>' : k === "snaive" ? ' <span class="badge b">Reference</span>' : "") + '</td><td class="num">' + n2(H[k].wape) + '%</td><td class="num hide-sm">' + num(H[k].sumAbsErr, 1) + '</td><td class="num">' + num(S.f2030[k], 1) + '</td><td class="num">' + num(S.gap2030[k], 1) + "%</td></tr>";
    }).join("");
    var latestSub = S.key === "fed" ? yLab(S, S.latestYear) + ", scope 1 and 2" : S.freq === "month" ? S.latestYear + " total, data to " + tLab(S, S.lastLabel) : String(S.latestYear);
    var natNote = S.key === "fed" ? "" : " Shown as an illustration: SBTi targets are set by companies, not countries.";
    return '<h1 class="v-title">Emissions forecast to ' + endY + " " + chip(S.name + ", " + u) + "</h1>" + seg +
      '<div class="tiles">' + [
        { title: "Latest actual", sub: latestSub, val: amt(S, S.latestActual), foot: num(100 * (S.latestActual - S.pathAtLatest) / S.pathAtLatest, 1) + "% above the pathway" },
        { title: endY + " forecast", sub: MN[b] + (S.freq === "month" ? ", sum of 12 months" : ""), val: amt(S, S.f2030[b]), tone: "info", foot: S.best80 ? "80% range " + num(S.best80[0], 1) + " to " + num(S.best80[1], 1) : "80% range shown by month" },
        { title: "Test error, WAPE", sub: MN[b] + ", held out " + S.freq + "s", val: n2(H[b].wape) + "%", foot: "Seasonal naive " + n2(H.snaive.wape) + "%" },
        { title: "Gap to 1.5C pathway", sub: endY + ", SBTi 4.2% a year", val: "plus " + num(S.gap2030[b], 1) + "%", tone: "crit", foot: "Pathway " + amt(S, S.pathway[FC.end]) }
      ].map(tile).join("") + "</div>" +
      '<section class="card"><h2>Actuals and forecasts</h2><p class="c-sub">Pathway: SBTi Absolute Contraction, base year ' + yLab(S, FC.baseYear) + ", 4.2% of the base cut each year." + natNote + (S.gg ? " Green dotted line: Greening Government target, 40% below FY'06 by 2025. Fiscal years: FY'25 is April 2024 to March 2025." : "") + "</p>" + fcChart(S) + fcLegend(S) + overlapNote(S) + "</section>" +
      '<div class="grid two"><section class="card"><h2>Model comparison</h2><div class="table-wrap"><table><thead><tr><th>Model</th><th class="num">WAPE</th><th class="num hide-sm">Total error</th><th class="num">' + esc(endY) + '</th><th class="num">Gap</th></tr></thead><tbody>' + rows + "</tbody></table></div>" +
      '<p class="note">' + S.holdout[b].folds.length + " test windows of " + S.testCfg.horizon + " " + S.freq + "s. Best is the lowest WAPE among ETS, AutoARIMA and the linear trend." + (S.freq === "month" ? " " + endY + " values are 12 month totals." : "") + "</p></section>" +
      fcComment(S).replace('class="card comment"', 'class="card comment in-grid"') + "</div>" +
      formulaCards(S) +
      '<p class="method-line">Method: the GHG Protocol calculation, activity times emission factor, is the industry standard. Forecasting engines differ by vendor: Microsoft uses ARIMA and ETS, Salesforce uses intensity times a business plan.</p>' +
      '<section class="card"><h2>Sources and licences</h2><ol class="src-list">' + [
        ["Greenhouse Gas Emissions Inventory, Item 1", "Treasury Board of Canada Secretariat. Open Government Licence, Canada.", "https://open.canada.ca/data/en/dataset/6bed41cd-9816-4912-a2b8-b0b224909396"],
        ["CO2 and Greenhouse Gas Emissions data, Canada", "Our World in Data, Creative Commons BY 4.0. Accessed 10 October 2026.", "https://github.com/owid/co2-data"],
        ["Monthly Energy Review, Table 11.1, total energy CO2", "US Energy Information Administration. Public domain. Accessed 10 October 2026.", "https://www.eia.gov/totalenergy/data/monthly/"],
        ["SBTi Corporate Near-Term Criteria", "Science Based Targets initiative. Source of the 4.2% a year rate for 1.5C.", "https://files.sciencebasedtargets.org/production/files/SBTi-criteria.pdf"],
        ["Greening Government Strategy", "Government of Canada. 40% below 2005 by 2025.", "https://www.canada.ca/en/treasury-board-secretariat/services/innovation/greening-government/strategy.html"],
        ["Vendor methods", "Microsoft what-if analysis (ARIMA and ETS); Salesforce emissions forecast (intensity times business metric).", "https://help.salesforce.com/s/articleView?id=ind.netzero_manager_example_calculate_emissions_forecast.htm&language=en_US&type=5"],
        ["StatsForecast", "Nixtla, Apache 2.0. AutoETS and AutoARIMA, fitted in Python ahead of time.", "https://github.com/Nixtla/statsforecast"]
      ].map(function (s) { return '<li><a href="' + s[2] + '" target="_blank" rel="noopener">' + esc(s[0]) + "</a><span>" + esc(s[1]) + "</span></li>"; }).join("") + "</ol></section>";
  }
  function loadFC() {
    if (fcLoading) return; fcLoading = true;
    fetch("data/forecast.json?v=20261010f1").then(function (r) { if (!r.ok) throw new Error("data"); return r.json(); })
      .then(function (d) { FC = d; if (state.view === "forecast") render(false); })
      .catch(function () { fcLoading = false; $("#view").innerHTML = '<p class="loading">Could not load the forecast data. Please reload the page.</p>'; });
  }
  var RENDER = { mix: mix, emissions: emissions, diesel: diesel, forecast: forecast, about: about };

  /* ---------- wiring ---------- */
  function render(focus) {
    var v = $("#view");
    if (!D) return;
    v.innerHTML = RENDER[state.view]();
    v.classList.remove("view-in"); void v.offsetWidth; v.classList.add("view-in");
    v.setAttribute("aria-labelledby", "tab-" + state.view);
    document.querySelectorAll("#tabs [role=tab]").forEach(function (t) {
      var on = t.dataset.view === state.view;
      t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1;
      if (on) t.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
    if (focus) v.focus({ preventScroll: true });
  }
  function readHash() {
    var p = location.hash.replace(/^#\/?/, "").split("?"), q = new URLSearchParams(p[1] || "");
    state.view = VIEWS.indexOf(p[0]) >= 0 ? p[0] : "mix";
    state.fy = /^(all|fy24|fy25|fy26)$/.test(q.get("fy") || "") ? q.get("fy") : "all";
    state.fs = /^(fed|can|us)$/.test(q.get("s") || "") ? q.get("s") : "fed";
  }
  function writeHash() {
    var h = "#/" + state.view + (state.view === "mix" && state.fy !== "all" ? "?fy=" + state.fy : "") + (state.view === "forecast" && state.fs !== "fed" ? "?s=" + state.fs : "");
    if (location.hash !== h) location.hash = h; else render(false);
  }
  var wasSmall = small();
  window.addEventListener("resize", function () { if (small() !== wasSmall) { wasSmall = small(); if (state.view !== "diesel") render(false); } });
  window.addEventListener("hashchange", function () { readHash(); render(false); });
  document.getElementById("tabs").addEventListener("click", function (e) { var b = e.target.closest("[role=tab]"); if (b) { state.view = b.dataset.view; writeHash(); } });
  document.getElementById("tabs").addEventListener("keydown", function (e) {
    var i = VIEWS.indexOf(state.view), d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (e.key === "Home") i = 0; else if (e.key === "End") i = VIEWS.length - 1; else if (d) i = (i + d + VIEWS.length) % VIEWS.length; else return;
    e.preventDefault(); state.view = VIEWS[i]; writeHash(); document.getElementById("tab-" + VIEWS[i]).focus();
  });
  $("#view").addEventListener("click", function (e) {
    var b = e.target.closest("#f-fy button");
    if (b) { state.fy = b.dataset.fy; writeHash(); return; }
    var sb = e.target.closest("#f-s button");
    if (sb) { state.fs = sb.dataset.s; writeHash(); return; }
    var g = e.target.closest("[data-go]");
    if (g) { state.view = g.dataset.go; writeHash(); }
  });
  $("#view").addEventListener("input", function (e) {
    var t = e.target, map = { "c-lpm": "lpm", "c-months": "months", "c-sites": "sites" }, k = map[t.id];
    if (!k) return;
    var v = parseFloat(t.value), max = parseFloat(t.max), ok = isFinite(v) && v >= 0 && v <= max;
    t.setAttribute("aria-invalid", ok ? "false" : "true");
    if (!ok) return;
    state[k] = v;
    $("#calc-out").innerHTML = dieselOut();
  });
  fetch("data/esg.json").then(function (r) { if (!r.ok) throw new Error("data"); return r.json(); })
    .then(function (d) { D = d; readHash(); render(false); })
    .catch(function () { $("#view").innerHTML = '<p class="loading">Could not load the data. Please reload the page.</p>'; });
})();
