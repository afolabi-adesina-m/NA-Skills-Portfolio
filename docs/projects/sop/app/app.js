/* Sales and Operations Planning app: hash routing, hand rolled SVG charts. No dependencies. */
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
  var D = null, R = { cp: 10, h: 1, up: 4, dn: 6 };
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var ml = function (s) { return MON[+s.slice(5, 7) - 1] + " " + s.slice(0, 4); };
  var ms = function (s) { return MON[+s.slice(5, 7) - 1] + " " + s.slice(2, 4); };
  var cases = function (v) { return num(Math.round(v)); };
  function sumPY(arr, endIdx) { var s = 0; for (var i = endIdx - 11; i <= endIdx; i++) s += arr[i]; return s; }

  function plan() {
    var f = D.fc.future.map(function (r) { return r.f; }), n = f.length, P0 = D.fc.lastActual;
    var cum = 0, L = 0; f.forEach(function (d, i) { cum += d; L = Math.max(L, Math.ceil(cum / (i + 1))); });
    function run(P) {
      var I = 0, prev = P0, out = { P: P, I: [], up: 0, dn: 0, sumP: 0, sumI: 0 };
      P.forEach(function (p, i) { I = I + p - f[i]; out.I.push(I); out.sumI += I; out.sumP += p; if (p > prev) out.up += p - prev; else out.dn += prev - p; prev = p; });
      out.cProd = R.cp * out.sumP; out.cChg = R.up * out.up + R.dn * out.dn; out.cHold = R.h * out.sumI; out.total = out.cProd + out.cChg + out.cHold;
      return out;
    }
    var chase = run(f.slice()), level = run(f.map(function () { return L; }));
    var sumD = f.reduce(function (a, b) { return a + b; }, 0);
    var hStar = level.sumI ? ((R.up * chase.up + R.dn * chase.dn) - (R.up * level.up + R.dn * level.dn) - R.cp * (level.sumP - sumD)) / level.sumI : null;
    return { f: f, P0: P0, L: L, chase: chase, level: level, sumD: sumD, hStar: hStar };
  }

  function history() {
    var e = D.events, last = D.total.length - 1, py6 = sumPY(D.total, last), py5 = sumPY(D.total, last - 12);
    var q6 = sumPY(D.byChannel.QSR, last);
    var di = D.families.filter(function (r) { return r.family.indexOf("DrinkIt") === 0; });
    var di5 = di.reduce(function (a, r) { return a + r.py2005; }, 0), di6 = di.reduce(function (a, r) { return a + r.py2006; }, 0);
    var lab = D.months.map(function (m) { return m.slice(0, 4); });
    var chart = lineChart([{ c: PAL[0], v: D.byChannel.QSR }, { c: PAL[1], v: D.byChannel.MR }, { c: PAL[2], v: D.byChannel.SM }], lab, { every: 12, aria: "Monthly cases by channel, August 1996 to August 2006" });
    var a = D.annual, annual = a.years.map(function (y, i) { return ["Sep " + (y - 1) + " to Aug " + y, cases(a.QSR[i]), cases(a.MR[i]), cases(a.SM[i]), cases(a.QSR[i] + a.MR[i] + a.SM[i])]; }).slice(-5);
    var fam = D.families.map(function (r) { return [r.family, cases(r.py2005), cases(r.py2006), { t: (r.chg > 0 ? "+" : "") + pct(r.chg), cls: r.chg < 0 ? "neg" : "pos" }]; });
    var pr = {}; e.promo.forEach(function (p) { (pr[p.cust] = pr[p.cust] || []).push(p); });
    var promoRows = Object.keys(pr).map(function (c) { var l = pr[c], avg = l.reduce(function (s, p) { return s + p.lift; }, 0) / l.length; return ["Customer " + c + " promotion, " + MON[l[0].month - 1], "+" + pct(avg, 0), "Average lift 2004 to 2006"]; });
    var ev = [["Customer 33 lost, Sep 2005", cases(e.c33_py2005) + " to " + cases(e.c33_py2006), "Cases, year before and after"],
      ["Supermarket price rise, Nov 05 to May 06", pct(e.sm_price_chg), "Against same months a year earlier, customer 33 excluded"]].concat(promoRows);
    return '<h1 class="v-title">Demand history</h1><p class="v-sub">Monthly orders in cases, ' + num(D.nSku) + " SKUs, " + num(D.nCust) + " customers, 3 channels.</p>" +
      tiles([
        { title: "Last 12 months", sub: "Sep 2005 to Aug 2006", val: big(py6), foot: (py6 >= py5 ? "+" : "") + pct(py6 / py5 - 1) + " on the year before", tone: "info" },
        { title: "Quick service share", sub: "Last 12 months", val: pct(q6 / py6, 0), foot: "Two restaurant chains" },
        { title: "DrinkIt brand", sub: "Supermarket brand, on the year", val: pct(di6 / di5 - 1, 0), tone: "neg", foot: cases(di5) + " to " + cases(di6) + " cases" },
        { title: "Promotion lift", sub: "Mass retail, one month a year", val: "+" + pct(e.promo.reduce(function (s, p) { return s + p.lift; }, 0) / e.promo.length, 0), tone: "crit", foot: "Not in the old forecast" }
      ]) +
      card("Cases by channel", chart + legend([{ c: PAL[0], n: "Quick service (QSR)" }, { c: PAL[1], n: "Mass retail (MR)" }, { c: PAL[2], n: "Supermarket (SM)" }])) +
      '<div class="grid two">' + card("By channel, last 5 years", table(["Year", "QSR", "MR", "SM", "Total"], annual, [1, 2, 3, 4])) +
      card("By SKU family", table(["Family", "Year to Aug 05", "Year to Aug 06", "Change"], fam, [1, 2, 3])) + "</div>" +
      card("Events in the data", table(["Event", "Measured", "Basis"], ev, [1]), "Promotion lift: promotion month against the other months January to June.") +
      comment("Volume grew to " + big(py6) + " cases in the last 12 months, " + pct(py6 / py5 - 1) + " on the year before. Custom cups grew while the DrinkIt brand fell " + pct(-(di6 / di5 - 1), 0) + ". " + "Losing customer 33 alone took away " + cases(e.c33_py2005 - e.c33_py2006) + " cases of that fall. Promotions lift a customer month far above its base, so the forecast must know the promotion calendar.");
  }

  function forecastView() {
    var fc = D.fc, ch = fc.methods.filter(function (m) { return m.id === fc.chosen; })[0], sn = fc.methods.filter(function (m) { return m.id === "snaive"; })[0];
    var last = D.total.length, from = last - 36, lab = D.months.slice(from).map(ms);
    var act = D.total.slice(from), fcs = act.map(function (v, i) { return i >= 24 ? fc.testFc[i - 24] : null; });
    fcs[23] = act[23];
    var rows = fc.methods.map(function (m) { return [m.name + (m.id === fc.chosen ? " (chosen)" : ""), pct(m.val.wape), pct(m.test.wape), pct(m.test.mape), (m.test.bias > 0 ? "+" : "") + pct(m.test.bias)]; });
    var x = fc.example, S = fc.S, ee = fc.errEx;
    var fx1 = fxCard("Formula: seasonal exponential smoothing",
      [V("z") + "<sub>t</sub> = " + V("D") + "<sub>t</sub> / " + V("S") + "<sub>m(t)</sub>",
       V("L") + "<sub>t</sub> = " + V("&alpha;") + " &middot; " + V("z") + "<sub>t</sub> + (1 &minus; " + V("&alpha;") + ") &middot; " + V("L") + "<sub>t&minus;1</sub>",
       V("F") + "<sub>t+h</sub> = " + V("L") + "<sub>t</sub> &middot; " + V("S") + "<sub>m(t+h)</sub>"],
      [[V("D") + "<sub>t</sub>", "Actual cases ordered in month t"], [V("S") + "<sub>m</sub>", "Seasonal index for calendar month m: month over its Sep to Aug year average, averaged over full years, scaled to mean 1"],
       [V("z") + "<sub>t</sub>", "Cases with the season taken out"], [V("L") + "<sub>t</sub>", "Smoothed level after month t"],
       [V("&alpha;"), "Weight on the newest month, " + x.alpha.toFixed(2) + ", picked by least squared one step error"], [V("F") + "<sub>t+h</sub>", "Forecast h months ahead"]],
      "Last month in the data, " + ml(x.lastMonth) + ":" +
      '<div class="fx">' + V("z") + " = " + cases(x.D) + " / " + x.S_last.toFixed(4) + " = " + cases(x.z) + "</div>" +
      '<div class="fx">' + V("L") + " = " + x.alpha.toFixed(2) + " &middot; " + cases(x.z) + " + " + (1 - x.alpha).toFixed(2) + " &middot; " + cases(x.Fprev) + " = " + cases(x.L) + "</div>" +
      '<div class="fx">' + V("F") + "<sub>" + esc(ms(x.nextMonth)) + "</sub> = " + cases(x.L) + " &middot; " + x.S_next.toFixed(4) + " = " + cases(x.F_next) + "</div>");
    var e1 = Math.abs(ee.A - ee.F);
    var fx2 = fxCard("Formula: forecast error",
      ["WAPE = " + SUM("t") + "|" + V("A") + "<sub>t</sub> &minus; " + V("F") + "<sub>t</sub>| / " + SUM("t") + V("A") + "<sub>t</sub>",
       "MAPE = (1/" + V("n") + ") &middot; " + SUM("t") + "|" + V("A") + "<sub>t</sub> &minus; " + V("F") + "<sub>t</sub>| / " + V("A") + "<sub>t</sub>",
       "Bias = (" + SUM("t") + V("F") + "<sub>t</sub> &minus; " + SUM("t") + V("A") + "<sub>t</sub>) / " + SUM("t") + V("A") + "<sub>t</sub>"],
      [[V("A") + "<sub>t</sub>", "Actual cases in test month t"], [V("F") + "<sub>t</sub>", "Forecast made before the test year began"], [V("n"), "Test months, 12"]],
      "First test month, " + ml(ee.month) + ":" + '<div class="fx">|' + cases(ee.A) + " &minus; " + cases(ee.F) + "| / " + cases(ee.A) + " = " + pct(e1 / ee.A) + "</div>" +
      "<p class=\"note\">Over all 12 test months the chosen method gives WAPE " + pct(ch.test.wape) + " and MAPE " + pct(ch.test.mape) + ".</p>");
    return '<h1 class="v-title">Forecast and accuracy</h1><p class="v-sub">Method picked on Sep 2004 to Aug 2005. Tested on Sep 2005 to Aug 2006, unseen.</p>' +
      tiles([
        { title: "Chosen method", sub: ch.name, val: "\u03b1 " + ch.alpha.toFixed(2), tone: "info", foot: "Picked on the validation year" },
        { title: "Test WAPE", sub: "Chosen method", val: pct(ch.test.wape), foot: "Weighted error" },
        { title: "Test MAPE", sub: "Chosen method", val: pct(ch.test.mape), foot: "Average month error" },
        { title: "Baseline WAPE", sub: sn.name, val: pct(sn.test.wape), tone: sn.test.wape < ch.test.wape ? "crit" : "", foot: sn.test.wape < ch.test.wape ? "Slightly better on the test year" : "Worse than the chosen method" }
      ]) +
      '<div class="grid wide">' + card("Actual against forecast", lineChart([{ c: PAL[0], v: act, dots: false }, { c: PAL[1], v: fcs, dash: "5 4" }], lab, { every: 6, split: 23, aria: "Actual cases and test year forecast" }) + legend([{ c: PAL[0], n: "Actual", line: 1 }, { c: PAL[1], n: "Forecast from Aug 2005", line: 1 }])) +
      card("All methods", table(["Method", "Valid WAPE", "Test WAPE", "Test MAPE", "Test bias"], rows, [1, 2, 3, 4])) + "</div>" +
      '<div class="grid two">' + fx1 + fx2 + "</div>" +
      comment("The seasonal method had the lowest error on the validation year, so it was chosen before the test year was opened. On the test year it scored WAPE " + pct(ch.test.wape) + ", and the plain same month last year rule scored " + pct(sn.test.wape) + ". Both beat smoothing without a season, at " + pct(fc.methods.filter(function (m) { return m.id === "ses"; })[0].test.wape) + ". The test year held a lost customer and a price rise, which no method could see.");
  }

  function planView() {
    var p = plan(), f = p.f, lab = D.fc.future.map(function (r) { return ms(r.m); });
    var cheaper = p.level.total < p.chase.total ? "Level" : "Chase";
    var rows = f.map(function (d, i) { return [ml(D.fc.future[i].m), cases(d), cases(p.chase.P[i]), cases(p.level.P[i]), cases(p.level.I[i])]; });
    rows.push([{ h: "<strong>Total</strong>" }, { h: "<strong>" + cases(p.sumD) + "</strong>" }, { h: "<strong>" + cases(p.chase.sumP) + "</strong>" }, { h: "<strong>" + cases(p.level.sumP) + "</strong>" }, { h: "<strong>" + cases(p.level.sumI) + "</strong>" }]);
    var costRows = [["Production", cases(p.chase.cProd), cases(p.level.cProd)], ["Rate changes", cases(p.chase.cChg), cases(p.level.cChg)], ["Holding", cases(p.chase.cHold), cases(p.level.cHold)], [{ h: "<strong>Total</strong>" }, { h: "<strong>" + cases(p.chase.total) + "</strong>" }, { h: "<strong>" + cases(p.level.total) + "</strong>" }]];
    var inputs = '<div class="inputs">' + [["cp", "Production, per case"], ["h", "Holding, per case per month"], ["up", "Rate increase, per case"], ["dn", "Rate decrease, per case"]].map(function (r) {
      return '<label>' + esc(r[1]) + '<input type="number" min="0" step="0.5" id="r-' + r[0] + '" data-rate="' + r[0] + '" value="' + R[r[0]] + '"></label>'; }).join("") + "</div>";
    var I1 = p.level.I[1], I0 = p.level.I[0], d1 = f[1];
    var fx1 = fxCard("Formula: inventory balance",
      [V("I") + "<sub>t</sub> = " + V("I") + "<sub>t&minus;1</sub> + " + V("P") + "<sub>t</sub> &minus; " + V("D") + "<sub>t</sub>",
       "Level: " + V("P") + " = max<sub>t</sub> &lceil;" + SUM("k&le;t") + V("D") + "<sub>k</sub> / " + V("t") + "&rceil;, &nbsp; Chase: " + V("P") + "<sub>t</sub> = " + V("D") + "<sub>t</sub>"],
      [[V("I") + "<sub>t</sub>", "Cases on hand at the end of month t, start at 0"], [V("P") + "<sub>t</sub>", "Cases produced in month t"], [V("D") + "<sub>t</sub>", "Forecast cases for month t"]],
      "Level plan, " + ml(D.fc.future[1].m) + ":" + '<div class="fx">' + V("I") + "<sub>2</sub> = " + cases(I0) + " + " + cases(p.L) + " &minus; " + cases(d1) + " = " + cases(I1) + "</div>");
    var c0 = p.P0 - f[0];
    var fx2 = fxCard("Formula: plan cost",
      ["Cost = " + SUM("t") + "[ " + V("c") + "<sub>p</sub>" + V("P") + "<sub>t</sub> + " + V("c") + "<sub>u</sub>" + V("U") + "<sub>t</sub> + " + V("c") + "<sub>d</sub>" + V("W") + "<sub>t</sub> + " + V("h") + V("I") + "<sub>t</sub> ]",
       V("U") + "<sub>t</sub> = max(" + V("P") + "<sub>t</sub> &minus; " + V("P") + "<sub>t&minus;1</sub>, 0), &nbsp; " + V("W") + "<sub>t</sub> = max(" + V("P") + "<sub>t&minus;1</sub> &minus; " + V("P") + "<sub>t</sub>, 0)"],
      [[V("c") + "<sub>p</sub>", "Production rate, " + R.cp + " per case"], [V("c") + "<sub>u</sub>, " + V("c") + "<sub>d</sub>", "Cost to raise or cut output, " + R.up + " and " + R.dn + " per case, the hiring and layoff proxy"],
       [V("h"), "Holding rate, " + R.h + " per case per month"], [V("P") + "<sub>0</sub>", "Aug 2006 orders, " + cases(p.P0) + ", taken as last output"]],
      "Chase plan, " + ml(D.fc.future[0].m) + ", output falls from " + cases(p.P0) + " to " + cases(f[0]) + ":" + '<div class="fx">' + V("c") + "<sub>d</sub>" + V("W") + "<sub>1</sub> = " + R.dn + " &middot; " + cases(c0) + " = " + cases(R.dn * c0) + "</div>");
    return '<h1 class="v-title">Aggregate plan, 12 months</h1><p class="v-sub">Forecast Sep 2006 to Aug 2007, all SKUs in cases. Cost rates are assumed, in cost units, and you can change them.</p>' +
      card("Assumed cost rates", inputs, "Not from the case. Start inventory 0, no backorders.") +
      tiles([
        { title: "Forecast", sub: "Next 12 months", val: big(p.sumD), foot: "Cases" },
        { title: "Level output", sub: "Cases per month", val: big(p.L), tone: "info", foot: "Lowest rate with no shortage" },
        { title: "Chase cost", sub: "Cost units", val: big(p.chase.total), tone: cheaper === "Chase" ? "pos" : "" },
        { title: "Level cost", sub: "Cost units", val: big(p.level.total), tone: cheaper === "Level" ? "pos" : "" }
      ]) +
      '<div class="grid wide">' + card("Forecast, level output and stock", lineChart([{ c: PAL[2], v: p.level.I, bars: 1 }, { c: PAL[0], v: f, dots: 1 }, { c: PAL[1], v: p.level.P, dash: "5 4" }], lab, { every: 2, last: 1, aria: "Forecast, level output and level plan inventory" }) +
        legend([{ c: PAL[0], n: "Forecast = chase output", line: 1 }, { c: PAL[1], n: "Level output", line: 1 }, { c: PAL[2], n: "Level stock" }])) +
      card("Cost by plan", table(["Cost", "Chase", "Level"], costRows, [1, 2])) + "</div>" +
      '<div class="grid two">' + fx1 + fx2 + "</div>" +
      card("Month by month", table(["Month", "Forecast", "Chase output", "Level output", "Level stock"], rows, [1, 2, 3, 4])) +
      comment("At these rates the " + cheaper.toLowerCase() + " plan costs less, " + cases(Math.min(p.level.total, p.chase.total)) + " against " + cases(Math.max(p.level.total, p.chase.total)) + " cost units. Level output of " + cases(p.L) + " cases a month builds stock to a peak of " + cases(Math.max.apply(null, p.level.I)) + " before the summer peak. " +
        (p.hStar != null && p.hStar > 0 ? "Level stays cheaper while holding costs less than " + p.hStar.toFixed(2) + " per case per month." : "Change the rates to see where the choice flips."));
  }

  function summary() {
    var p = plan(), fc = D.fc, ch = fc.methods.filter(function (m) { return m.id === fc.chosen; })[0], last = D.total.length - 1, py6 = sumPY(D.total, last);
    var cheaper = p.level.total < p.chase.total ? "Level" : "Chase";
    var pk = 0; p.f.forEach(function (v, i) { if (v > p.f[pk]) pk = i; }); var lo = 0; p.f.forEach(function (v, i) { if (v < p.f[lo]) lo = i; });
    var rows = [
      ["Demand review", "Forecast, next 12 months", cases(p.sumD) + " cases", (p.sumD >= py6 ? "+" : "") + pct(p.sumD / py6 - 1) + " on the last 12 months"],
      ["Demand review", "Error band", "plus or minus " + pct(ch.test.wape), "Test year WAPE"],
      ["Demand review", "Peak and low month", ml(fc.future[pk].m) + ", " + ml(fc.future[lo].m), cases(p.f[pk]) + " and " + cases(p.f[lo]) + " cases"],
      ["Supply review", "Level output", cases(p.L) + " a month", "Stock peaks at " + cases(Math.max.apply(null, p.level.I))],
      ["Supply review", "Chase swing", cases(p.f[pk] - p.f[lo]) + " cases", "Peak month less low month"],
      ["Finance review", "Cheaper plan", cheaper, cases(Math.abs(p.level.total - p.chase.total)) + " cost units saved at assumed rates"],
      ["Executive", "Promotion calendar", "Jan, Feb, Mar", "No promotion term in this forecast"]
    ].map(function (r) { return [r[0], r[1], { h: "<strong>" + esc(r[2]) + "</strong>" }, r[3]]; });
    return '<h1 class="v-title">S&amp;OP summary</h1><p class="v-sub">One page for the monthly meeting.</p>' +
      tiles([
        { title: "Demand plan", sub: "Next 12 months", val: big(p.sumD), tone: "info", foot: "Cases", go: "forecast" },
        { title: "Forecast error", sub: "Test year WAPE", val: pct(ch.test.wape), foot: "Chosen method", go: "forecast" },
        { title: "Supply plan", sub: "Cheaper at assumed rates", val: cheaper, tone: "pos", go: "plan" },
        { title: "Break even holding", sub: "Per case per month", val: p.hStar != null && p.hStar > 0 ? p.hStar.toFixed(2) : "n/a", foot: "Level wins below this", go: "plan" }
      ]) +
      card("Decisions and numbers", table(["Step", "Item", "Number", "Note"], rows, [])) +
      comment("Plan for " + big(p.sumD) + " cases over the next 12 months, with a band of about " + pct(ch.test.wape) + ". The " + cheaper.toLowerCase() + " plan is cheaper at the assumed rates, so the real holding and change costs decide it. Add the January to March promotions and any customer changes before the plan is signed off.");
  }

  function about() {
    return '<div class="about"><h1 class="v-title">About the data</h1><div class="grid two">' +
      card("Source", '<ul class="plain"><li>Cups4U case and data, MIT OpenCourseWare, ESD.260J Logistics Systems, Fall 2006, Caplice and Sheffi.</li><li>' + num(D.nRows) + " rows: month, SKU, channel, customer, cases. Aug 1996 to Aug 2006.</li><li>Licence: CC BY-NC-SA 4.0. Learning project on public data.</li></ul>") +
      card("Method", '<ul class="plain"><li>Planning years run September to August.</li><li>Fit up to Aug 2004, pick the method on Sep 2004 to Aug 2005, test on Sep 2005 to Aug 2006.</li><li>The 12 month plan refits on all data.</li><li>Cost rates are assumptions, not case figures.</li></ul>') + "</div>" +
      comment("All figures come from the case file. Lids, the extra large cup and SKU level forecasts from the original assignment are not covered here.") + "</div>";
  }

  var RENDER = { history: history, forecast: forecastView, plan: planView, summary: summary, about: about };
  fetch("data/sop.json").then(function (r) { return r.json(); }).then(function (d) {
    D = d;
    router(["history", "forecast", "plan", "summary", "about"], RENDER);
    $("#view").addEventListener("change", function (e) {
      var t = e.target.closest("[data-rate]"); if (!t) return;
      var v = parseFloat(t.value); if (!(v >= 0)) { t.value = R[t.dataset.rate]; return; }
      R[t.dataset.rate] = v; var id = t.id; window.dispatchEvent(new HashChangeEvent("hashchange")); var n = document.getElementById(id); if (n) n.focus();
    });
  }).catch(function () { $("#view").innerHTML = '<p class="loading">Could not load the data. Please reload the page.</p>'; });
})();
