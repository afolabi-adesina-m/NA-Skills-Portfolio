/* Heart Risk app: hash routing, logistic regression in the browser, hand-rolled SVG charts. No dependencies. */
var HeartModel = (function () {
  "use strict";
  function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }
  function logit(m, v) {
    var s = m.intercept;
    for (var i = 0; i < m.features.length; i++) s += m.coef[i] * (v[m.features[i]] - m.scaler_mean[i]) / m.scaler_scale[i];
    return s;
  }
  /* p: {age, male, sbp, bp_meds, tchol, hdl, smoker, diabetes, bmi}, cholesterol in mg/dL */
  function nhanes(m, p) { return sigmoid(logit(m, p)); }
  function framingham(m, fill, p) {
    var v = {};
    m.features.forEach(function (f, i) { v[f] = m.impute_median[i]; });
    v.male = p.male; v.age = p.age; v.currentSmoker = p.smoker; v.cigsPerDay = p.smoker ? fill.cigsPerDay_if_smoker : 0;
    v.BPMeds = p.bp_meds; v.diabetes = p.diabetes; v.totChol = p.tchol; v.sysBP = p.sbp; v.BMI = p.bmi;
    return sigmoid(logit(m, v));
  }
  /* Change in risk if one input were at the data average (training mean), largest first */
  function drivers(m, p) {
    var base = nhanes(m, p);
    return m.features.map(function (f, i) {
      var q = {}; for (var k in p) q[k] = p[k];
      q[f] = m.scaler_mean[i];
      return { f: f, delta: base - nhanes(m, q) };
    }).sort(function (a, b) { return Math.abs(b.delta) - Math.abs(a.delta); });
  }
  return { nhanes: nhanes, framingham: framingham, drivers: drivers };
})();
if (typeof module !== "undefined") module.exports = HeartModel;

