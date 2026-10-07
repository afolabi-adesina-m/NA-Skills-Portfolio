/* Management Reporting, Anaplan view: hash routing, grid modules, hand rolled SVG. No dependencies. */
(function () {
  "use strict";
  var D = null, VIEWS = ["variance", "trend", "lapses", "commentary", "about"];
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var num = function (v, d) { return Number(v).toLocaleString("en-CA", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); };
  var M = function (v) { return num(v / 1e6, 1); }, B = function (v) { return num(v / 1e9, 1); };
  var bil = function (v) { return "C$" + (v / 1e9).toFixed(1) + "B"; };
  var pc = function (v, d) { return (v * 100).toFixed(d == null ? 1 : d) + "%"; };
  var tone = function (r) { return r < 0.05 ? "good" : r < 0.15 ? "warn" : "bad"; };
  var LEG = '<div class="legend"><span><i style="background:#E3F4E8"></i>Lapse under 5%</span><span><i style="background:#FFF4D6"></i>5% to 15%</span><span><i style="background:#FDE4E2"></i>15% or more</span></div>';
  function mod(title, note, body) { return '<section class="module"><div class="mod-head"><h2>' + esc(title) + "</h2>" + (note ? "<span>" + esc(note) + "</span>" : "") + '</div><div class="mod-body">' + body + "</div></section>"; }
  function yearSel(fy, view) { return '<label>Fiscal year <select data-fy="' + view + '">' + D.years.slice().reverse().map(function (y) { return '<option value="' + y + '"' + (y === fy ? " selected" : "") + ">" + y + "</option>"; }).join("") + "</select></label>"; }
  function kpis(t) { var l = t.auth - t.exp; return '<div class="kpis">' + [["Authorities", bil(t.auth), "Voted budget"], ["Actual", bil(t.exp), "Spent"], ["Lapse", bil(l), "Authorities less actual"], ["Lapse %", pc(l / t.auth), num(t.nOrg) + " organizations"]].map(function (k) { return '<div class="kpi"><span>' + k[0] + "</span><strong>" + k[1] + "</strong><em>" + esc(k[2]) + "</em></div>"; }).join("") + "</div>"; }
  function trendOf(fy) { return D.trend.filter(function (t) { return t.fy === fy; })[0]; }
  function parse() { var p = location.hash.replace(/^#\/?/, "").split("?"), q = new URLSearchParams(p[1] || ""); var fy = q.get("fy"); return { view: VIEWS.indexOf(p[0]) >= 0 ? p[0] : "variance", fy: D.years.indexOf(fy) >= 0 ? fy : D.years[D.years.length - 1], sort: q.get("sort") || "auth" }; }

  function variance(s) {
    var rows = D.orgs[s.fy].map(function (r) { return { n: r[0], a: r[1], e: r[2], l: r[1] - r[2], p: r[1] ? (r[1] - r[2]) / r[1] : 0 }; });
    var key = { auth: "a", exp: "e", lapse: "l", pct: "p" }[s.sort] || "a";
    var top = rows.slice(0, 25), rest = rows.slice(25);
    top.sort(function (x, y) { return y[key] - x[key]; });
    var sum = function (l, k) { return l.reduce(function (a, r) { return a + r[k]; }, 0); };
    var t = trendOf(s.fy);
    function th(k, label) { return '<th scope="col"><button type="button" class="sort" data-sort="' + k + '"' + (s.sort === k ? ' aria-sort="descending"' : "") + ">" + label + (s.sort === k ? " &#9660;" : "") + "</button></th>"; }
    function tr(name, a, e, cls) { var l = a - e, p = a ? l / a : 0; return '<tr class="' + (cls || "") + '"><th scope="row" title="' + esc(name) + '">' + esc(name) + "</th><td>" + M(a) + "</td><td>" + M(e) + "</td><td>" + M(l) + '</td><td class="' + (cls === "tot" ? "" : tone(p)) + '">' + pc(p) + "</td></tr>"; }
    var body = top.map(function (r) { return tr(r.n, r.a, r.e); }).join("") + tr("All other " + rest.length + " organizations", sum(rest, "a"), sum(rest, "e"), "sub") + tr("Total voted", t.auth, t.exp, "tot");
    var grid = '<div class="grid-wrap"><table class="g"><thead><tr><th scope="col">Department</th>' + th("auth", "Authorities") + th("exp", "Actual") + th("lapse", "Lapse") + th("pct", "Lapse %") + "</tr></thead><tbody>" + body + "</tbody></table></div>" + LEG;
    return '<div class="ctx"><h1>Variance by department</h1>' + yearSel(s.fy, "variance") + "</div>" + kpis(t) +
      mod("Budget against actual, voted", "C$ millions, top 25 by authorities. Click a column to sort.", grid);
  }
  function lineSvg(series, labels, fmt, H) {
    var W = 640; H = H || 220; var pl = 46, pr = 10, pt = 10, pb = 24, n = labels.length;
    var mx = Math.max.apply(null, series.map(function (s) { return Math.max.apply(null, s.v); })), st = [1, 2, 2.5, 5, 10, 20, 25, 50, 100].filter(function (k) { return mx / k <= 5; })[0] || 100, max = Math.ceil(mx / st) * st;
    var hb = series.some(function (z) { return z.bars; }), X = function (i) { return hb ? pl + (W - pl - pr) * (i + 0.5) / n : pl + (W - pl - pr) * i / (n - 1); }, Y = function (v) { return pt + (H - pt - pb) * (1 - v / max); }, s = "";
    var fr = []; for (var q = 0; q <= max + 1e-9; q += st) fr.push(q / max); fr.forEach(function (f) { s += '<line class="axis" x1="' + pl + '" x2="' + (W - pr) + '" y1="' + Y(max * f) + '" y2="' + Y(max * f) + '"/><text x="' + (pl - 6) + '" y="' + (Y(max * f) + 4) + '" text-anchor="end">' + fmt(max * f) + "</text>"; });
    labels.forEach(function (l, i) { if ((n - 1 - i) % 2 === 0) s += '<text x="' + X(i) + '" y="' + (H - 6) + '" text-anchor="' + (hb ? "middle" : i === n - 1 ? "end" : i === 0 ? "start" : "middle") + '">' + esc(l) + "</text>"; });
    series.forEach(function (se) {
      if (se.bars) { var bw = (W - pl - pr) / n * .6; se.v.forEach(function (v, i) { s += '<rect x="' + (X(i) - bw / 2) + '" y="' + Y(v) + '" width="' + bw + '" height="' + (H - pb - Y(v)) + '" fill="' + se.c[i] + '"><title>' + esc(labels[i] + ": " + fmt(v)) + "</title></rect>"; }); return; }
      s += '<path d="' + se.v.map(function (v, i) { return (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(v).toFixed(1); }).join("") + '" fill="none" stroke="' + se.c + '" stroke-width="2.2"/>';
      se.v.forEach(function (v, i) { s += '<circle cx="' + X(i) + '" cy="' + Y(v) + '" r="2.8" fill="' + se.c + '"><title>' + esc(labels[i] + ": " + fmt(v)) + "</title></circle>"; });
    });
    return '<svg class="chart" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Trend chart">' + s + "</svg>";
  }
  function trend() {
    var T = D.trend, labs = T.map(function (t) { return t.fy.slice(2); });
    var row = function (name, f, cls, colour) { return '<tr class="' + (cls || "") + '"><th scope="row">' + esc(name) + "</th>" + T.map(function (t) { var v = f(t); return '<td class="' + (colour ? tone(v) : "") + '">' + (colour ? pc(v) : B(v)) + "</td>"; }).join("") + "</tr>"; };
    var grid = '<div class="grid-wrap"><table class="g compact"><thead><tr><th scope="col">C$ billions</th>' + T.map(function (t) { return "<th scope=\"col\">" + t.fy.slice(2) + "</th>"; }).join("") + "</tr></thead><tbody>" +
      row("Voted authorities", function (t) { return t.auth; }) + row("Voted actual", function (t) { return t.exp; }) + row("Lapse", function (t) { return t.auth - t.exp; }, "tot") +
      row("Lapse %", function (t) { return (t.auth - t.exp) / t.auth; }, "", true) + row("Statutory authorities", function (t) { return t.sAuth; }, "sub") + row("Statutory actual", function (t) { return t.sExp; }, "sub") + "</tbody></table></div>" + LEG;
    var l = T.map(function (t) { return (t.auth - t.exp) / t.auth * 100; });
    var col = { good: "#7CC593", warn: "#E9B949", bad: "#D9534F" };
    return '<div class="ctx"><h1>Trend, ' + T[0].fy + " to " + T[T.length - 1].fy + "</h1></div>" +
      mod("Voted and statutory, by year", "Time runs across the columns.", grid) +
      '<div class="two">' + mod("Authorities and actual, voted", "C$ billions", lineSvg([{ c: "#1F6FD1", v: T.map(function (t) { return t.auth / 1e9; }) }, { c: "#14213D", v: T.map(function (t) { return t.exp / 1e9; }) }], labs, function (v) { return num(v); }) +
        '<div class="legend"><span><i style="background:#1F6FD1"></i>Authorities</span><span><i style="background:#14213D"></i>Actual</span></div>') +
      mod("Lapse %, voted", "Share of authorities not spent", lineSvg([{ bars: 1, v: l, c: l.map(function (v) { return col[tone(v / 100)]; }) }], labs, function (v) { return num(v, 0) + "%"; })) + "</div>";
  }
  function lapses(s) {
    var rows = D.topVotes[s.fy].map(function (r) { var l = r[3] - r[4], p = r[3] ? l / r[3] : 0; return '<tr><th scope="row" title="' + esc(r[0]) + '">' + esc(r[0]) + "</th><td>" + esc(r[1]) + '</td><td style="text-align:left">' + esc(r[2]) + "</td><td>" + M(r[3]) + "</td><td>" + M(r[4]) + "</td><td>" + M(l) + '</td><td class="' + tone(p) + '">' + pc(p) + "</td></tr>"; }).join("");
    var t = trendOf(s.fy), tot = D.topVotes[s.fy].reduce(function (a, r) { return a + r[3] - r[4]; }, 0);
    return '<div class="ctx"><h1>Top lapses</h1>' + yearSel(s.fy, "lapses") + "</div>" +
      mod("10 largest lapses by vote, " + s.fy, "C$ millions. These 10 hold " + pc(tot / (t.auth - t.exp)) + " of all voted lapse.",
        '<div class="grid-wrap"><table class="g"><thead><tr><th scope="col">Department</th><th scope="col">Vote</th><th scope="col" style="text-align:left">Type</th><th scope="col">Authorities</th><th scope="col">Actual</th><th scope="col">Lapse</th><th scope="col">Lapse %</th></tr></thead><tbody>' + rows + "</tbody></table></div>" + LEG);
  }
  function commentary() {
    var T = D.trend, L = T[T.length - 1], P = T[T.length - 2], fy = L.fy, lp = function (t) { return (t.auth - t.exp) / t.auth; };
    var peak = T.reduce(function (a, t) { return lp(t) > lp(a) ? t : a; }, T[0]), low = T.reduce(function (a, t) { return lp(t) < lp(a) ? t : a; }, T[0]);
    var orgs = D.orgs[fy].map(function (r) { return { n: r[0], a: r[1], l: r[1] - r[2] }; });
    var bigL = orgs.reduce(function (a, r) { return r.l > a.l ? r : a; }, orgs[0]);
    var large = orgs.filter(function (r) { return r.a >= 1e9; }), hi = large.reduce(function (a, r) { return r.l / r.a > a.l / a.a ? r : a; }, large[0]), lo = large.reduce(function (a, r) { return r.l / r.a < a.l / a.a ? r : a; }, large[0]);
    var tb = D.topVotes[fy].filter(function (r) { return r[2] === "Treasury Board Central"; }), tbL = tb.reduce(function (a, r) { return a + r[3] - r[4]; }, 0);
    var pre = T.filter(function (t) { return t.fy < "2020-21"; }), preAvg = pre.reduce(function (a, t) { return a + lp(t); }, 0) / pre.length;
    var items = [
      "In " + fy + ", departments spent " + bil(L.exp) + " of " + bil(L.auth) + " in voted authorities. The lapse was " + bil(L.auth - L.exp) + ", or " + pc(lp(L)) + ".",
      "That lapse rate is down from " + pc(lp(P)) + " in " + P.fy + ". Before 2020-21 it averaged " + pc(preAvg) + ".",
      "The peak was " + pc(lp(peak)) + " in " + peak.fy + ", and the low was " + pc(lp(low)) + " in " + low.fy + ".",
      bigL.n + " had the largest lapse in " + fy + ", " + bil(bigL.l) + " or " + pc(bigL.l / bigL.a) + " of its authorities.",
      "Among the " + large.length + " organizations with at least C$1B in authorities, lapse ranged from " + pc(lo.l / lo.a) + " at " + lo.n + " to " + pc(hi.l / hi.a) + " at " + hi.n + ".",
      tb.length ? "Treasury Board central votes left " + bil(tbL) + " unused. These hold funds for transfer to departments, so this is not a department underspend." : "No Treasury Board central vote is in the top 10 lapses this year.",
      "Lapse here is authorities less actual. Part of it may carry forward to the next year, so it is not all lost budget."
    ];
    return '<div class="ctx"><h1>Commentary, ' + fy + "</h1></div>" + mod("What the numbers show", "Every figure is computed from the grid data.", '<ol class="comment-list">' + items.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ol>");
  }
  function about() {
    return '<div class="ctx"><h1>About the data</h1></div><div class="two">' +
      mod("Source", "", '<ul class="plain"><li>Public Accounts of Canada, Authorities and Expenditures by Vote, published in GC InfoBase by the Treasury Board of Canada Secretariat.</li><li>' + num(D.rows) + " rows, fiscal years " + D.years[0] + " to " + D.years[D.years.length - 1] + ".</li><li>Open Government Licence, Canada. Learning project on public data.</li></ul>") +
      mod("Definitions", "", '<ul class="plain"><li>Authorities: the voted budget approved by Parliament, after supplementary estimates and transfers.</li><li>Actual: amount spent in the year.</li><li>Lapse: authorities less actual.</li><li>Statutory items are set by other laws, so they are shown apart.</li></ul>') + "</div>";
  }
  var RENDER = { variance: variance, trend: trend, lapses: lapses, commentary: commentary, about: about };
  function render() {
    var s = parse(), v = $("#view");
    v.innerHTML = RENDER[s.view](s); v.classList.remove("view-in"); void v.offsetWidth; v.classList.add("view-in");
    document.querySelectorAll(".pages a").forEach(function (a) { if (a.dataset.view === s.view) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
  }
  fetch("data/mgmt.json").then(function (r) { return r.json(); }).then(function (d) {
    D = d; window.addEventListener("hashchange", render); render();
    $("#view").addEventListener("change", function (e) { var t = e.target.closest("[data-fy]"); if (t) location.hash = "#/" + t.dataset.fy + "?fy=" + t.value; });
    $("#view").addEventListener("click", function (e) { var b = e.target.closest("[data-sort]"); if (b) { var s = parse(); location.hash = "#/variance?fy=" + s.fy + "&sort=" + b.dataset.sort; } });
  }).catch(function () { $("#view").innerHTML = "<p>Could not load the data. Please reload the page.</p>"; });
})();
