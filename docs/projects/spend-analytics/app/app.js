/* Supplier Spend app: hash routing, one filter bar, hand-rolled SVG charts. No dependencies. */
(function () {
  "use strict";
  var state = { view: "overview", fy: "all", ct: "all" };
  var cache = {}, G = null, S = null;
  var VIEWS = ["overview", "quality", "suppliers", "categories", "about"];
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  function money(v) {
    var a = Math.abs(v);
    if (a >= 1e9) return "C$" + (v / 1e9).toFixed(1) + "B";
    if (a >= 1e6) return "C$" + (v / 1e6).toFixed(1) + "M";
    if (a >= 1e3) return "C$" + (v / 1e3).toFixed(0) + "K";
    return "C$" + Math.round(v);
  }
  var num = function (v) { return Number(v).toLocaleString("en-CA"); };
  var pct = function (v, d) { return (v * 100).toFixed(d == null ? 1 : d) + "%"; };
  var fyLabel = function () { return state.fy === "all" ? "FY'24 to FY'26" : "FY'" + state.fy.slice(2); };
  var ctLabel = function () { return { all: "all commodity types", g: "Goods", s: "Services", c: "Construction" }[state.ct]; };
  var scope = function () { return '<span class="scope">' + esc(fyLabel()) + ", " + esc(ctLabel()) + "</span>"; };

  function load(path) {
    if (!cache[path]) cache[path] = fetch("data/" + path).then(function (r) { if (!r.ok) throw new Error(path); return r.json(); });
    return cache[path];
  }

  /* ---------- small UI builders ---------- */
  function comment(t) { return '<section class="card comment"><h2>What the numbers show</h2><p>' + esc(t) + "</p></section>"; }
  function catNote() {
    var order = ["Strategic", "Tactical", "Operational"].filter(function (t) { return S.tiers[t]; });
    var top = S.categories[0];
    return "The " + S.nCategories + " category groups split into " + order.map(function (t) { return t + " " + pct(S.tiers[t].share); }).join(", ") + " of spend. " +
      (top ? top.name + " is the largest group at " + money(top.spend) + ". " : "") + "Grey bars have fewer than 30 contracts, so read them with care.";
  }
  function tile(t) {
    var tag = t.go ? "button" : "div";
    return "<" + tag + ' class="tile"' + (t.go ? ' type="button" data-go="' + t.go + '"' : "") + ">" +
      '<span class="tile-title">' + esc(t.title) + "</span>" +
      (t.sub ? '<span class="tile-sub">' + esc(t.sub) + "</span>" : "") +
      '<span class="tile-val ' + (t.tone || "") + '">' + esc(t.val) + "</span>" +
      (t.foot ? '<span class="tile-foot">' + esc(t.foot) + "</span>" : "") + "</" + tag + ">";
  }
  function bars(rows, opt) {
    opt = opt || {};
    var max = Math.max.apply(null, rows.map(function (r) { return r.v; })) || 1;
    return '<ul class="bars">' + rows.map(function (r, i) {
      var inner = '<span class="bar-name" title="' + esc(r.name) + '">' + esc(r.name) + '</span><span class="bar-val">' + esc(r.label) + "</span>" +
        '<span class="bar-track"><span class="bar-fill ' + (r.tone || "") + '" style="width:' + Math.max(0.6, (r.v / max) * 100).toFixed(2) + '%"></span></span>';
      return "<li>" + (opt.click ? '<button type="button" class="bar-row" data-' + opt.click + '="' + i + '">' + inner + "</button>" : '<div class="bar-row">' + inner + "</div>") + "</li>";
    }).join("") + "</ul>";
  }
  function columns(data, opt) {
    // data: [[label, value, tone?]]
    var W = 640, H = 220, pl = 46, pb = 26, pt = 10, n = data.length;
    var max = Math.max.apply(null, data.map(function (d) { return d[1]; })) || 1;
    var bw = (W - pl - 8) / n, s = "";
    [0, 0.5, 1].forEach(function (f) {
      var y = pt + (H - pt - pb) * (1 - f);
      s += '<line class="axis" x1="' + pl + '" x2="' + W + '" y1="' + y + '" y2="' + y + '"/><text x="' + (pl - 6) + '" y="' + (y + 4) + '" text-anchor="end">' + money(max * f).replace("C$", "") + "</text>";
    });
    data.forEach(function (d, i) {
      var h = (H - pt - pb) * d[1] / max, x = pl + i * bw + bw * 0.12;
      s += '<rect x="' + x.toFixed(1) + '" y="' + (H - pb - h).toFixed(1) + '" width="' + (bw * 0.76).toFixed(1) + '" height="' + h.toFixed(1) + '" rx="2" fill="' + (d[2] || "#0070F2") + '"><title>' + esc(d[0] + ": " + (opt && opt.fmt ? opt.fmt(d[1]) : money(d[1]))) + "</title></rect>";
      if (!opt || !opt.every || i % opt.every === 0) s += '<text x="' + (x + bw * 0.38).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle">' + esc(opt && opt.lab ? opt.lab(d[0]) : d[0]) + "</text>";
    });
    return '<svg class="chart" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(opt && opt.aria || "Column chart") + '">' + s + "</svg>";
  }
  function paretoChart(pts, total) {
    var W = 640, H = 240, pl = 40, pb = 30, pt = 10, pr = 10, lmax = Math.log10(total);
    var X = function (r) { return pl + (W - pl - pr) * Math.log10(r) / lmax; };
    var Y = function (c) { return pt + (H - pt - pb) * (1 - c); };
    var s = "";
    [0, 0.5, 0.8, 1].forEach(function (c) { s += '<line class="axis" x1="' + pl + '" x2="' + (W - pr) + '" y1="' + Y(c) + '" y2="' + Y(c) + '"' + (c === 0.8 ? ' stroke-dasharray="4 3" style="stroke:#E76500"' : "") + '/><text x="' + (pl - 6) + '" y="' + (Y(c) + 4) + '" text-anchor="end">' + c * 100 + "%</text>"; });
    [1, 10, 100, 1000, 10000].filter(function (r) { return r <= total; }).forEach(function (r) { s += '<text x="' + X(r) + '" y="' + (H - 10) + '" text-anchor="middle">' + num(r) + "</text>"; });
    s += '<path d="' + pts.map(function (p, i) { return (i ? "L" : "M") + X(p[0]).toFixed(1) + " " + Y(p[1]).toFixed(1); }).join("") + '" fill="none" stroke="#0070F2" stroke-width="2.5"/>';
    return '<svg class="chart" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Cumulative share of spend by supplier rank, log scale">' + s + "</svg>";
  }

  /* ---------- views ---------- */
  function overview() {
    var k = S.kpi;
    var tiles = [
      { title: "Total spend", sub: fyLabel(), val: money(k.spend), foot: num(k.contracts) + " contracts", go: "suppliers" },
      { title: "Suppliers paid", sub: "After name clean-up", val: num(k.suppliers), foot: num(G.stages[0][1]) + " raw names became " + num(G.stages[G.stages.length - 1][1]), go: "quality" },
      { title: "Spend with likely duplicates", sub: "Supplier sits in a name cluster", val: money(k.dupSpend), tone: "crit", foot: pct(k.dupShare) + " of spend", go: "quality" },
      { title: "Class A with duplicates", sub: "Top suppliers, 80% of spend", val: k.classADup + " of " + k.classA, tone: "crit", foot: "Spread over more than one name", go: "suppliers" },
      { title: "Top 10 supplier share", sub: "Concentration", val: pct(k.top10Share), tone: "info", foot: k.half + " suppliers make up half", go: "suppliers" },
      { title: "Non-competitive", sub: "Share of contracts", val: pct(k.nonCompShare), foot: "Method recorded as non-competitive", go: "about" }
    ];
    var monthly = S.monthly.map(function (m) { return [m[0], m[1]]; });
    var ct = Object.keys(S.byCT).sort(function (a, b) { return S.byCT[b] - S.byCT[a]; }).map(function (c) { return { name: c, v: S.byCT[c], label: money(S.byCT[c]) }; });
    return '<h1 class="v-title">Overview ' + scope() + "</h1>" +
      '<div class="tiles">' + tiles.map(tile).join("") + "</div>" +
      '<div class="grid wide"><section class="card"><h2>Spend by month</h2>' +
      columns(monthly, { every: Math.max(1, Math.round(monthly.length / 6)), lab: function (m) { return m.slice(2).replace("-", "/"); }, aria: "Monthly spend" }) + "</section>" +
      '<section class="card"><h2>By commodity type</h2>' + bars(ct) + "</section></div>" +
      comment(money(k.dupSpend) + " of " + money(k.spend) + " (" + pct(k.dupShare) + ") sits with suppliers listed under more than one name. " + k.classADup + " of the " + k.classA + " Class A suppliers are affected, so the biggest spend lines are the ones most at risk. Cleaning the names took the list from " + num(G.stages[0][1]) + " to " + num(G.stages[G.stages.length - 1][1]) + " suppliers.");
  }
  function quality() {
    var k = S.kpi, st = G.stages, max = st[0][1];
    var funnel = '<div class="funnel">' + st.map(function (s, i) {
      return '<div class="funnel-step"><span>' + esc(s[0].replace(/^\d\.\s*/, "")) + '</span><span class="bar-val">' + num(s[1]) + (i ? " (" + pct(s[1] / max - 1, 0).replace("-", "minus ") + ")" : "") + '</span><span class="bar-track"><span class="bar-fill' + (i === st.length - 1 ? "" : " muted") + '" style="width:' + (s[1] / max * 100).toFixed(1) + '%"></span></span></div>';
    }).join("") + "</div>";
    var hist = G.nameLen.map(function (h) { return [String(h[0]), h[1], h[0] === 35 ? "#E76500" : "#A9B4BE"]; });
    var r35 = G.nameLen.filter(function (h) { return h[0] === 35; })[0][1], r36 = G.nameLen.filter(function (h) { return h[0] === 36; })[0][1];
    var rows = S.clusters.map(function (c, i) {
      return '<tr class="click" data-cluster="' + i + '"><td><button type="button" class="link-btn" data-cluster="' + i + '">' + esc(c.master) + '</button></td><td class="num">' + c.size + '</td><td class="num">' + money(c.spend) + '</td><td class="num hide-sm">' + num(c.contracts) + "</td></tr>";
    }).join("");
    return '<h1 class="v-title">Supplier data quality ' + scope() + "</h1>" +
      '<div class="tiles">' + [
        { title: "Raw supplier names", sub: "As published, all years", val: num(st[0][1]) },
        { title: "After clean-up", sub: "Suggested masters, all years", val: num(st[st.length - 1][1]), tone: "pos", foot: pct(1 - st[st.length - 1][1] / st[0][1], 0) + " fewer" },
        { title: "Spend with likely duplicates", sub: fyLabel(), val: money(k.dupSpend), tone: "crit", foot: pct(k.dupShare) + " of spend" },
        { title: "Names in clusters", sub: "All years", val: num(G.clusterNames), foot: "in " + num(G.clusters) + " clusters" },
        { title: "35-character names", sub: "Records, all years", val: num(r35), tone: "neg", foot: num(r36) + " at 36 characters" }
      ].map(tile).join("") + "</div>" +
      '<div class="grid two"><section class="card"><h2>From raw names to suppliers</h2>' + funnel + "</section>" +
      '<section class="card"><h2>Name length spike at 35</h2>' +
      columns(hist, { every: 5, fmt: function (v) { return num(v) + " records"; }, aria: "Vendor name records by length, spike at 35 characters" }) + "</section></div>" +
      '<section class="card" style="margin-top:1rem"><h2>Top duplicate clusters</h2>' +
      '<div class="table-wrap"><table><thead><tr><th>Suggested master</th><th class="num">Names</th><th class="num">Spend</th><th class="num hide-sm">Contracts</th></tr></thead><tbody>' + (rows || '<tr><td colspan="4">No clusters in this view.</td></tr>') + "</tbody></table></div></section>" +
      comment(num(G.clusterNames) + " supplier names fall into " + num(G.clusters) + " likely duplicate clusters, linked to " + money(k.dupSpend) + " of spend. " + num(r35) + " records stop at exactly 35 characters, against " + num(r36) + " at 36, which points to a field that cut names short. The clusters are suggestions and need a data steward to confirm them.");
  }
  function suppliers() {
    var k = S.kpi, abc = S.abc, n = abc.A.n + abc.B.n + abc.C.n;
    var rows = S.topSuppliers.map(function (s, i) {
      return '<tr class="click" data-supplier="' + i + '"><td class="num">' + (i + 1) + '</td><td><button type="button" class="link-btn" data-supplier="' + i + '">' + esc(s.name) + "</button>" + (s.dup ? ' <span class="badge dup">Duplicates</span>' : "") + '</td><td class="num">' + money(s.spend) + '</td><td class="num hide-sm">' + pct(s.share) + '</td><td class="hide-sm"><span class="badge ' + s.cls.toLowerCase() + '">' + s.cls + "</span></td></tr>";
    }).join("");
    return '<h1 class="v-title">Suppliers and Pareto ' + scope() + "</h1>" +
      '<div class="tiles">' + [
        { title: "Class A", sub: "First 80% of spend", val: num(abc.A.n), tone: "info", foot: money(abc.A.spend) },
        { title: "Class B", sub: "Next 15%", val: num(abc.B.n), foot: money(abc.B.spend) },
        { title: "Class C", sub: "Last 5%", val: num(abc.C.n), foot: money(abc.C.spend) },
        { title: "Class A with duplicates", sub: "More than one name", val: k.classADup + " of " + abc.A.n, tone: "crit" },
        { title: "Half of spend", sub: "Suppliers needed", val: num(k.half), foot: "of " + num(n) }
      ].map(tile).join("") + "</div>" +
      '<div class="grid wide"><section class="card"><h2>Top 25 suppliers</h2><div class="table-wrap"><table><thead><tr><th class="num">#</th><th>Supplier</th><th class="num">Spend</th><th class="num hide-sm">Share</th><th class="hide-sm">Class</th></tr></thead><tbody>' + rows + "</tbody></table></div></section>" +
      '<section class="card"><h2>80/20 curve</h2>' + paretoChart(S.pareto, n) +
      '<p class="note">Top 10 suppliers: ' + pct(k.top10Share) + " of spend.</p></section></div>" +
      comment(num(abc.A.n) + " of " + num(n) + " suppliers carry 80% of spend, and just " + num(k.half) + " make up half of it. The top 10 alone hold " + pct(k.top10Share) + ". " + k.classADup + " of the Class A suppliers appear under more than one name, so clean master data matters most where the money is.");
  }
  function categories() {
    var order = ["Strategic", "Tactical", "Operational"], tones = { Strategic: "info", Tactical: "", Operational: "pos" };
    var tiles = order.filter(function (t) { return S.tiers[t]; }).map(function (t) { return { title: t, sub: S.tiers[t].groups + " category groups", val: pct(S.tiers[t].share), tone: tones[t], foot: money(S.tiers[t].spend) }; });
    var seg = Object.keys(S.segments).sort(function (a, b) { return S.segments[b].spend - S.segments[a].spend; }).map(function (s) { return { name: s + " (" + S.segments[s].groups + " groups)", v: S.segments[s].spend, label: pct(S.segments[s].share) }; });
    var cats = S.categories.map(function (c) { return { name: c.name, v: c.spend, label: money(c.spend), tone: c.lowConf ? "muted" : "" }; });
    return '<h1 class="v-title">Categories and segments ' + scope() + "</h1>" +
      '<div class="tiles">' + tiles.map(tile).join("") + "</div>" +
      '<div class="grid wide"><section class="card"><h2>Top 15 category groups</h2>' + bars(cats, { click: "category" }) +
      '<p class="note">Other ' + (S.nCategories - S.categories.length) + " groups: " + money(S.otherCategories) + ".</p></section>" +
      '<section class="card"><h2>Kraljic segments</h2>' + bars(seg) +
      "</section></div>" + comment(catNote());
  }
  function about() {
    var rules = G.rules.map(function (r) { return "<tr><td>" + esc(r.id) + "</td><td>" + esc(r.rule) + '</td><td class="num">' + num(r.failed) + '</td><td class="num hide-sm">' + r.pct.toFixed(2) + "%</td><td class=\"hide-sm\">" + esc(r.sev) + "</td></tr>"; }).join("");
    return '<div class="about"><h1 class="v-title">About the data</h1>' +
      '<div class="grid two"><section class="card"><h2>What this is</h2>' +
      "<ul><li>179,829 Government of Canada contracts from " + G.depts + " organizations, 1 April 2023 to 31 March 2026.</li><li>Money is contract value in Canadian dollars. Years are federal fiscal years, so FY'24 runs April 2023 to March 2024.</li></ul></section>" +
      '<section class="card"><h2>How suppliers were cleaned</h2><ol><li>Trim spaces and fold case.</li><li>Remove accents, punctuation and legal suffixes such as Inc. and Ltd.</li><li>Group close spellings with fuzzy matching into a suggested master.</li></ol></section></div>' +
      '<section class="card" style="margin-top:1rem"><h2>Data quality rules</h2>' + "<div class=\"table-wrap\"><table><thead><tr><th>Rule</th><th>Check</th><th class=\"num\">Failed</th><th class=\"num hide-sm\">Rate</th><th class=\"hide-sm\">Severity</th></tr></thead><tbody>" + rules + "</tbody></table></div></section>" +
      comment("The data covers 179,829 contracts from " + G.depts + " organizations over three fiscal years. " + G.rules.length + " quality checks ran on the full file, and the table shows how many records failed each one. Figures are unaudited public data.") + "</div>";
  }
  var RENDER = { overview: overview, quality: quality, suppliers: suppliers, categories: categories, about: about };

  /* ---------- detail (object page) ---------- */
  var dlg = $("#detail"), lastFocus = null;
  function facets(list) { return '<div class="facets">' + list.map(function (f) { return '<div class="facet"><span>' + esc(f[0]) + "</span><strong>" + esc(f[1]) + "</strong></div>"; }).join("") + "</div>"; }
  function openDetail(kicker, title, body) {
    lastFocus = document.activeElement;
    $("#detail-kicker").textContent = kicker; $("#detail-title").textContent = title; $("#detail-body").innerHTML = body;
    dlg.showModal(); $("#detail-close").focus();
  }
  dlg.addEventListener("close", function () { if (lastFocus && document.contains(lastFocus)) lastFocus.focus(); });
  $("#detail-close").addEventListener("click", function () { dlg.close(); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
  function supplierDetail(s) {
    var fys = ["FY'24", "FY'25", "FY'26"].map(function (y) { return [y, s.fy[y] || 0]; });
    openDetail("Supplier, " + fyLabel() + ", " + ctLabel(), s.name,
      facets([["Spend", money(s.spend)], ["Share", pct(s.share)], ["Contracts", num(s.contracts)], ["Pareto class", s.cls], ["Names on file", num(s.names)]]) +
      (s.dup ? '<p class="strip" style="background:#FFF3E8;border-color:#F5B88A"><span class="strip-icon" style="background:#E76500" aria-hidden="true">!</span><span>This supplier appears under more than one name. Spend is grouped under the suggested master.</span></p>' : "") +
      "<h3>Spellings on file</h3><ul class=\"plain\">" + s.variants.map(function (v) { return "<li>" + esc(v) + "</li>"; }).join("") + (s.names > s.variants.length ? "<li>and " + (s.names - s.variants.length) + " more</li>" : "") + "</ul>" +
      "<h3>Top buyers</h3>" + bars(s.depts.map(function (d) { return { name: d[0], v: d[1], label: money(d[1]) }; })) +
      "<h3>Spend by fiscal year</h3>" + columns(fys, { aria: "Supplier spend by fiscal year" }));
  }
  function clusterDetail(c) {
    openDetail("Duplicate cluster, " + fyLabel() + ", " + ctLabel(), c.master,
      facets([["Spend", money(c.spend)], ["Names in cluster", num(c.size)], ["Contracts", num(c.contracts)]]) +
      '<h3>Spellings and spend</h3><div class="table-wrap"><table><thead><tr><th>Name as published</th><th class="num">Spend</th><th class="num">Match</th></tr></thead><tbody>' +
      c.members.map(function (m) { return "<tr><td>" + esc(m[0]) + '</td><td class="num">' + money(m[1]) + '</td><td class="num">' + Math.round(m[2]) + "%</td></tr>"; }).join("") + "</tbody></table></div>" +
      '<p class="note">Match is name similarity to the suggested master. A steward should confirm before merging.</p>');
  }
  function categoryDetail(c) {
    openDetail("Category group, " + fyLabel() + ", " + ctLabel(), c.name,
      facets([["Spend", money(c.spend)], ["Share", pct(c.share)], ["Contracts", num(c.contracts)], ["Suppliers", num(c.suppliers)], ["Segment", c.seg], ["Tier", c.tier], ["Supply risk", c.risk.toFixed(0) + " of 100"]]) +
      (c.lowConf ? '<p class="note">Low data confidence: fewer than 30 contracts, so the risk score is noisy.</p>' : "") +
      "<h3>Top 5 suppliers</h3>" + bars(c.top.map(function (t) { return { name: t[0], v: t[1], label: money(t[1]) }; })));
  }

  /* ---------- wiring ---------- */
  function render(focus) {
    var v = $("#view");
    if (!S || !G) return;
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
  function loadSlice() {
    return load("slice_" + state.fy + "_" + state.ct + ".json").then(function (d) { S = d; });
  }
  function readHash() {
    var p = location.hash.replace(/^#\/?/, "").split("?"), q = new URLSearchParams(p[1] || "");
    state.view = VIEWS.indexOf(p[0]) >= 0 ? p[0] : "overview";
    if (/^(all|fy24|fy25|fy26)$/.test(q.get("fy") || "")) state.fy = q.get("fy");
    if (/^(all|g|s|c)$/.test(q.get("ct") || "")) state.ct = q.get("ct");
    document.querySelectorAll("#f-fy button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.fy === state.fy); });
    $("#f-ct").value = state.ct;
  }
  function writeHash() {
    var q = [];
    if (state.fy !== "all") q.push("fy=" + state.fy);
    if (state.ct !== "all") q.push("ct=" + state.ct);
    var h = "#/" + state.view + (q.length ? "?" + q.join("&") : "");
    if (location.hash !== h) location.hash = h; else update(false);
  }
  function update(focus) {
    readHash();
    loadSlice().then(function () { render(focus); }).catch(function () { $("#view").innerHTML = '<p class="loading">Could not load the data. Please reload the page.</p>'; });
  }
  window.addEventListener("hashchange", function () { update(false); });
  document.getElementById("tabs").addEventListener("click", function (e) { var b = e.target.closest("[role=tab]"); if (b) { state.view = b.dataset.view; writeHash(); } });
  document.getElementById("tabs").addEventListener("keydown", function (e) {
    var i = VIEWS.indexOf(state.view), d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (e.key === "Home") i = 0; else if (e.key === "End") i = VIEWS.length - 1; else if (d) i = (i + d + VIEWS.length) % VIEWS.length; else return;
    e.preventDefault(); state.view = VIEWS[i]; writeHash(); document.getElementById("tab-" + VIEWS[i]).focus();
  });
  $("#f-fy").addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) { state.fy = b.dataset.fy; writeHash(); } });
  $("#f-ct").addEventListener("change", function (e) { state.ct = e.target.value; writeHash(); });
  $("#view").addEventListener("click", function (e) {
    var t = e.target.closest("[data-go],[data-supplier],[data-cluster],[data-category]");
    if (!t) return;
    if (t.dataset.go) { state.view = t.dataset.go; writeHash(); }
    else if (t.dataset.supplier != null) supplierDetail(S.topSuppliers[+t.dataset.supplier]);
    else if (t.dataset.cluster != null) clusterDetail(S.clusters[+t.dataset.cluster]);
    else if (t.dataset.category != null) categoryDetail(S.categories[+t.dataset.category]);
  });
  load("global.json").then(function (g) { G = g; update(false); });
})();
