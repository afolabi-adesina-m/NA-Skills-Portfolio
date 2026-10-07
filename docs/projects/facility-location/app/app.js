/* Facility Location app: hash routing, hand rolled SVG charts. No dependencies. */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var num = function (v, d) { return Number(v).toLocaleString("en-CA", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); };
  var pct = function (v, d) { return (v * 100).toFixed(d == null ? 1 : d) + "%"; };
  var big = function (v, pre) { pre = pre || ""; var a = Math.abs(v), s = v < 0 ? "minus " : ""; if (a >= 1e9) return s + pre + (a / 1e9).toFixed(2) + "B"; if (a >= 1e6) return s + pre + (a / 1e6).toFixed(2) + "M"; if (a >= 1e4) return s + pre + (a / 1e3).toFixed(0) + "K"; return s + pre + num(a); };
  var PAL = ["#0070F2", "#E8743B", "#19A979", "#945ECF", "#ED4A7B", "#5899DA"];
  function comment(t) { return '<section class="card comment"><h2>What the numbers show</h2><p>' + esc(t) + "</p></section>"; }
  function tile(t) {
    var tag = t.go ? "button" : "div";
    return "<" + tag + ' class="tile"' + (t.go ? ' type="button" data-go="' + t.go + '"' : "") + ">" +
      '<span class="tile-title">' + esc(t.title) + '</span><span class="tile-sub">' + esc(t.sub || "") + "</span>" +
      '<span class="tile-val ' + (t.tone || "") + '">' + esc(t.val) + '</span><span class="tile-foot">' + esc(t.foot || "") + "</span></" + tag + ">";
  }
  function tiles(list) { return '<div class="tiles">' + list.map(tile).join("") + "</div>"; }
  function card(title, body, sub, cls) { return '<section class="card ' + (cls || "") + '"><h2>' + esc(title) + "</h2>" + (sub ? '<p class="c-sub">' + esc(sub) + "</p>" : "") + body + "</section>"; }
  function bars(rows) {
    var max = Math.max.apply(null, rows.map(function (r) { return r.v; })) || 1;
    return '<ul class="bars">' + rows.map(function (r) {
      return '<li><div class="bar-row"><span class="bar-name" title="' + esc(r.name) + '">' + esc(r.name) + '</span><span class="bar-val">' + esc(r.label) + '</span><span class="bar-track"><span class="bar-fill ' + (r.tone || "") + '" style="width:' + Math.max(0.6, r.v / max * 100).toFixed(2) + '%"></span></span></div></li>';
    }).join("") + "</ul>";
  }
  function table(head, rows, numCols) {
    numCols = numCols || [];
    return '<div class="table-wrap"><table><thead><tr>' + head.map(function (h, i) { return '<th class="' + (numCols.indexOf(i) >= 0 ? "num" : "") + '">' + esc(h) + "</th>"; }).join("") + "</tr></thead><tbody>" +
      rows.map(function (r) { return "<tr>" + r.map(function (c, i) { var o = typeof c === "object" && c !== null ? c : { t: c }; return '<td class="' + (numCols.indexOf(i) >= 0 ? "num " : "") + (o.cls || "") + '">' + (o.h != null ? o.h : esc(o.t)) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>";
  }
  function legend(items) { return '<div class="legend">' + items.map(function (it) { return '<span><i class="' + (it.line ? "ln" : "") + '" style="background:' + it.c + '"></i>' + esc(it.n) + "</span>"; }).join("") + "</div>"; }
  function yTicks(max) { var p = Math.pow(10, Math.floor(Math.log10(max || 1))), st = [1, 2, 2.5, 5, 10].map(function (m) { return m * p; }).filter(function (s) { return max / s <= 5; })[0] || p * 10; var t = []; for (var v = 0; v <= max + 1e-9; v += st) t.push(v); if (t[t.length - 1] < max) t.push(t[t.length - 1] + st); return t; }
  /* line chart: series [{c, v:[...], dash, w}], labels [...] */
  function lineChart(series, labels, opt) {
    opt = opt || {};
    var W = 640, H = opt.h || 240, pl = 52, pr = 10, pt = 10, pb = 26, n = labels.length;
    var max = Math.max.apply(null, series.map(function (s) { return Math.max.apply(null, s.v.filter(function (x) { return x != null; })); }));
    var ticks = yTicks(max * 1.02), top = ticks[ticks.length - 1];
    var X = function (i) { return pl + (W - pl - pr) * (n === 1 ? 0.5 : i / (n - 1)); }, Y = function (v) { return pt + (H - pt - pb) * (1 - v / top); };
    var s = "";
    ticks.forEach(function (t) { s += '<line class="axis" x1="' + pl + '" x2="' + (W - pr) + '" y1="' + Y(t) + '" y2="' + Y(t) + '"/><text x="' + (pl - 6) + '" y="' + (Y(t) + 4) + '" text-anchor="end">' + esc(opt.fy ? opt.fy(t) : big(t)) + "</text>"; });
    var every = opt.every || Math.max(1, Math.ceil(n / 7));
    labels.forEach(function (l, i) { if (i % every === 0 || (opt.last && i === n - 1)) s += '<text x="' + X(i) + '" y="' + (H - 8) + '" text-anchor="' + (X(i) > W - pr - 24 ? "end" : X(i) < pl + 10 ? "start" : "middle") + '">' + esc(l) + "</text>"; });
    if (opt.split != null) s += '<line x1="' + X(opt.split) + '" x2="' + X(opt.split) + '" y1="' + pt + '" y2="' + (H - pb) + '" stroke="#89919A" stroke-dasharray="3 3"/>';
    series.forEach(function (se) {
      if (se.bars) { var bw = (W - pl - pr) / n * 0.6; se.v.forEach(function (v, i) { if (v == null) return; s += '<rect x="' + (X(i) - bw / 2).toFixed(1) + '" y="' + Y(v).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + (H - pb - Y(v)).toFixed(1) + '" fill="' + se.c + '" opacity=".35"><title>' + esc(labels[i] + ": " + num(v)) + "</title></rect>"; }); return; }
      var d = "", on = false;
      se.v.forEach(function (v, i) { if (v == null) { on = false; return; } d += (on ? "L" : "M") + X(i).toFixed(1) + " " + Y(v).toFixed(1); on = true; });
      s += '<path d="' + d + '" fill="none" stroke="' + se.c + '" stroke-width="' + (se.w || 2.2) + '"' + (se.dash ? ' stroke-dasharray="' + se.dash + '"' : "") + "/>";
      if (se.dots) se.v.forEach(function (v, i) { if (v != null) s += '<circle cx="' + X(i).toFixed(1) + '" cy="' + Y(v).toFixed(1) + '" r="3" fill="' + se.c + '"><title>' + esc(labels[i] + ": " + num(v)) + "</title></circle>"; });
    });
    return '<svg class="chart" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(opt.aria || "Line chart") + '">' + s + "</svg>";
  }
  /* formula card: f = [html lines], sym = [[symbol html, meaning]], ex = {t: title, h: html} */
  function fxCard(title, f, sym, ex) {
    return '<section class="card fx-card"><h2>' + esc(title) + "</h2>" + f.map(function (l) { return '<div class="fx">' + l + "</div>"; }).join("") +
      '<dl class="fx-sym">' + sym.map(function (s) { return "<dt>" + s[0] + "</dt><dd>" + esc(s[1]) + "</dd>"; }).join("") + "</dl>" +
      (ex ? '<div class="fx-ex"><strong>Worked example</strong>' + ex + "</div>" : "") + "</section>";
  }
  var V = function (s) { return "<var>" + s + "</var>"; };
  var SUM = function (sub) { return "&Sigma;<sub>" + sub + "</sub> "; };
  /* hash router */
  function router(VIEWS, RENDER, after) {
    function render() {
      var p = location.hash.replace(/^#\/?/, "").split("?"), view = VIEWS.indexOf(p[0]) >= 0 ? p[0] : VIEWS[0];
      var v = $("#view"); v.innerHTML = RENDER[view](new URLSearchParams(p[1] || ""));
      v.classList.remove("view-in"); void v.offsetWidth; v.classList.add("view-in");
      v.setAttribute("aria-labelledby", "tab-" + view);
      document.querySelectorAll("#tabs [role=tab]").forEach(function (t) { var on = t.dataset.view === view; t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1; });
      if (after) after(view);
    }
    window.addEventListener("hashchange", render);
    $("#tabs").addEventListener("click", function (e) { var b = e.target.closest("[role=tab]"); if (b) location.hash = "#/" + b.dataset.view; });
    $("#tabs").addEventListener("keydown", function (e) {
      var cur = VIEWS.indexOf((location.hash.replace(/^#\/?/, "").split("?")[0])); if (cur < 0) cur = 0;
      var d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (e.key === "Home") cur = 0; else if (e.key === "End") cur = VIEWS.length - 1; else if (d) cur = (cur + d + VIEWS.length) % VIEWS.length; else return;
      e.preventDefault(); location.hash = "#/" + VIEWS[cur]; document.getElementById("tab-" + VIEWS[cur]).focus();
    });
    $("#view").addEventListener("click", function (e) { var t = e.target.closest("[data-go]"); if (t) location.hash = "#/" + t.dataset.go; });
    render();
    return render;
  }
  var D = null, TC = { Central: PAL[0], Northeast: PAL[1], Northwest: PAL[2], "Outside zones": "#89919A" };
  var mi = function (v) { return num(v, v < 100 ? 1 : 0); };
  var usd = function (v) { return big(v, "US$"); };
  var R_MI = 3958.8;
  function proj() {
    var pts = D.customers.map(function (c) { return [c.lat, c.lon]; }).concat([D.dallasPt, D.houstonPt]);
    var la = pts.map(function (p) { return p[0]; }), lo = pts.map(function (p) { return p[1]; });
    var a0 = Math.min.apply(null, la) - 0.6, a1 = Math.max.apply(null, la) + 0.6, o0 = Math.min.apply(null, lo) - 0.6, o1 = Math.max.apply(null, lo) + 0.6;
    var kx = Math.cos((a0 + a1) / 2 * Math.PI / 180), W = 640, sx = (W - 20) / ((o1 - o0) * kx), H = Math.round((a1 - a0) * sx + 20);
    return { W: W, H: H, a0: a0, a1: a1, o0: o0, o1: o1, x: function (lon) { return 10 + (lon - o0) * kx * sx; }, y: function (lat) { return 10 + (a1 - lat) * sx; } };
  }
  function map(opt) {
    var P = proj(), s = "", cs = D.customers;
    for (var g = Math.ceil(P.a0); g <= P.a1; g += 2) s += '<line class="axis" x1="0" x2="' + P.W + '" y1="' + P.y(g).toFixed(1) + '" y2="' + P.y(g).toFixed(1) + '"/><text x="4" y="' + (P.y(g) - 3).toFixed(1) + '">' + g + "&deg;N</text>";
    for (var h = Math.ceil(P.o0); h <= P.o1; h += 2) s += '<line class="axis" y1="0" y2="' + P.H + '" x1="' + P.x(h).toFixed(1) + '" x2="' + P.x(h).toFixed(1) + '"/><text x="' + (P.x(h) + 3).toFixed(1) + '" y="' + (P.H - 4) + '">' + (-h) + "&deg;W</text>";
    if (opt.r) cs.forEach(function (c, i) { var st = opt.r.sites[opt.r.assign[i]]; s += '<line x1="' + P.x(c.lon).toFixed(1) + '" y1="' + P.y(c.lat).toFixed(1) + '" x2="' + P.x(st.lon).toFixed(1) + '" y2="' + P.y(st.lat).toFixed(1) + '" stroke="' + PAL[opt.r.assign[i] % PAL.length] + '" stroke-opacity=".28" stroke-width="1"/>'; });
    cs.forEach(function (c, i) {
      var col = opt.r ? PAL[opt.r.assign[i] % PAL.length] : TC[c.terr];
      s += '<circle cx="' + P.x(c.lon).toFixed(1) + '" cy="' + P.y(c.lat).toFixed(1) + '" r="' + (2 + Math.sqrt(c.gal) / 40).toFixed(1) + '" fill="' + col + '" fill-opacity=".65" stroke="#fff" stroke-width=".6"><title>' + esc(c.city + ", " + c.st + ": " + num(c.gal) + " gallons, " + c.terr) + "</title></circle>";
    });
    function mark(lat, lon, label, fill) { var x = P.x(lon), y = P.y(lat); s += '<rect x="' + (x - 5.5).toFixed(1) + '" y="' + (y - 5.5).toFixed(1) + '" width="11" height="11" fill="' + fill + '" stroke="#1D2D3E" stroke-width="1.4" transform="rotate(45 ' + x.toFixed(1) + " " + y.toFixed(1) + ')"/><text class="lbl" x="' + (x + 9).toFixed(1) + '" y="' + (y + 4).toFixed(1) + '">' + esc(label) + "</text>"; }
    if (opt.r) opt.r.sites.forEach(function (st, j) { mark(st.lat, st.lon, st.name.split(",")[0], PAL[j % PAL.length]); });
    else { mark(D.dallasPt[0], D.dallasPt[1], "Dallas warehouse", "#fff"); mark(D.houstonPt[0], D.houstonPt[1], "Houston plant", "#fff"); }
    return '<svg class="chart map" viewBox="0 0 ' + P.W + " " + P.H + '" role="img" aria-label="' + esc(opt.aria) + '">' + s + "</svg>";
  }
  function hav(a, b) {
    var r = Math.PI / 180, dp = (b[0] - a[0]) * r, dl = (b[1] - a[1]) * r;
    var h = Math.pow(Math.sin(dp / 2), 2) + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.pow(Math.sin(dl / 2), 2);
    return { dp: dp, dl: dl, h: h, d: 2 * R_MI * Math.asin(Math.sqrt(h)) };
  }
  function customers() {
    var t = D.territories.slice().sort(function (a, b) { return b.gal - a.gal; }), cen = t.filter(function (x) { return x.terr === "Central"; })[0];
    var rows = t.map(function (x) { return [{ h: '<span style="color:' + TC[x.terr] + '">&#9679;</span> ' + esc(x.terr) }, num(x.n), num(x.gal), pct(x.gal / D.gal), num(x.stops)]; });
    var e = D.ex, H = hav([e.lat, e.lon], D.dallasPt);
    var fx = fxCard("Formula: haversine distance",
      [V("a") + " = sin&sup2;(&Delta;" + V("&phi;") + "/2) + cos " + V("&phi;") + "<sub>1</sub> &middot; cos " + V("&phi;") + "<sub>2</sub> &middot; sin&sup2;(&Delta;" + V("&lambda;") + "/2)",
       V("d") + " = 2" + V("R") + " &middot; arcsin(&radic;" + V("a") + ")"],
      [[V("&phi;"), "Latitude in radians"], [V("&lambda;"), "Longitude in radians"], [V("R"), "Earth radius, 3,958.8 miles"], [V("d"), "Straight line miles, not road miles"]],
      "Largest Northwest customer, " + esc(e.city) + ", to Dallas:" +
      '<div class="fx">&Delta;' + V("&phi;") + " = " + H.dp.toFixed(4) + ", &Delta;" + V("&lambda;") + " = " + H.dl.toFixed(4) + ", " + V("a") + " = " + H.h.toFixed(6) + "</div>" +
      '<div class="fx">' + V("d") + " = 2 &middot; 3,958.8 &middot; arcsin(&radic;" + H.h.toFixed(6) + ") = " + mi(H.d) + " miles</div>");
    return '<h1 class="v-title">Customers and demand</h1><p class="v-sub">Customers served from the Dallas warehouse in 2004. Dot size shows gallons.</p>' +
      tiles([
        { title: "Customers", sub: Object.keys(D.customers.reduce(function (a, c) { a[c.st] = 1; return a; }, {})).length + " states", val: num(D.n), tone: "info" },
        { title: "Gallons delivered", sub: "2004", val: big(D.gal), foot: num(D.deliveries) + " deliveries" },
        { title: "Customer stops", sub: "Customer and day pairs", val: num(D.stops) },
        { title: "Central zone", sub: "Share of gallons", val: pct(cen.gal / D.gal, 0), foot: num(cen.n) + " customers" }
      ]) +
      '<div class="grid wide">' + card("Customer map", map({ aria: "Customer locations coloured by routing zone" }) + legend(t.map(function (x) { return { c: TC[x.terr], n: x.terr }; }))) +
      card("Routing zones", table(["Zone", "Customers", "Gallons", "Share", "Stops"], rows, [1, 2, 3, 4]), "Zones come from 3 digit ZIP codes in the case file.") + "</div>" +
      '<div class="grid two">' + fx + card("How distance becomes cost", '<ul class="plain"><li>Trips: gallons / ' + num(D.galPerTrip) + ", a 4,000 gallon trailer at 80% full.</li><li>Each trip is counted out and back.</li><li>One scale factor, " + D.k.toFixed(2) + ", lifts straight line miles to the " + num(D.case.miles2004) + " miles driven in 2004.</li><li>Cost per mile: US$" + D.costPerMile.toFixed(2) + ", from driver, truck and trailer costs in the case.</li></ul>") + "</div>" +
      comment("The Central zone holds " + pct(cen.gal / D.gal, 0) + " of gallons, so most demand sits near Dallas. " + num(t.filter(function (x) { return x.terr === "Outside zones"; })[0].n) + " customers fall outside the three zones and take " + pct(t.filter(function (x) { return x.terr === "Outside zones"; })[0].gal / D.gal, 1) + " of gallons. Straight line trips explain " + pct(1 / D.k, 0) + " of the miles driven, so road detours and multi stop routes matter.");
  }
  function sites(q) {
    var p = Math.min(4, Math.max(1, parseInt(q.get("p"), 10) || 2)), r = D.res.p[p - 1], base = D.res.dallas;
    var seg = '<div class="seg" role="group" aria-label="Number of sites">' + [1, 2, 3, 4].map(function (k) { return '<button type="button" data-p="' + k + '" aria-pressed="' + (k === p) + '">' + k + "</button>"; }).join("") + "</div>";
    var stats = r.sites.map(function (st, j) {
      var g = 0, n = 0, wd = 0; D.customers.forEach(function (c, i) { if (r.assign[i] === j) { n++; g += c.gal; wd += c.gal * hav([c.lat, c.lon], [st.lat, st.lon]).d; } });
      return [{ h: '<span style="color:' + PAL[j % PAL.length] + '">&#9670;</span> ' + esc(st.name) }, num(n), pct(g / D.gal, 0), mi(g ? wd / g : 0)];
    });
    var term = function (i) { var c = D.customers[i], st = r.sites[r.assign[i]]; return c.gal * hav([c.lat, c.lon], [st.lat, st.lon]).d; };
    var bi = 0; D.customers.forEach(function (c, i) { if (term(i) > term(bi)) bi = i; });
    var bc = D.customers[bi], bs = r.sites[r.assign[bi]], bd = hav([bc.lat, bc.lon], [bs.lat, bs.lon]).d;
    var fx = fxCard("Formula: p-median",
      ["min " + SUM("i") + SUM("j") + V("w") + "<sub>i</sub> " + V("d") + "<sub>ij</sub> " + V("x") + "<sub>ij</sub>",
       "s.t. " + SUM("j") + V("x") + "<sub>ij</sub> = 1, &nbsp; " + V("x") + "<sub>ij</sub> &le; " + V("y") + "<sub>j</sub>, &nbsp; " + SUM("j") + V("y") + "<sub>j</sub> = " + V("p") + ", &nbsp; " + V("y") + "<sub>j</sub> &isin; {0,1}"],
      [[V("w") + "<sub>i</sub>", "Gallons delivered to customer i in 2004"], [V("d") + "<sub>ij</sub>", "Haversine miles from customer i to site j"], [V("x") + "<sub>ij</sub>", "Share of customer i served from site j"],
       [V("y") + "<sub>j</sub>", "1 if site j opens. Candidates: " + num(D.nCand) + " customer towns plus Dallas and Houston"], [V("p"), "Number of sites, " + p]],
      "Largest term in the objective, " + esc(bc.city) + ", to " + esc(bs.name.split(",")[0]) + ":" +
      '<div class="fx">' + V("w") + V("d") + " = " + num(bc.gal) + " &middot; " + mi(bd) + " = " + num(bc.gal * bd) + " gallon miles</div>" +
      '<div class="fx">Objective = ' + num(r.obj) + "; &nbsp; / " + num(D.gal) + " gallons = " + mi(r.avgMi) + " miles</div>");
    return '<h1 class="v-title">Best sites</h1><p class="v-sub">Solved to optimality with PuLP. Outbound delivery cost only.</p>' +
      '<section class="filterbar" aria-label="Sites"><div class="fb-group"><span class="fb-label">Number of sites</span>' + seg + "</div></section>" +
      tiles([
        { title: "Average distance", sub: "Gallon weighted, one way", val: mi(r.avgMi) + " mi", tone: "info", foot: "Dallas today: " + mi(base.avgMi) + " mi" },
        { title: "Miles a year", sub: "Estimated", val: big(r.miles), foot: "Dallas today: " + big(base.miles) },
        { title: "Delivery cost a year", sub: "US$" + D.costPerMile.toFixed(2) + " a mile", val: usd(r.cost) },
        { title: "Saving against Dallas", sub: "Delivery cost", val: usd(base.cost - r.cost), tone: base.cost - r.cost > 0 ? "pos" : "", foot: pct((base.cost - r.cost) / base.cost, 0) + " lower" }
      ]) +
      '<div class="grid wide">' + card(p + (p === 1 ? " site" : " sites"), map({ r: r, aria: "Customers linked to their nearest open site" })) +
      card("Sites", table(["Site", "Customers", "Gallons", "Avg miles"], stats, [1, 2, 3]), "Site names are the nearest customer town.") + "</div>" +
      fx +
      comment("With " + p + (p === 1 ? " site" : " sites") + " the average customer sits " + mi(r.avgMi) + " miles away, against " + mi(base.avgMi) + " from Dallas today. Delivery cost falls by " + usd(base.cost - r.cost) + " a year. " + (p > 1 ? "Each extra site needs rent, stock and replenishment, which this view leaves out." : "One site lands in Dallas, so the current location is already the best single site."));
  }
  function compare() {
    var b = D.res.dallas, ho = D.res.houston, ps = D.res.p;
    var rows = [["Dallas warehouse today", "1", mi(b.avgMi), num(b.miles), usd(b.cost), "", pct(b.within150, 0)],
      ["Houston plant, direct", "1", mi(ho.avgMi), num(ho.miles), usd(ho.cost), { t: usd(b.cost - ho.cost), cls: "neg" }, pct(ho.within150, 0)]].concat(ps.map(function (r) {
      return ["Best " + r.p + (r.p === 1 ? " site" : " sites"), String(r.p), mi(r.avgMi), num(r.miles), usd(r.cost), { t: usd(b.cost - r.cost), cls: b.cost - r.cost > 0 ? "pos" : "" }, pct(r.within150, 0)]; }));
    var step = ps.map(function (r, i) { return { name: i ? "Site " + r.p + " added" : "1 site, against Dallas today", v: i ? ps[i - 1].cost - r.cost : b.cost - r.cost, label: usd(i ? ps[i - 1].cost - r.cost : b.cost - r.cost) }; });
    var lab = ps.map(function (r) { return String(r.p); });
    var raw = D.rawDallasMiles, c = D.case;
    var fx = fxCard("Formula: miles and cost",
      [V("M") + " = " + V("k") + " &middot; " + SUM("i") + "(" + V("w") + "<sub>i</sub> / " + num(D.galPerTrip) + ") &middot; 2 &middot; " + V("d") + "<sub>i</sub>",
       V("k") + " = " + num(c.miles2004) + " / " + V("M") + "<sub>raw, Dallas</sub>, &nbsp; Cost = " + V("c") + "<sub>mile</sub> &middot; " + V("M")],
      [[V("d") + "<sub>i</sub>", "Miles from customer i to its nearest open site"], [V("k"), "Scale factor, " + D.k.toFixed(3)], [V("c") + "<sub>mile</sub>", c.drivers + " rigs x (" + num(c.driver) + " + " + num(c.truck) + " + " + num(c.trailer) + ") / " + num(c.miles2004) + " miles = US$" + D.costPerMile.toFixed(2)]],
      "Dallas today:" + '<div class="fx">' + V("k") + " = " + num(c.miles2004) + " / " + num(raw) + " = " + D.k.toFixed(3) + "</div>" +
      '<div class="fx">Cost = ' + D.costPerMile.toFixed(2) + " &middot; " + num(b.miles) + " = " + usd(b.cost) + "</div>");
    return '<h1 class="v-title">Compare setups</h1><p class="v-sub">Average distance and delivery cost against number of sites.</p>' +
      tiles([
        { title: "Dallas today", sub: "Delivery cost a year", val: usd(b.cost), foot: num(c.miles2004) + " miles" },
        { title: "Houston direct", sub: "Delivery cost a year", val: usd(ho.cost), tone: "neg", foot: mi(ho.avgMi) + " mi average" },
        { title: "Best 2 sites", sub: "Delivery cost a year", val: usd(ps[1].cost), tone: "pos", foot: ps[1].sites.map(function (s) { return s.name.split(",")[0]; }).join(" and ") },
        { title: "Best 4 sites", sub: "Delivery cost a year", val: usd(ps[3].cost), tone: "pos", foot: mi(ps[3].avgMi) + " mi average" }
      ]) +
      '<div class="grid two">' + card("Average miles by number of sites", lineChart([{ c: PAL[0], v: ps.map(function (r) { return r.avgMi; }), dots: 1 }, { c: "#89919A", v: ps.map(function () { return b.avgMi; }), dash: "4 4", w: 1.5 }], lab, { every: 1, fy: function (v) { return num(v); }, aria: "Average distance by number of sites" }) + legend([{ c: PAL[0], n: "Best sites", line: 1 }, { c: "#89919A", n: "Dallas today", line: 1 }])) +
      card("Saving from each added site", bars(step), "Delivery cost a year. An extra site pays off only if it costs less than this.") + "</div>" +
      card("All setups", table(["Setup", "Sites", "Avg miles", "Miles a year", "Cost a year", "Saving", "Within 150 mi"], rows, [1, 2, 3, 4, 5, 6])) +
      fx +
      comment("Shipping direct from Houston would cost " + usd(ho.cost) + " a year in delivery, " + usd(ho.cost - b.cost) + " more than Dallas, before any warehouse saving. A second site at " + ps[1].sites.filter(function (s) { return s.name !== ps[0].sites[0].name; }).map(function (s) { return s.name.split(",")[0]; }).join("") + " saves " + usd(b.cost - ps[1].cost) + " a year. Later sites save less each time.");
  }
  function about() {
    return '<div class="about"><h1 class="v-title">About the data</h1><div class="grid two">' +
      card("Source", '<ul class="plain"><li>ChemCo Distribution case and data, MIT OpenCourseWare, ESD.260J Logistics Systems, Fall 2006, Caplice and Sheffi. Case by Jose J. Hernandez.</li><li>' + num(D.deliveries) + " deliveries in 2004 to " + num(D.n) + " customers with latitude and longitude.</li><li>Licence: CC BY-NC-SA 4.0. Learning project on public data.</li></ul>") +
      card("Assumptions", '<ul class="plain"><li>Weights are gallons. ' + num(D.lbRows) + " rows in pounds are left out.</li><li>Dallas and Houston points are city centres, not site addresses.</li><li>Distances are straight line, scaled once to the 2004 miles.</li><li>Rent, stock and replenishment are not in this app. The cost app adds replenishment.</li></ul>") + "</div>" +
      comment("All figures come from the case file and the cost figures stated in the case. The geocodes came with the case and were not checked against a street map.") + "</div>";
  }
  var RENDER = { customers: customers, sites: sites, compare: compare, about: about };
  fetch("data/facility.json").then(function (r) { return r.json(); }).then(function (d) {
    D = d; router(["customers", "sites", "compare", "about"], RENDER);
    $("#view").addEventListener("click", function (e) { var b = e.target.closest("[data-p]"); if (b) location.hash = "#/sites?p=" + b.dataset.p; });
  }).catch(function () { $("#view").innerHTML = '<p class="loading">Could not load the data. Please reload the page.</p>'; });
})();
