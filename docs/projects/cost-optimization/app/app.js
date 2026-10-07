/* Cost Optimization app: hash routing, hand rolled SVG charts. No dependencies. */
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
  var D = null;
  var usd = function (v) { return big(v, "US$"); };
  var n1 = function (v) { return num(v, Math.round(v) === v ? 0 : 1); };
  function transport() {
    var A = D.A, sav = A.nwCost - A.opt;
    var costRows = A.plants.map(function (p, i) { return [p].concat(A.cost[i].map(n1)).concat([num(A.supply[i])]); });
    costRows.push([{ h: "<strong>Demand</strong>" }].concat(A.demand.map(function (v) { return num(v); })).concat([""]));
    var flowRows = A.plants.map(function (p, i) { return [p].concat(A.flow[i].map(function (f) { return f > 0 ? { t: num(f), cls: "hit" } : { t: "0" }; })); });
    var terms = [], used = [];
    A.plants.forEach(function (p, i) { A.dcs.forEach(function (d, j) { if (A.flow[i][j] > 0) { terms.push(n1(A.cost[i][j]) + "&middot;" + num(A.flow[i][j])); used.push(A.cost[i][j] * A.flow[i][j]); } }); });
    var fx = fxCard("Formula: transportation LP",
      ["min " + V("z") + " = " + SUM("i") + SUM("j") + V("c") + "<sub>ij</sub> " + V("x") + "<sub>ij</sub>",
       "s.t. " + SUM("j") + V("x") + "<sub>ij</sub> &le; " + V("s") + "<sub>i</sub>, &nbsp; " + SUM("i") + V("x") + "<sub>ij</sub> &ge; " + V("d") + "<sub>j</sub>, &nbsp; " + V("x") + "<sub>ij</sub> &ge; 0"],
      [[V("x") + "<sub>ij</sub>", "Units shipped from plant i to centre j"], [V("c") + "<sub>ij</sub>", "Cost per unit on that route"], [V("s") + "<sub>i</sub>", "Plant capacity"], [V("d") + "<sub>j</sub>", "Units the centre needs"]],
      "Optimal plan, used routes only:" + '<div class="fx">' + V("z") + " = " + terms.join(" + ") + " = " + num(A.opt) + "</div>");
    var shadow = A.plants.map(function (p, i) { return [p, num(A.supply[i]), A.dualS[i] < 0 ? { t: "Saves " + n1(-A.dualS[i]), cls: "pos" } : { t: "0" }, n1(A.recheck[i])]; });
    var red = []; A.plants.forEach(function (p, i) { A.dcs.forEach(function (d, j) { if (A.flow[i][j] === 0 && A.reduced[i][j] > 0) red.push([p + " to " + d, n1(A.cost[i][j]), n1(A.reduced[i][j])]); }); });
    var fx2 = fxCard("Formula: shadow price",
      [V("&pi;") + "<sub>i</sub> = &part;" + V("z") + "* / &part;" + V("s") + "<sub>i</sub>, &nbsp; " + V("r") + "<sub>ij</sub> = " + V("c") + "<sub>ij</sub> &minus; (" + V("&pi;") + "<sub>i</sub> + " + V("&mu;") + "<sub>j</sub>)"],
      [[V("&pi;") + "<sub>i</sub>", "Change in best cost from one more unit at plant i"], [V("&mu;") + "<sub>j</sub>", "Price of one more unit needed at centre j"], [V("r") + "<sub>ij</sub>", "Reduced cost: how far a route rate must fall before the plan uses it"]],
      "Check by solving again with one more unit at each plant:" + '<div class="fx">' + A.plants.map(function (p, i) { return esc(p) + ": " + n1(A.recheck[i]); }).join(", &nbsp; ") + "</div>");
    var best = 0; A.dualS.forEach(function (v, i) { if (v < A.dualS[best]) best = i; });
    return '<h1 class="v-title">Transportation model</h1><p class="v-sub">Autopower case, 3 plants to 4 distribution centres, from MIT OCW 15.057.</p>' +
      tiles([
        { title: "Optimal cost", sub: "LP solution", val: num(A.opt), tone: "pos", foot: "Cost units" },
        { title: "Naive plan", sub: "Northwest corner rule", val: num(A.nwCost), foot: "Fill rows in order" },
        { title: "Saving", sub: "Against naive", val: pct(sav / A.nwCost), tone: "info", foot: num(sav) + " cost units" },
        { title: "Units shipped", sub: "Supply equals demand", val: num(A.demand.reduce(function (a, b) { return a + b; }, 0)) }
      ]) +
      '<div class="grid two">' + card("Unit cost and capacity", table(["From / to"].concat(A.dcs).concat(["Supply"]), costRows, [1, 2, 3, 4, 5])) +
      card("Optimal flows", table(["From / to"].concat(A.dcs), flowRows, [1, 2, 3, 4]).replace("<table>", '<table class="matrix">'), "Shaded cells carry flow.") + "</div>" +
      '<div class="grid two">' + fx + fx2 + "</div>" +
      '<div class="grid two">' + card("Shadow prices, plants", table(["Plant", "Capacity", "One more unit", "Re-solve check"], shadow, [1, 2, 3])) +
      card("Unused routes", table(["Route", "Rate", "Must fall by"], red, [1, 2])) + "</div>" +
      comment("The LP ships the same " + num(A.demand.reduce(function (a, b) { return a + b; }, 0)) + " units for " + num(A.opt) + ", " + pct(sav / A.nwCost) + " less than the northwest corner plan. One more unit of capacity at " + A.plants[best] + " would cut cost by " + n1(-A.dualS[best]) + ", so that is the plant to expand first.");
  }
  function netSvg(B) {
    var pos = {}, W = 640, H = 260;
    B.plants.forEach(function (p, i) { pos[p] = [70, 50 + i * 80]; }); B.dcs.forEach(function (d, i) { pos[d] = [320, 90 + i * 80]; }); B.custs.forEach(function (c, i) { pos[c] = [570, 90 + i * 80]; });
    var s = "", mx = Math.max.apply(null, B.arcs.map(function (a) { return a.flow; }));
    B.arcs.forEach(function (a) {
      var p = pos[a.from], q = pos[a.to], on = a.flow > 0, mxp = p[0] + 34 + (q[0] - p[0] - 68) * 0.3, myp = p[1] + (q[1] - p[1]) * 0.3;
      s += '<line x1="' + (p[0] + 34) + '" y1="' + p[1] + '" x2="' + (q[0] - 34) + '" y2="' + q[1] + '" stroke="' + (on ? "#0070F2" : "#C9D1D9") + '" stroke-width="' + (on ? 1.5 + 5 * a.flow / mx : 1.2) + '"' + (on ? "" : ' stroke-dasharray="4 4"') + "><title>" + esc(a.from + " to " + a.to + ": " + num(a.flow) + " of " + num(a.cap) + ", cost " + n1(a.cost)) + "</title></line>";
      if (on) s += '<text x="' + mxp + '" y="' + (myp - 5) + '" text-anchor="middle" style="fill:#1D2D3E;font-weight:700">' + num(a.flow) + "</text>";
    });
    Object.keys(pos).forEach(function (k) { var p = pos[k]; s += '<rect x="' + (p[0] - 34) + '" y="' + (p[1] - 15) + '" width="68" height="30" rx="8" fill="#fff" stroke="#556B82"/><text x="' + p[0] + '" y="' + (p[1] + 4) + '" text-anchor="middle" style="fill:#1D2D3E">' + esc(k) + "</text>"; });
    return '<svg class="chart" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Network flows, plants to centres to customers">' + s + "</svg>";
  }
  function transship() {
    var B = D.B, d = B.dual, sumS = B.supply.reduce(function (a, b) { return a + b; }, 0), sumD = B.demand.reduce(function (a, b) { return a + b; }, 0);
    var rows = B.arcs.map(function (a) { return [a.from + " to " + a.to, n1(a.cost), num(a.cap), a.flow > 0 ? { t: num(a.flow), cls: "hit" } : "0", a.flow >= a.cap ? "Full" : ""]; });
    var inn = B.arcs.filter(function (a) { return a.to === "DC 1"; }), out = B.arcs.filter(function (a) { return a.from === "DC 1"; });
    var fx = fxCard("Formula: transshipment balance",
      ["min " + SUM("(i,j)") + V("c") + "<sub>ij</sub> " + V("x") + "<sub>ij</sub>",
       SUM("k") + V("x") + "<sub>ik</sub> &le; " + V("s") + "<sub>i</sub>, &nbsp; " + SUM("i") + V("x") + "<sub>ik</sub> &minus; " + SUM("j") + V("x") + "<sub>kj</sub> = 0, &nbsp; " + SUM("k") + V("x") + "<sub>kj</sub> &ge; " + V("d") + "<sub>j</sub>, &nbsp; 0 &le; " + V("x") + " &le; " + V("u")],
      [[V("i"), "Plant"], [V("k"), "Distribution centre, a pass through node"], [V("j"), "Customer"], [V("u"), "Arc capacity, " + num(B.arcs[0].cap) + " tons on every arc"], [V("c"), "Cost in $000 per ton"]],
      "Balance at DC 1:" + '<div class="fx">In: ' + inn.map(function (a) { return num(a.flow); }).join(" + ") + " = " + num(inn.reduce(function (s, a) { return s + a.flow; }, 0)) + " &nbsp; Out: " + out.map(function (a) { return num(a.flow); }).join(" + ") + " = " + num(out.reduce(function (s, a) { return s + a.flow; }, 0)) + "</div>");
    var sp = [["Plant 1 capacity", d.s_1], ["Plant 2 capacity", d.s_2], ["Plant 3 capacity", d.s_3], ["Customer 1 demand", d.d_1], ["Customer 2 demand", d.d_2]].map(function (r) {
      var v = r[1], w = r[0].indexOf("capacity") > 0 ? (v < 0 ? "One more ton saves " + n1(-v) : "Not scarce, worth 0") : "One more ton costs " + n1(v);
      return [r[0], { t: w, cls: v < 0 ? "pos" : "" }]; });
    return '<h1 class="v-title">Transshipment model</h1><p class="v-sub">3 plants, 2 distribution centres, 2 customers, every arc capped. From MIT OCW 15.057.</p>' +
      tiles([
        { title: "Optimal cost", sub: "$000", val: num(B.opt), tone: "pos" },
        { title: "Naive plan", sub: "Cheapest path first, plant by plant", val: num(B.naive), foot: "$000" },
        { title: "Saving", sub: "Against naive", val: pct((B.naive - B.opt) / B.naive), tone: "info", foot: num(B.naive - B.opt) + " ($000)" },
        { title: "Tons shipped", sub: "Demand met", val: num(sumD), foot: num(sumS - sumD) + " tons of capacity left" }
      ]) +
      '<div class="grid wide">' + card("Optimal flows, tons", netSvg(B)) + card("Arcs", table(["Arc", "Cost", "Cap", "Flow", ""], rows, [1, 2, 3])) + "</div>" +
      '<div class="grid two">' + fx + card("Shadow prices in plain words", table(["Constraint", "Meaning"], sp, []), "Each DC balance has a price of " + n1(d.bal_1) + ": a ton landed at a DC is worth that much.") + "</div>" +
      comment("The LP meets " + num(sumD) + " tons for " + num(B.opt) + " ($000), " + num(B.naive - B.opt) + " less than a greedy plan. Plant 1, the costliest source, keeps " + num(B.supply[0] - B.arcs.filter(function (a) { return a.from === "Plant 1"; }).reduce(function (s, a) { return s + a.flow; }, 0)) + " tons spare, while Plants 2 and 3 run full. Customer 2 is the costly one to serve: one more ton there adds " + n1(d.d_2) + ".");
  }
  function chemco() {
    var C = D.C, sav = C.asis - C.opt;
    var rows = C.terr.slice().sort(function (a, b) { return (b.viaDallas + b.direct) - (a.viaDallas + a.direct); }).map(function (t) {
      return [t.terr, num(t.n), num(t.viaDallas), num(t.direct), num(t.nDirect)]; });
    var lab = C.sens.map(function (s) { return "$" + num(s.rate); });
    var e = C.exD, h = C.exH, totePart = C.totes * C.toteCost / C.toteTurns;
    var fx = fxCard("Formula: cost per gallon",
      [V("r") + " = (" + V("R") + " + " + V("n") + "&middot;" + V("t") + " / " + V("T") + ") / (" + V("n") + "&middot;" + V("g") + ")",
       V("c") + "<sub>oj</sub> = " + V("c") + "<sub>mile</sub> &middot; " + V("k") + " &middot; 2" + V("d") + "<sub>oj</sub> / " + num(C.galPerTrip),
       "Serve " + V("j") + " at min(" + V("r") + " + " + V("c") + "<sub>Dallas,j</sub> , " + V("c") + "<sub>Houston,j</sub>)"],
      [[V("R"), "Houston to Dallas round trip, US$" + num(C.rate)], [V("n") + ", " + V("g"), C.totes + " totes of " + C.toteGal + " gallons"], [V("t") + ", " + V("T"), "Tote price US$" + C.toteCost + ", replaced every " + C.toteTurns + " trips"],
       [V("c") + "<sub>mile</sub>, " + V("k"), "US$" + C.cpm.toFixed(2) + " a mile, scale " + C.k.toFixed(3) + " from the facility app"], [V("d") + "<sub>oj</sub>", "Haversine miles from origin o to customer j"]],
      '<div class="fx">' + V("r") + " = (" + num(C.rate) + " + " + num(totePart, 2) + ") / " + num(C.totes * C.toteGal) + " = US$" + C.repl.toFixed(4) + "</div>" +
      esc(e.city) + ", " + num(e.gal) + " gallons:" + '<div class="fx">via Dallas ' + C.repl.toFixed(4) + " + " + e.cd.toFixed(4) + " = " + (C.repl + e.cd).toFixed(4) + " &nbsp; direct " + e.ch.toFixed(4) + " &rArr; via Dallas</div>" +
      (h ? esc(h.city) + ":" + '<div class="fx">via Dallas ' + (C.repl + h.cd).toFixed(4) + " &nbsp; direct " + h.ch.toFixed(4) + " &rArr; direct</div>" : ""));
    var fx2 = fxCard("Shadow prices in plain words",
      [V("&mu;") + "<sub>j</sub> = &part;" + V("z") + "* / &part;" + V("d") + "<sub>j</sub> = cost to serve one more gallon at " + V("j")],
      [[V("&mu;") + "<sub>j</sub>", "Ranges from US$" + C.dualMin.toFixed(3) + " to US$" + C.dualMax.toFixed(3) + " a gallon, median US$" + C.dualMed.toFixed(3)], [V("&pi;") + "<sub>fleet</sub>", "Dallas fleet limit of " + num(C.fleetCap) + " miles: " + (C.fleetPi === 0 ? "not binding, worth 0" : C.fleetPi.toFixed(3))]],
      "One more gallon for " + esc(e.city) + ":" + '<div class="fx">' + V("&mu;") + " = " + e.dual.toFixed(4) + " = " + V("r") + " + " + V("c") + "<sub>Dallas</sub></div>");
    return '<h1 class="v-title">ChemCo network</h1><p class="v-sub">Houston plant, Dallas warehouse, ' + num(C.n) + " customers. Variable freight in US$ a year.</p>" +
      tiles([
        { title: "LP optimum", sub: "Mixed routing", val: usd(C.opt), tone: "pos", foot: num(C.nDirect) + " customers go direct" },
        { title: "As is", sub: "All through Dallas", val: usd(C.asis), foot: "Saving " + usd(sav) + ", " + pct(sav / C.asis) },
        { title: "All direct", sub: "Close Dallas, ship from Houston", val: usd(C.direct), tone: "neg", foot: usd(C.direct - C.asis) + " more than as is" },
        { title: "Replenishment", sub: "Houston to Dallas", val: "US$" + C.repl.toFixed(3), foot: "Per gallon" }
      ]) +
      '<div class="grid two">' + card("Optimal flows by zone, gallons", table(["Zone", "Customers", "Via Dallas", "Direct", "Direct customers"], rows, [1, 2, 3, 4]), "Houston ships " + num(C.hd) + " gallons to Dallas.") +
      card("Share through Dallas as the round trip rate rises", lineChart([{ c: PAL[0], v: C.sens.map(function (s) { return s.shareDallas * 100; }), dots: 1 }], lab, { every: 1, fy: function (v) { return num(v) + "%"; }, aria: "Share of gallons routed through Dallas by round trip rate" }) + '<p class="note">Rate today: US$' + num(C.rate) + ". Below half of gallons from US$" + num(C.halfRate) + ".</p>") + "</div>" +
      '<div class="grid two">' + fx + fx2 + "</div>" +
      comment("Routing each customer the cheaper way costs " + usd(C.opt) + " a year, " + usd(sav) + " less than sending all through Dallas. Closing Dallas would add " + usd(C.direct - C.asis) + " in freight. Dallas keeps most gallons until the round trip rate passes US$" + num(C.halfRate) + ". Rent and stock at Dallas are fixed and sit outside this LP.");
  }
  function about() {
    return '<div class="about"><h1 class="v-title">About the data</h1><div class="grid two">' +
      card("Sources", '<ul class="plain"><li>Transportation and transshipment models: MIT OpenCourseWare, 15.057 Systems Optimization, Spring 2003, Prof. John Vande Vate. CC BY-NC-SA 4.0.</li><li>ChemCo case and data: MIT OpenCourseWare, ESD.260J Logistics Systems, Fall 2006, Caplice and Sheffi. CC BY-NC-SA 4.0.</li><li>Learning project on public data.</li></ul>') +
      card("Method", '<ul class="plain"><li>Solved with PuLP and the CBC solver in Python.</li><li>Shadow prices are LP duals, checked by solving again.</li><li>ChemCo costs use the case figures. Dallas rent and stock are not in the LP.</li></ul>') + "</div>" +
      comment("The 15.057 models are small teaching cases, so they show the method. The ChemCo model applies it to 245 real customer points.") + "</div>";
  }
  var RENDER = { transport: transport, transship: transship, chemco: chemco, about: about };
  fetch("data/costopt.json").then(function (r) { return r.json(); }).then(function (d) { D = d; router(["transport", "transship", "chemco", "about"], RENDER); })
    .catch(function () { $("#view").innerHTML = '<p class="loading">Could not load the data. Please reload the page.</p>'; });
})();