(function () {
  "use strict";
  if (typeof document === "undefined") return;
  var VIEWS = ["calculator", "compare", "canada", "about"];
  var state = { view: "calculator", unit: "mg", fram: false,
    p: { age: 55, male: 0, smoker: 0, sbp: 125, bp_meds: 0, diabetes: 0, tchol: 200, hdl: 50, bmi: 27 } };
  var NH, FR, CC, EX;
  var MMOL = 38.67;
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var num = function (v) { return Number(v).toLocaleString("en-CA"); };
  function rpct(p) { var v = p * 100; return v < 0.1 ? "under 0.1%" : v < 10 ? v.toFixed(1) + "%" : v.toFixed(0) + "%"; }
  function load(path) { return fetch("data/" + path).then(function (r) { if (!r.ok) throw new Error(path); return r.json(); }); }

  var NAMES = { age: "Age", male: "Sex", sbp: "Systolic blood pressure", bp_meds: "Blood pressure medicine", tchol: "Total cholesterol", hdl: "HDL cholesterol", smoker: "Smoking", diabetes: "Diabetes", bmi: "BMI" };

  /* ---------- small UI builders (same as the spend app) ---------- */
  function comment(t) { return '<section class="card comment"><h2>What the numbers show</h2><p>' + esc(t) + "</p></section>"; }
  function tile(t) {
    return '<div class="tile"><span class="tile-title">' + esc(t.title) + '</span><span class="tile-sub">' + esc(t.sub || "") + "</span>" +
      '<span class="tile-val ' + (t.tone || "") + '">' + esc(t.val) + '</span><span class="tile-foot">' + esc(t.foot || "") + "</span></div>";
  }
  function bars(rows) {
    var max = Math.max.apply(null, rows.map(function (r) { return Math.abs(r.v); })) || 1;
    return '<ul class="bars">' + rows.map(function (r) {
      return '<li><div class="bar-row"' + (r.title ? ' title="' + esc(r.title) + '"' : "") + '><span class="bar-name">' + esc(r.name) + '</span><span class="bar-val">' + esc(r.label) + "</span>" +
        '<span class="bar-track"><span class="bar-fill ' + (r.tone || "") + '" style="width:' + Math.max(0.6, Math.abs(r.v) / max * 100).toFixed(2) + '%"></span></span></div></li>';
    }).join("") + "</ul>";
  }
  function facts(list) { return '<div class="facts">' + list.map(function (f) { return '<div class="facet"><span>' + esc(f[0]) + "</span><strong>" + esc(f[1]) + "</strong></div>"; }).join("") + "</div>"; }
  function seg(id, opts, val) {
    return '<div class="seg" role="group" id="' + id + '">' + opts.map(function (o) { return '<button type="button" data-v="' + o[0] + '" aria-pressed="' + (String(o[0]) === String(val)) + '">' + esc(o[1]) + "</button>"; }).join("") + "</div>";
  }
  function calChart(cal, aria) {
    var W = 360, H = 260, pl = 46, pb = 40, pt = 12, pr = 12;
    var mx = Math.max.apply(null, cal.map(function (c) { return Math.max(c.mean_predicted, c.observed); }));
    var step = mx > 0.3 ? 0.1 : mx > 0.12 ? 0.05 : 0.02, top = Math.ceil(mx / step) * step;
    var X = function (v) { return pl + (W - pl - pr) * v / top; }, Y = function (v) { return pt + (H - pt - pb) * (1 - v / top); };
    var s = "";
    for (var t = 0; t <= top + 1e-9; t += step) {
      var lab = Math.round(t * 100) + "%";
      s += '<line class="axis" x1="' + pl + '" x2="' + (W - pr) + '" y1="' + Y(t) + '" y2="' + Y(t) + '"/><text x="' + (pl - 6) + '" y="' + (Y(t) + 4) + '" text-anchor="end">' + lab + "</text>";
      s += '<text x="' + X(t) + '" y="' + (H - pb + 16) + '" text-anchor="middle">' + lab + "</text>";
    }
    s += '<line x1="' + X(0) + '" y1="' + Y(0) + '" x2="' + X(top) + '" y2="' + Y(top) + '" stroke="#A9B4BE" stroke-width="2" stroke-dasharray="5 4"/>';
    cal.forEach(function (c) {
      s += '<circle cx="' + X(c.mean_predicted).toFixed(1) + '" cy="' + Y(c.observed).toFixed(1) + '" r="5" fill="#0070F2"><title>Predicted ' + (c.mean_predicted * 100).toFixed(2) + "%, observed " + (c.observed * 100).toFixed(2) + "%, " + c.n + " people</title></circle>";
    });
    s += '<text x="' + ((pl + W - pr) / 2) + '" y="' + (H - 4) + '" text-anchor="middle">Predicted risk</text>';
    s += '<text transform="rotate(-90)" x="' + (-(pt + H - pb) / 2) + '" y="11" text-anchor="middle">Observed rate</text>';
    return '<svg class="chart" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(aria) + '">' + s + "</svg>" +
      '<p class="legend"><span><i></i>Tenth of test set</span><span><i class="line"></i>Perfect calibration</span></p>';
  }

  /* ---------- calculator ---------- */
  function band(age) { return EX.nhanes_age_bands.filter(function (b) { var r = b.band.split(" to "); return age >= +r[0] && age <= +r[1]; })[0]; }
  function chol(v) { return state.unit === "mg" ? Math.round(v) : (v / MMOL).toFixed(1); }
  function numField(id, label, val, hint, step) {
    return '<div class="field"><label for="' + id + '">' + esc(label) + '</label><input type="number" inputmode="decimal" id="' + id + '" data-k="' + id.slice(2) + '" value="' + val + '" step="' + (step || 1) + '" /><span class="hint" id="h-' + id.slice(2) + '">' + esc(hint || "") + "</span></div>";
  }
  function segField(k, label, opts) { return '<div class="field"><span class="fb-label">' + esc(label) + "</span>" + seg("s-" + k, opts, state.p[k]) + '<span class="hint"></span></div>'; }
  function calculator() {
    var p = state.p, cu = state.unit === "mg" ? "mg/dL" : "mmol/L", cs = state.unit === "mg" ? 1 : 0.1;
    var form = '<section class="card"><h2>Your details</h2><div class="form" id="form">' +
      numField("f-age", "Age (40 to 79)", p.age) +
      segField("male", "Sex", [[0, "Female"], [1, "Male"]]) +
      numField("f-sbp", "Systolic BP (mmHg)", p.sbp) +
      segField("bp_meds", "BP medicine", [[0, "No"], [1, "Yes"]]) +
      numField("f-tchol", "Cholesterol (" + cu + ")", chol(p.tchol), "", cs) +
      numField("f-hdl", "HDL (" + cu + ")", chol(p.hdl), "", cs) +
      segField("smoker", "Smoke now", [[0, "No"], [1, "Yes"]]) +
      segField("diabetes", "Diabetes", [[0, "No"], [1, "Yes"]]) +
      numField("f-bmi", "BMI", p.bmi, "", 0.1) +
      '<div class="form-foot"><div class="field"><span class="fb-label">Cholesterol units</span>' + seg("s-unit", [["mg", "mg/dL"], ["mmol", "mmol/L"]], state.unit) + "</div>" +
      '<div class="field"><span class="fb-label">Also run Framingham</span>' + seg("s-fram", [["0", "Off"], ["1", "On"]], state.fram ? "1" : "0") + "</div></div>" +
      "</div></section>";
    return '<h1 class="v-title">Risk calculator</h1><div class="tiles" id="calc-tiles"></div>' +
      '<div class="grid two">' + form + '<section class="card"><h2>What moves your estimate</h2><div id="calc-drivers"></div>' +
      '<p class="note">Change in risk if that one input were the data average. Not medical advice.</p></section></div>' +
      '<div id="calc-comment"></div>';
  }
  function readForm() {
    var ok = true, R = EX.nhanes_ranges_p1_p99;
    ["age", "sbp", "tchol", "hdl", "bmi"].forEach(function (k) {
      var el = $("#f-" + k), h = $("#h-" + k), v = parseFloat(el.value), bad = !isFinite(v) || v <= 0;
      if (!bad && (k === "tchol" || k === "hdl")) { if (el.value === String(chol(state.p[k]))) v = state.p[k]; else if (state.unit === "mmol") v = v * MMOL; }
      if (k === "age" && !bad && (v < 40 || v > 79)) bad = true;
      el.setAttribute("aria-invalid", bad); h.className = "hint";
      if (bad) { ok = false; h.textContent = k === "age" ? "Enter an age from 40 to 79" : "Enter a number"; h.className = "hint warn"; return; }
      state.p[k] = v;
      if (R[k] && (v < R[k][0] || v > R[k][1])) { h.textContent = "Outside the usual range in the data"; h.className = "hint warn"; } else h.textContent = "";
    });
    return ok;
  }
  function updateCalc() {
    if (!$("#calc-tiles")) return;
    if (!readForm()) { $("#calc-tiles").innerHTML = tile({ title: "Your estimate", sub: "10 year heart disease death", val: "Check inputs", tone: "crit" }); $("#calc-drivers").innerHTML = ""; $("#calc-comment").innerHTML = ""; return; }
    var p = state.p, m = NH.model, r = HeartModel.nhanes(m, p), b = band(p.age), avg = b.observed_pct / 100, ratio = r / avg;
    var tiles = [
      { title: "Your estimate", sub: "10 year heart disease death", val: rpct(r), tone: "info", foot: "NHANES model" },
      { title: "Average at your age", sub: "Ages " + b.band + " in the data", val: (b.observed_pct).toFixed(1) + "%", foot: b.events + " deaths in " + num(b.n) + " people" },
      { title: "Against that average", sub: "Your estimate divided by it", val: ratio.toFixed(1) + " times", tone: ratio >= 1.5 ? "crit" : ratio <= 0.67 ? "pos" : "", foot: ratio >= 1 ? "Above the age group" : "Below the age group" }
    ];
    var fr = null;
    if (state.fram) {
      fr = HeartModel.framingham(FR.model, EX.framingham_fill, p);
      tiles.push({ title: "Framingham estimate", sub: "10 year CHD, a different target", val: rpct(fr), foot: p.age > 70 ? "Age above 70, outside that data" : "Overlapping inputs only" });
    } else tiles.push({ title: "Framingham estimate", sub: "10 year CHD, a different target", val: "Off", foot: "Turn it on under your details" });
    $("#calc-tiles").innerHTML = tiles.map(tile).join("");
    var d = HeartModel.drivers(m, p).slice(0, 4);
    $("#calc-drivers").innerHTML = bars(d.map(function (x) {
      var pts = x.delta * 100;
      return { name: NAMES[x.f] + ": " + label(x.f), v: pts, label: (pts >= 0 ? "adds " : "takes off ") + Math.abs(pts).toFixed(pts > -1 && pts < 1 ? 2 : 1) + " points", tone: pts >= 0 ? "crit" : "" };
    }));
    var top = d[0], tp = Math.abs(top.delta * 100);
    $("#calc-comment").innerHTML = comment("The estimate for these details is " + rpct(r) + ", against " + b.observed_pct.toFixed(1) + "% observed for people aged " + b.band + " in the data. " +
      NAMES[top.f] + " moves it most, " + (top.delta >= 0 ? "adding " : "taking off ") + tp.toFixed(tp < 1 ? 2 : 1) + " points compared with an average value. " +
      (fr != null ? "Framingham gives " + rpct(fr) + ", which is higher because it counts any coronary heart disease, not only deaths. " : "") +
      "The model ranks people well on test data (AUC " + NH.test.auc + ") but rests on " + NH.cohort_flow.events_10y_heart_death + " deaths, so read it as a rough guide.");
  }
  function label(f) {
    var p = state.p;
    if (f === "male") return p.male ? "male" : "female";
    if (f === "smoker" || f === "bp_meds" || f === "diabetes") return p[f] ? "yes" : "no";
    if (f === "tchol" || f === "hdl") return chol(p[f]) + (state.unit === "mg" ? " mg/dL" : " mmol/L");
    if (f === "sbp") return Math.round(p.sbp) + " mmHg";
    return String(Math.round(p[f] * 10) / 10);
  }

  /* ---------- compare ---------- */
  function compare() {
    var n = NH.test, f = FR.test;
    var tiles = [
      { title: "NHANES AUC", sub: "Test set", val: n.auc.toFixed(3), tone: "info", foot: n.events + " deaths in " + num(n.n) },
      { title: "Framingham AUC", sub: "Test set", val: f.auc.toFixed(3), foot: f.events + " cases in " + num(f.n) },
      { title: "NHANES Brier", sub: "Lower is better", val: n.brier.toFixed(4), foot: "Flat guess: " + n.brier_base_rate.toFixed(4) },
      { title: "Framingham Brier", sub: "Lower is better", val: f.brier.toFixed(4), foot: "Flat guess: " + f.brier_base_rate.toFixed(4) }
    ];
    return '<h1 class="v-title">Compare models</h1><div class="tiles">' + tiles.map(tile).join("") + "</div>" +
      '<div class="grid two"><section class="card"><h2>NHANES 1999 to 2008</h2>' +
      facts([["Predicts", "Heart disease death"], ["People", num(NH.cohort_flow.complete_cases)], ["Deaths", num(NH.cohort_flow.events_10y_heart_death)], ["Ages", "40 to 79"]]) +
      calChart(NH.calibration_deciles, "NHANES calibration: predicted against observed by tenth of the test set") + "</section>" +
      '<section class="card"><h2>Framingham (Kaggle file)</h2>' +
      facts([["Predicts", "Any CHD event"], ["People", num(f.n_total)], ["Cases", num(f.events_total)], ["Ages", "32 to 70"]]) +
      calChart(FR.calibration_deciles, "Framingham calibration: predicted against observed by tenth of the test set") + "</section></div>" +
      comment("Both models rank people better than chance, NHANES more so (AUC " + n.auc.toFixed(3) + " against " + f.auc.toFixed(3) + "). Both look 10 years ahead but answer different questions. NHANES predicts death from heart disease, which happened to " + (NH.cohort_flow.events_10y_heart_death / NH.cohort_flow.complete_cases * 100).toFixed(1) + "% of people, while Framingham predicts any coronary heart disease, which happened to " + (f.events_total / f.n_total * 100).toFixed(1) + "%, so its numbers run much higher. Both Brier scores beat a flat guess only slightly. In the NHANES chart the top tenth lines up closely (" + (NH.calibration_deciles[9].mean_predicted * 100).toFixed(2) + "% predicted, " + (NH.calibration_deciles[9].observed * 100).toFixed(2) + "% observed), but with " + n.events + " test deaths each point is noisy.");
  }

  /* ---------- canada ---------- */
  function canada() {
    var c = CC, by = function (k) { return c[k].slice().sort(function (a, b) { return b.prevalence_pct - a.prevalence_pct; }); };
    var row = function (g, small) { return { name: g.group, v: g.prevalence_pct, label: g.prevalence_pct.toFixed(1) + "%", title: num(g.n) + " respondents", tone: small && g.n < 500 ? "muted" : "" }; };
    var prov = by("by_province"), on = c.by_province.filter(function (g) { return g.group === "Ontario"; })[0];
    var age = c.by_age, sex = by("by_sex"), old = age[age.length - 1], young = age[0];
    var men = c.by_sex.filter(function (g) { return g.group === "Male"; })[0], women = c.by_sex.filter(function (g) { return g.group === "Female"; })[0];
    var former = c.by_smoking.filter(function (g) { return g.group === "Former"; })[0], a65 = EX.cchs_share_65_plus_by_smoking_pct;
    var tiles = [
      { title: "Canada, 35 and older", sub: "Weighted share", val: c.overall.prevalence_pct.toFixed(1) + "%", tone: "info", foot: num(c.overall.n) + " respondents" },
      { title: "Ontario", sub: "Weighted share", val: on.prevalence_pct.toFixed(1) + "%", foot: num(on.n) + " respondents" },
      { title: "Highest province", sub: prov[0].group, val: prov[0].prevalence_pct.toFixed(1) + "%", tone: "crit", foot: num(prov[0].n) + " respondents" },
      { title: "Aged 65 and older", sub: "Weighted share", val: old.prevalence_pct.toFixed(1) + "%", foot: young.prevalence_pct.toFixed(1) + "% at " + young.group }
    ];
    return '<h1 class="v-title">Canada view <span class="scope">CCHS 2022, self reported</span></h1>' +
      '<div class="tiles">' + tiles.map(tile).join("") + "</div>" +
      '<div class="grid two"><section class="card"><h2>By province</h2>' + bars(prov.map(function (g) { return row(g, true); })) +
      '<p class="note">Grey bars have fewer than 500 respondents.</p></section>' +
      '<section class="card"><h2>By age</h2>' + bars(age.map(function (g) { return row(g); })) + '<h2 style="margin-top:1.2rem">By sex</h2>' + bars(sex.map(function (g) { return row(g); })) + "</section></div>" +
      '<div class="grid two"><section class="card"><h2>By smoking</h2>' + bars(c.by_smoking.map(function (g) { return row(g); })) + "</section>" +
      '<section class="card"><h2>By BMI</h2>' + bars(by("by_bmi").map(function (g) { return row(g); })) + "</section></div>" +
      '<p class="note">Measure: has heart disease, ever had a heart attack, or lives with the effects of a stroke. Self reported, adults 35 and older, survey weights applied.</p>' +
      comment(c.overall.prevalence_pct.toFixed(1) + "% of Canadians aged 35 and older report heart disease, a heart attack or stroke effects, and Ontario sits at " + on.prevalence_pct.toFixed(1) + "%. The share climbs with age, from " + young.prevalence_pct.toFixed(1) + "% at " + young.group + " to " + old.prevalence_pct.toFixed(1) + "% at 65 and older, and men report it more than women (" + men.prevalence_pct.toFixed(1) + "% against " + women.prevalence_pct.toFixed(1) + "%). Former smokers show the highest rate, " + former.prevalence_pct.toFixed(1) + "%, but " + a65.Former.toFixed(1) + "% of them are 65 or older against " + a65.Current.toFixed(1) + "% of current smokers, so age explains part of that gap. This is a snapshot of who has the condition, not a risk estimate.");
  }

  /* ---------- model card ---------- */
  function about() {
    var src = [
      ["NHANES 1999 to 2008", "CDC, National Center for Health Statistics", "US public data", "https://wwwn.cdc.gov/nchs/nhanes/"],
      ["Linked mortality files, 2019 public use", "CDC, National Center for Health Statistics", "US public data", "https://www.cdc.gov/nchs/linked-data/mortality-files/index.html"],
      ["Framingham heart study dataset", "Kaggle upload by Ashish Bhardwaj, from the NHLBI Framingham Heart Study", "Unknown, learning only", "https://www.kaggle.com/datasets/aasheesh200/framingham-heart-study-dataset"],
      ["CCHS 2022 public use microdata", "Statistics Canada", "Statistics Canada Open Licence", "https://www150.statcan.gc.ca/n1/en/catalogue/82M0013X"]
    ];
    var f = NH.cohort_flow;
    return '<div class="about"><h1 class="v-title">Model card</h1>' +
      '<section class="card"><h2>Sources</h2><div class="table-wrap"><table><thead><tr><th>Data</th><th class="hide-sm">Publisher</th><th>Licence</th></tr></thead><tbody>' +
      src.map(function (s) { return '<tr><td><a href="' + s[3] + '" target="_blank" rel="noopener">' + esc(s[0]) + '</a></td><td class="hide-sm">' + esc(s[1]) + "</td><td>" + esc(s[2]) + "</td></tr>"; }).join("") + "</tbody></table></div></section>" +
      '<div class="grid two"><section class="card"><h2>Method</h2><ul class="plain">' +
      "<li>Adults aged 40 to 79 from five NHANES cycles, with no heart disease or stroke reported at the exam.</li>" +
      "<li>Outcome: death from heart disease within 10 years of the exam.</li>" +
      "<li>Logistic regression on " + NH.model.features.length + " inputs. 75% of people to train, 25% to test.</li>" +
      "<li>" + num(f.complete_cases) + " people and " + num(f.events_10y_heart_death) + " deaths after removing rows with missing values.</li>" +
      "<li>The model runs in your browser from a small JSON file. Nothing you type leaves the page.</li></ul></section>" +
      '<section class="card"><h2>Limits</h2><ul class="plain">' +
      "<li>NCHS replaced follow up time or cause of death with synthetic values for some public records.</li>" +
      "<li>Only " + NH.test.events + " deaths in the test set, so results are noisy.</li>" +
      "<li>Survey weights were not used in the NHANES model.</li>" +
      "<li>Past heart disease, smoking and diabetes are partly self reported.</li>" +
      "<li>Deaths from other causes count as no event.</li>" +
      "<li>Framingham is a Kaggle file with an unknown license, used for learning only.</li></ul></section></div>" +
      comment("This is a learning project, not a clinical tool. On " + num(NH.test.n) + " test people the NHANES model reached an AUC of " + NH.test.auc + " and a Brier score of " + NH.test.brier + ". It was built by Afolabi Adesina from public data, starting from a Framingham assignment at Sheridan College. Not medical advice.") + "</div>";
  }

  var RENDER = { calculator: calculator, compare: compare, canada: canada, about: about };
  function render(focus) {
    var v = $("#view");
    v.innerHTML = RENDER[state.view]();
    v.classList.remove("view-in"); void v.offsetWidth; v.classList.add("view-in");
    v.setAttribute("aria-labelledby", "tab-" + state.view);
    document.querySelectorAll("#tabs [role=tab]").forEach(function (t) {
      var on = t.dataset.view === state.view;
      t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1;
      if (on) t.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
    if (state.view === "calculator") updateCalc();
    if (focus) v.focus({ preventScroll: true });
  }
  function readHash() { var h = location.hash.replace(/^#\/?/, ""); state.view = VIEWS.indexOf(h) >= 0 ? h : "calculator"; }
  function go(v) { var h = "#/" + v; if (location.hash !== h) location.hash = h; else render(false); }
  window.addEventListener("hashchange", function () { readHash(); render(false); });
  document.getElementById("tabs").addEventListener("click", function (e) { var b = e.target.closest("[role=tab]"); if (b) go(b.dataset.view); });
  document.getElementById("tabs").addEventListener("keydown", function (e) {
    var i = VIEWS.indexOf(state.view), d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (e.key === "Home") i = 0; else if (e.key === "End") i = VIEWS.length - 1; else if (d) i = (i + d + VIEWS.length) % VIEWS.length; else return;
    e.preventDefault(); go(VIEWS[i]); document.getElementById("tab-" + VIEWS[i]).focus();
  });
  $("#view").addEventListener("input", function (e) { if (e.target.matches("#form input")) updateCalc(); });
  $("#view").addEventListener("click", function (e) {
    var b = e.target.closest(".seg button"); if (!b) return;
    var g = b.parentNode.id.slice(2), v = b.dataset.v;
    if (g === "unit") { if (readForm()) { state.unit = v; render(false); } return; }
    if (g === "fram") state.fram = v === "1"; else state.p[g] = +v;
    b.parentNode.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
    updateCalc();
  });
  Promise.all([load("nhanes_model.json"), load("framingham_model.json"), load("cchs_prevalence.json"), load("extras.json")]).then(function (r) {
    NH = r[0]; FR = r[1]; CC = r[2]; EX = r[3]; readHash(); render(false);
  }).catch(function () { $("#view").innerHTML = '<p class="loading">Could not load the data. Please reload the page.</p>'; });
})();
