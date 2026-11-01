/* CELPIP Coach v7 · section menu: Menu page + one page per CELPIP section.
   Each section has four tabs: Lesson, Tips, Practice, Progress.
   Uses globals from app.js at runtime: state, saveState, bumpStreak, go, showPage, backBtn, navBack, setRouteTab,
   todayISO, promptStatus, openObject, T1_PROMPTS, T2_PROMPTS, UI, FX, $, esc.
   Data lives in sections-data.js. */
"use strict";

const Sections = (() => {
  const TABS = [["lesson", "Lesson"], ["tips", "Tips"], ["practice", "Practice"], ["progress", "Progress"]];
  const GROUPS = ["Listening", "Reading", "Writing", "Speaking"];
  const ytUrl = (id) => `https://youtu.be/${id}`;
  const byId = (id) => SECTIONS.find((s) => s.id === id);
  const isWriting = (s) => !!s.wtype;
  const isSpeaking = (s) => !!s.prep;
  const isDrill = (s) => !!s.drills;

  function sst(id) {
    if (!state.sections) state.sections = {};
    if (!state.sections[id]) state.sections[id] = { log: [], lessonRead: false };
    return state.sections[id];
  }
  function sessionsOf(s) { return isWriting(s) ? writingStats(s).tries : sst(s.id).log.length; }
  function writingList(s) { return s.wtype === "t2" ? T2_PROMPTS : T1_PROMPTS; }
  function writingStats(s) {
    const list = writingList(s);
    const ids = new Set(list.map((p) => p.id));
    const attempts = state.attempts.filter((a) => ids.has(a.id));
    const done = list.filter((p) => state.bestClb[p.id]).length;
    const best = Math.max(0, ...list.map((p) => state.bestClb[p.id] || 0));
    return { total: list.length, done, best: best || null, tries: attempts.length, attempts };
  }
  function skillStats(skill) {
    const secs = SECTIONS.filter((s) => s.skill === skill);
    return { count: secs.length, sessions: secs.reduce((n, s) => n + sessionsOf(s), 0) };
  }
  function avgScore(s) {
    const log = sst(s.id).log;
    if (!log.length) return null;
    return log.reduce((n, x) => n + x.score, 0) / log.length;
  }
  function fmtDate(d) {
    if (!d) return "-";
    const [y, m, dd] = d.split("-").map(Number);
    return new Date(y, m - 1, dd).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  function logPractice(s, entry) {
    const st = sst(s.id);
    st.log.push({ d: todayISO(), ...entry });
    if (st.log.length > 200) st.log = st.log.slice(-200);
    saveState(state);
    bumpStreak();
  }

  /* ================= Menu ================= */
  function renderMenu(r, opts = {}) {
    const last = state.sectionLast && byId(state.sectionLast.id) ? state.sectionLast : null;
    const total = SECTIONS.reduce((n, s) => n + sessionsOf(s), 0);
    $("menu-head").innerHTML = `<h2 class="dp-title">Menu</h2>
      <p class="dp-sub">Pick a CELPIP section. Each one has a Lesson, Tips, Practice and Progress.</p>
      <div class="kpi-row">
        <div class="kpi"><span class="kpi-num">${SECTIONS.length}</span><span class="kpi-lbl">sections</span></div>
        <div class="kpi"><span class="kpi-num">${total}</span><span class="kpi-lbl">practice sessions</span></div>
      </div>`;
    const row = (s) => {
      const n = sessionsOf(s);
      let tag;
      if (isWriting(s)) { const w = writingStats(s); tag = w.done ? UI.status("positive", `${w.done} of ${w.total} done`) : UI.status("neutral", "Not started"); }
      else tag = n ? UI.status("positive", `${n} ${n === 1 ? "session" : "sessions"}`) : UI.status("neutral", "Not started");
      return `<li><button type="button" class="li menu-row" data-sec="${s.id}">
        <span class="li-ico">${UI.icon(s.icon)}</span>
        <span class="li-main"><span class="li-title">${esc(s.name)}</span><span class="li-meta">${esc(s.meta)}</span></span>
        <span class="li-side">${tag}</span>${UI.icon("chevron", "chev")}</button></li>`;
    };
    $("menu-body").innerHTML = `
      ${last ? `<div class="panel continue-card"><p class="panel-eyebrow">Pick up where you left off</p>
        <button type="button" class="btn default block" id="menu-continue">${esc(byId(last.id).name)} · ${esc(TABS.find((t) => t[0] === last.tab)[1])}</button></div>` : ""}
      ${GROUPS.map((g) => `<section class="menu-group" id="menu-g-${g.toLowerCase()}" aria-labelledby="menu-h-${g.toLowerCase()}">
        <h3 class="menu-h" id="menu-h-${g.toLowerCase()}">${g}</h3>
        <ul class="list menu-list">${SECTIONS.filter((s) => s.skill === g).map(row).join("")}</ul></section>`).join("")}
      <p class="muted small center menu-foot">Short on time? Open any section and tap Skip to practice.</p>`;
    $("menu-body").querySelectorAll(".menu-row").forEach((b) => b.addEventListener("click", () => go({ p: "section", id: b.dataset.sec, tab: "lesson" })));
    const c = $("menu-continue");
    if (c) c.addEventListener("click", () => go({ p: "section", id: last.id, tab: last.tab }));
    showPage("menu", { ...opts, title: "Menu", keepScroll: !!r.id });
    UI.setFooter([
      { id: "btn-menu-home", label: "Home", type: "default", icon: "home", onClick: () => go({ p: "launchpad" }, { replace: true }) },
      { id: "btn-menu-go", label: last ? "Continue" : "Start with Speaking 1", type: "emph",
        onClick: () => last ? go({ p: "section", id: last.id, tab: last.tab }) : go({ p: "section", id: "speaking1", tab: "lesson" }) },
    ]);
    if (r.id) {
      const g = $(`menu-g-${r.id}`);
      if (g) setTimeout(() => window.scrollTo(0, Math.max(0, g.getBoundingClientRect().top + window.scrollY - 70)), 30);
    }
  }

  /* ================= Section page ================= */
  let cur = null; // { s, tab }
  let spk = null; // speaking practice state
  let drill = null; // drill state
  let spkTimer = null;

  function stopAll() {
    if (spkTimer) { clearInterval(spkTimer); spkTimer = null; }
    try { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); } catch (e) {}
    spk = null;
    drill = null;
  }
  function leave() { stopAll(); cur = null; }

  function renderSection(r, opts = {}) {
    const s = byId(r.id);
    if (!s) { go({ p: "menu" }, { replace: true }); return; }
    const tab = TABS.some((t) => t[0] === r.tab) ? r.tab : "lesson";
    if (!cur || cur.s.id !== s.id) stopAll();
    cur = { s, tab };
    state.sectionLast = { id: s.id, tab };
    saveState(state);
    renderHead();
    renderTabs();
    showPage("section", { ...opts, title: s.short });
    renderTab();
  }

  function renderHead() {
    const s = cur.s;
    const n = sessionsOf(s);
    $("sec-head").innerHTML = `
      <p class="dp-eyebrow">${esc(s.skill)}</p>
      <h2 class="dp-title">${esc(s.name)}</h2>
      <p class="dp-sub">${esc(s.summary)}</p>
      <div class="dp-status">${UI.status("info", s.meta)}${n ? UI.status("positive", `${n} ${n === 1 ? "session" : "sessions"}`) : ""}</div>
      <label class="jump"><span>Jump to</span>
        <select id="sec-jump" aria-label="Jump to another section">${GROUPS.map((g) => `<optgroup label="${g}">${SECTIONS.filter((x) => x.skill === g).map((x) => `<option value="${x.id}" ${x.id === s.id ? "selected" : ""}>${esc(x.name)}</option>`).join("")}</optgroup>`).join("")}</select>
      </label>`;
    $("sec-jump").addEventListener("change", (e) => go({ p: "section", id: e.target.value, tab: cur.tab }));
  }

  function renderTabs() {
    $("sec-tabs").innerHTML = TABS.map(([k, l]) => `<button type="button" class="tab" role="tab" id="stab-${k}" data-tab="${k}" aria-selected="${cur.tab === k}" aria-controls="sec-body">${l}</button>`).join("");
    $("sec-tabs").querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => setTab(b.dataset.tab)));
  }

  function setTab(tab) {
    stopAll();
    cur.tab = tab;
    setRouteTab(tab);
    state.sectionLast = { id: cur.s.id, tab };
    saveState(state);
    renderTabs();
    renderTab();
    const top = $("sec-tabs").offsetTop - $("shellbar").offsetHeight;
    if (window.scrollY > top) window.scrollTo(0, Math.max(0, top));
  }

  function renderTab() {
    const b = $("sec-body");
    b.classList.remove("model-reveal"); void b.offsetWidth; b.classList.add("model-reveal");
    ({ lesson: lessonTab, tips: tipsTab, practice: practiceTab, progress: progressTab })[cur.tab]();
  }

  /* ---------- Lesson ---------- */
  function lessonTab() {
    const s = cur.s, L = s.lesson, st = sst(s.id);
    const writingLinks = isWriting(s) ? `<div class="panel"><h3>Hands-on lessons in this app</h3>
      <div class="btn-stack">${s.wtype === "t1"
        ? `<button type="button" class="btn default" data-go="lesson1">Lesson 1: Fill the Gaps</button>
           <button type="button" class="btn default" data-go="lesson2">Lesson 2: Tone and Grammar</button>
           <button type="button" class="btn default" data-go="lesson3">Lesson 3: Full Timed Draft</button>
           <button type="button" class="btn default" data-go="lesson4">Grammar: subject-verb agreement</button>`
        : `<button type="button" class="btn default" data-go="lesson4">Grammar: subject-verb agreement</button>
           <button type="button" class="btn default" data-go="guides">Baby Steps: Task 2 survey guide</button>
           <button type="button" class="btn default" data-go="phrases">Phrase Bank</button>`}</div></div>` : "";
    $("sec-body").innerHTML = `
      ${UI.strip("info", `Quick lesson first, about two minutes. Short on time? <button type="button" class="link-btn" id="skip-inline">Skip to practice</button>.`)}
      <div class="panel"><p class="lead">${esc(L.intro)}</p>
        <h3>What to remember</h3><ul class="rule-list">${L.points.map((p) => `<li>${UI.icon("check")}${esc(p)}</li>`).join("")}</ul></div>
      <div class="panel"><h3>Steps</h3><ol class="steps">${L.steps.map((x) => `<li>${esc(x)}</li>`).join("")}</ol></div>
      <div class="panel example"><p class="panel-eyebrow">Example</p><p>${esc(L.example)}</p></div>
      ${s.note ? UI.strip("warning", esc(s.note)) : ""}
      ${writingLinks}
      ${st.lessonRead ? UI.strip("success", "You have already read this lesson. Read it again any time.") : ""}`;
    $("skip-inline").addEventListener("click", () => setTab("practice"));
    $("sec-body").querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => {
      const k = b.dataset.go;
      if (k === "lesson1") go({ p: "lesson", n: 1 });
      else if (k === "lesson2") go({ p: "lesson", n: 2 });
      else if (k === "lesson3") startLesson3(false);
      else if (k === "lesson4") go({ p: "lesson", n: 4 });
      else go({ p: k });
    }));
    UI.setFooter([
      { id: "btn-skip", label: "Skip to practice", type: "default", onClick: () => setTab("practice") },
      { id: "btn-got", label: "Got it, start practice", type: "emph", onClick: () => { st.lessonRead = true; saveState(state); setTab("practice"); } },
    ]);
  }

  /* ---------- Tips ---------- */
  function tipsTab() {
    const s = cur.s;
    const used = [...new Set(s.tips.filter((t) => t.src).map((t) => t.src))];
    $("sec-body").innerHTML = `
      ${UI.strip("info", `Many tips here are paraphrased from free videos by <a href="${CHANNEL.url}" target="_blank" rel="noopener noreferrer">${esc(CHANNEL.name)}</a> on YouTube. They are one coach's advice, not official CELPIP rules. Tap a video tag to watch the source.`)}
      <ul class="tip-list">${s.tips.map((t, i) => `<li class="panel tip"><span class="tip-n">${i + 1}</span><div class="tip-main"><p>${esc(t.t)}</p>
        ${t.src ? `<a class="src-chip" href="${ytUrl(TIP_SOURCES[t.src].id)}" target="_blank" rel="noopener noreferrer" aria-label="Open video: ${esc(TIP_SOURCES[t.src].title)}">${UI.icon("external")}<span>${esc(TIP_SOURCES[t.src].title)}</span></a>` : `<span class="src-own">Study habit, not from the channel</span>`}</div></li>`).join("")}</ul>
      <details class="panel credits"><summary>Credits and more videos</summary>
        <p>Channel: <a href="${CHANNEL.url}" target="_blank" rel="noopener noreferrer">${esc(CHANNEL.name)}</a>. The channel also sells a paid course. This app does not use or copy any of it.</p>
        ${used.length ? `<p class="panel-eyebrow">Videos used on this page</p><ul class="credit-list">${used.map((k) => `<li><a href="${ytUrl(TIP_SOURCES[k].id)}" target="_blank" rel="noopener noreferrer">${esc(TIP_SOURCES[k].title)}</a></li>`).join("")}</ul>` : ""}
        <p class="panel-eyebrow">Popular on the channel</p>
        <ul class="credit-list">${CHANNEL_POPULAR.map((v) => `<li><a href="${ytUrl(v.id)}" target="_blank" rel="noopener noreferrer">${esc(v.title)}</a> <span class="muted">${v.views} views</span></li>`).join("")}</ul>
      </details>`;
    UI.setFooter([
      { id: "btn-tips-lesson", label: "Lesson", type: "default", onClick: () => setTab("lesson") },
      { id: "btn-tips-practice", label: "Start practice", type: "emph", onClick: () => setTab("practice") },
    ]);
  }

  /* ---------- Practice ---------- */
  function practiceTab() {
    const s = cur.s;
    if (isWriting(s)) return writingPractice();
    if (isSpeaking(s)) return speakingPractice();
    return drillPicker();
  }

  function writingPractice() {
    const s = cur.s, w = writingStats(s), t2 = s.wtype === "t2";
    const status = (p) => promptStatus(p.id);
    const list = writingList(s);
    const next = list.find((p) => status(p).k === "progress") || list.find((p) => status(p).k === "new") || list[0];
    $("sec-body").innerHTML = `
      <div class="panel"><h3>${t2 ? "Task 2 surveys" : "Task 1 emails"}</h3>
        <p>${w.done} of ${w.total} prompts done${w.best ? `, best estimate CLB ${w.best}` : ""}. The timer starts when you open the Write tab.</p>
        <div class="btn-stack">
          <button type="button" class="btn default" id="w-list">Browse all ${w.total} prompts</button>
          ${t2 ? "" : `<button type="button" class="btn default" id="w-timed">Quick timed draft (27 min)</button>`}
        </div></div>
      <div class="panel"><h3>Up next</h3>
        <button type="button" class="li inline-li" id="w-next"><span class="li-ico">${UI.icon(t2 ? "survey" : "mail")}</span>
          <span class="li-main"><span class="li-title">${esc(next.title)}</span><span class="li-meta">${t2 ? "Option A or B" : `To ${esc(next.to)} · ${esc(next.tag)}`}</span></span>
          <span class="li-side">${UI.status(status(next).cls, status(next).label)}</span>${UI.icon("chevron", "chev")}</button></div>
      ${UI.strip("info", "Want a refresher first? <button type=\"button\" class=\"link-btn\" id=\"w-lesson\">Open the lesson</button>.")}`;
    $("w-list").addEventListener("click", () => go({ p: "list", type: s.wtype }));
    const timed = $("w-timed");
    if (timed) timed.addEventListener("click", () => {
      const pick = T1_PROMPTS.find((p) => !state.bestClb[p.id]) || T1_PROMPTS[0];
      openObject("t1", pick.id, "write");
    });
    $("w-next").addEventListener("click", () => openObject(s.wtype, next.id, "prompt"));
    $("w-lesson").addEventListener("click", () => setTab("lesson"));
    UI.setFooter([
      { id: "btn-w-tips", label: "Tips", type: "default", onClick: () => setTab("tips") },
      { id: "btn-w-start", label: "Start next prompt", type: "emph", onClick: () => openObject(s.wtype, next.id, "prompt") },
    ]);
  }

  /* ----- Speaking ----- */
  function speakingPractice() {
    const s = cur.s;
    if (!spk) spk = { idx: (sst(s.id).log.length) % s.prompts.length, phase: "idle", left: s.prep, checks: [], rating: 0 };
    drawSpeaking();
  }
  const mmss = (n) => `${Math.floor(n / 60)}:${String(Math.max(0, n) % 60).padStart(2, "0")}`;
  function beep() {
    try {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C || (typeof FX !== "undefined" && FX.reduced && FX.reduced())) return;
      const c = new C(); const o = c.createOscillator(); const g = c.createGain();
      o.connect(g); g.connect(c.destination); o.frequency.value = 880; g.gain.value = 0.05;
      o.start(); o.stop(c.currentTime + 0.15);
      setTimeout(() => c.close(), 400);
    } catch (e) {}
  }
  function drawSpeaking() {
    const s = cur.s, p = spk;
    const phaseName = { idle: "Ready", prep: "Prepare", speak: "Speak now", done: "Time is up" }[p.phase];
    const cls = p.phase === "speak" ? "speak" : p.phase === "prep" ? "prep" : "";
    const pickers = s.prompts.map((t, i) => `<button type="button" class="chip-btn" data-i="${i}" aria-pressed="${p.idx === i}" ${p.phase === "prep" || p.phase === "speak" ? "disabled" : ""}>Prompt ${i + 1}</button>`).join("");
    $("sec-body").innerHTML = `
      <div class="chip-row" role="group" aria-label="Choose a prompt">${pickers}</div>
      <div class="panel scenario"><p class="panel-eyebrow">${esc(s.name)}</p><p id="spk-prompt">${esc(s.prompts[p.idx])}</p></div>
      <div class="panel timer-panel ${cls}" aria-live="polite">
        <p class="panel-eyebrow">${phaseName}</p>
        <p class="big-timer" id="spk-clock">${p.phase === "idle" ? mmss(s.prep) : mmss(p.left)}</p>
        <p class="muted small">${s.prep} seconds to prepare, then ${s.speak} seconds to speak.</p>
        ${p.phase === "prep" ? `<label class="plan-box"><span class="panel-eyebrow">Quick plan (optional, not saved)</span><textarea id="spk-plan" rows="3" placeholder="Jot two or three keywords"></textarea></label>` : ""}
        ${p.phase === "speak" ? `<p class="small">Talk out loud. Pretend you are really talking to the person.</p>` : ""}
      </div>
      ${p.phase === "done" ? `<div class="panel"><h3>How did it go?</h3>
        <p class="muted small">Tick what you did. Be honest, it helps more than being kind.</p>
        <ul class="check-list">${s.checks.map((c, i) => `<li><label><input type="checkbox" data-c="${i}" ${p.checks[i] ? "checked" : ""}/> <span>${esc(c)}</span></label></li>`).join("")}</ul>
        <p class="panel-eyebrow">Your feeling about this answer</p>
        <div class="chip-row" role="group" aria-label="Rating from 1 to 5">${[1, 2, 3, 4, 5].map((n) => `<button type="button" class="chip-btn" data-r="${n}" aria-pressed="${p.rating === n}">${n}</button>`).join("")}</div>
        <p class="muted small">1 is shaky, 5 is smooth. Record yourself on your phone if you can, then listen back.</p></div>` : ""}
      ${p.phase === "idle" ? UI.strip("info", "Speak out loud. Recording yourself on your phone and listening back is the best way to hear your own mistakes.") : ""}`;
    $("sec-body").querySelectorAll("[data-i]").forEach((b) => b.addEventListener("click", () => { p.idx = Number(b.dataset.i); drawSpeaking(); }));
    $("sec-body").querySelectorAll("[data-c]").forEach((b) => b.addEventListener("change", () => { p.checks[Number(b.dataset.c)] = b.checked; }));
    $("sec-body").querySelectorAll("[data-r]").forEach((b) => b.addEventListener("click", () => { p.rating = Number(b.dataset.r); drawSpeaking(); }));
    // footer by phase
    if (p.phase === "idle") UI.setFooter([
      { id: "btn-sp-tips", label: "Tips", type: "default", onClick: () => setTab("tips") },
      { id: "btn-sp-start", label: `Start (${s.prep}s prep)`, type: "emph", onClick: startPrep },
    ]);
    else if (p.phase === "prep") UI.setFooter([
      { id: "btn-sp-cancel", label: "Cancel", type: "default", onClick: cancelSpeak },
      { id: "btn-sp-now", label: "Speak now", type: "emph", onClick: startSpeak },
    ]);
    else if (p.phase === "speak") UI.setFooter([
      { id: "btn-sp-cancel", label: "Cancel", type: "default", onClick: cancelSpeak },
      { id: "btn-sp-stop", label: "I am done", type: "emph", onClick: finishSpeak },
    ]);
    else UI.setFooter([
      { id: "btn-sp-again", label: "Try again, no save", type: "default", onClick: () => { spk = { idx: p.idx, phase: "idle", left: s.prep, checks: [], rating: 0 }; drawSpeaking(); } },
      { id: "btn-sp-save", label: "Save this practice", type: "emph", onClick: saveSpeak },
    ]);
  }
  function tickTo(phase, secs, onEnd) {
    if (spkTimer) clearInterval(spkTimer);
    spk.phase = phase; spk.left = secs;
    drawSpeaking();
    spkTimer = setInterval(() => {
      spk.left -= 1;
      const el = $("spk-clock");
      if (el) el.textContent = mmss(spk.left);
      if (spk.left <= 0) { clearInterval(spkTimer); spkTimer = null; onEnd(); }
    }, 1000);
  }
  function startPrep() { tickTo("prep", cur.s.prep, () => { beep(); startSpeak(); }); }
  function startSpeak() { tickTo("speak", cur.s.speak, () => { beep(); finishSpeak(true); }); }
  function finishSpeak() {
    if (spkTimer) { clearInterval(spkTimer); spkTimer = null; }
    spk.phase = "done"; spk.left = 0;
    drawSpeaking();
    window.scrollTo(0, 0);
  }
  function cancelSpeak() {
    if (spkTimer) { clearInterval(spkTimer); spkTimer = null; }
    spk = { idx: spk.idx, phase: "idle", left: cur.s.prep, checks: [], rating: 0 };
    drawSpeaking();
  }
  function saveSpeak() {
    const s = cur.s;
    if (!spk.rating) { FX.toast("Pick a number from 1 to 5 first."); return; }
    const checked = spk.checks.filter(Boolean).length;
    logPractice(s, { k: "speak", p: spk.idx, score: spk.rating / 5, rating: spk.rating, checks: checked });
    FX.toast("Saved. Nice work.");
    const nextIdx = (spk.idx + 1) % s.prompts.length;
    spk = { idx: nextIdx, phase: "idle", left: s.prep, checks: [], rating: 0 };
    renderHead();
    drawSpeaking();
  }

  /* ----- Listening and Reading drills ----- */
  function drillPicker() {
    const s = cur.s;
    $("sec-body").innerHTML = `
      ${UI.strip("info", esc(s.practiceNote))}
      <ul class="list drill-list">${s.drills.map((d, i) => {
        const last = sst(s.id).log.filter((x) => x.drill === d.id).slice(-1)[0];
        return `<li><button type="button" class="li drill-row" data-i="${i}"><span class="li-ico">${UI.icon(s.icon)}</span>
          <span class="li-main"><span class="li-title">${esc(d.title)}</span><span class="li-meta">${d.questions.length} questions${last ? ` · last ${Math.round(last.score * 100)}% on ${fmtDate(last.d)}` : ""}</span></span>
          ${UI.icon("chevron", "chev")}</button></li>`;
      }).join("")}</ul>
      <p class="muted small center">More practice: use the Tips tab for ways to practise every day.</p>`;
    $("sec-body").querySelectorAll(".drill-row").forEach((b) => b.addEventListener("click", () => openDrill(Number(b.dataset.i))));
    UI.setFooter([
      { id: "btn-dr-tips", label: "Tips", type: "default", onClick: () => setTab("tips") },
      { id: "btn-dr-start", label: "Start first drill", type: "emph", onClick: () => openDrill(0) },
    ]);
  }
  function openDrill(i) {
    const s = cur.s, d = s.drills[i];
    drill = { i, d, played: false, playing: false, showQ: s.id === "reading", answers: [], checked: false, notes: ["", "", ""] };
    drawDrill();
    window.scrollTo(0, 0);
  }
  function speechOk() { return "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined"; }
  function drawDrill() {
    const s = cur.s, D = drill, d = D.d, reading = s.id === "reading";
    const cols = d.notesCols || 1;
    const notes = reading ? "" : `<div class="panel"><p class="panel-eyebrow">Your notes (${cols === 3 ? "one column for each side" : "short keywords only"})</p>
      <div class="note-cols c${cols}">${Array.from({ length: cols }, (_, k) => `<textarea data-n="${k}" rows="6" aria-label="Notes column ${k + 1}" placeholder="${cols === 3 ? ["For", "Against", "In the middle"][k] : "Keywords, arrows, tiny pictures"}">${esc(D.notes[k] || "")}</textarea>`).join("")}</div></div>`;
    const audio = reading ? `<div class="panel passage"><p class="panel-eyebrow">Passage</p>${d.passage.split("\n\n").map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("")}</div>` :
      `<div class="panel audio-panel"><p class="panel-eyebrow">Audio</p>
        ${D.playing ? `<p class="big-timer small-t" aria-live="polite">Listening...</p><p class="muted small">Take notes now. You will not hear it again.</p>`
          : D.played ? `<p class="success-text">Finished. Now answer from your notes.</p>`
          : `<p>It plays one time, like the real test. Take notes while it plays.</p>`}
        ${!D.played && !D.playing ? (speechOk() ? `<button type="button" class="btn emph block" id="dr-play">${UI.icon("play")}<span>Play once</span></button>` : UI.strip("warning", "This device cannot read aloud. Ask someone to read the script to you, or skip the audio and show the questions."))
          : ""}
        ${D.playing ? `<button type="button" class="btn default block" id="dr-stopaudio">Stop audio</button>` : ""}
        ${!D.showQ && !D.playing ? `<button type="button" class="link-btn" id="dr-skipaudio">Skip the audio and show the questions</button>` : ""}
      </div>`;
    const qs = D.showQ ? d.questions.map((q, qi) => `<div class="panel qcard"><p class="q-text"><b>${qi + 1}.</b> ${esc(q.q)}</p>
      <div class="opts" role="radiogroup" aria-label="Question ${qi + 1}">${q.opts.map((o, oi) => {
        let cls = "opt";
        if (D.checked) { if (oi === q.a) cls += " right"; else if (D.answers[qi] === oi) cls += " wrong"; }
        return `<label class="${cls}"><input type="radio" name="q${qi}" value="${oi}" ${D.answers[qi] === oi ? "checked" : ""} ${D.checked ? "disabled" : ""}/> <span>${esc(o)}</span></label>`;
      }).join("")}</div>
      ${D.checked ? `<p class="why ${D.answers[qi] === q.a ? "ok" : "no"}">${D.answers[qi] === q.a ? "Correct. " : "Not quite. "}${esc(q.why)}</p>` : ""}</div>`).join("") : "";
    const score = D.checked ? d.questions.filter((q, qi) => D.answers[qi] === q.a).length : 0;
    const result = D.checked ? UI.strip(score === d.questions.length ? "success" : "info", `You got ${score} of ${d.questions.length}.`) : "";
    const script = D.checked && !reading ? `<details class="panel"><summary>Show the script</summary><p>${esc(d.script)}</p></details>` : "";
    $("sec-body").innerHTML = `<p class="dp-eyebrow drill-title">${esc(d.title)}</p>${result}${reading ? "" : audio}${reading ? audio : notes}${qs}${script}${
      reading && !D.checked ? UI.strip("info", "Tip: read each question first, find the spot in the passage, then answer. Leave the \"main reason\" question for last.") : ""}`;
    // wire
    $("sec-body").querySelectorAll("textarea[data-n]").forEach((t) => t.addEventListener("input", () => { D.notes[Number(t.dataset.n)] = t.value; }));
    $("sec-body").querySelectorAll(".opts input").forEach((r) => r.addEventListener("change", () => { D.answers[Number(r.name.slice(1))] = Number(r.value); updateDrillFooter(); }));
    const pl = $("dr-play"); if (pl) pl.addEventListener("click", playAudio);
    const sk = $("dr-skipaudio"); if (sk) sk.addEventListener("click", () => { D.showQ = true; D.played = true; drawDrill(); });
    const st = $("dr-stopaudio"); if (st) st.addEventListener("click", endAudio);
    updateDrillFooter();
  }
  function updateDrillFooter() {
    const D = drill, d = D.d;
    const answered = d.questions.every((q, qi) => D.answers[qi] != null);
    if (D.checked) {
      const hasNext = D.i + 1 < cur.s.drills.length;
      UI.setFooter([
        { id: "btn-dr-list", label: "All drills", type: "default", onClick: () => { stopAll(); drillPicker(); } },
        hasNext ? { id: "btn-dr-next", label: "Next drill", type: "emph", onClick: () => openDrill(D.i + 1) }
                : { id: "btn-dr-prog", label: "See progress", type: "emph", onClick: () => setTab("progress") },
      ]);
    } else {
      UI.setFooter([
        { id: "btn-dr-list", label: "All drills", type: "default", onClick: () => { stopAll(); drillPicker(); } },
        { id: "btn-dr-check", label: "Check answers", type: "emph", disabled: !D.showQ || !answered, onClick: checkDrill },
      ]);
    }
  }
  function playAudio() {
    const D = drill;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(D.d.script);
      u.lang = "en-CA"; u.rate = 0.95;
      u.onend = endAudio; u.onerror = endAudio;
      D.playing = true; drawDrill();
      window.speechSynthesis.speak(u);
    } catch (e) { endAudio(); }
  }
  function endAudio() {
    if (!drill) return;
    try { window.speechSynthesis.cancel(); } catch (e) {}
    drill.playing = false; drill.played = true; drill.showQ = true;
    drawDrill();
  }
  function checkDrill() {
    const s = cur.s, D = drill, d = D.d;
    D.checked = true;
    const score = d.questions.filter((q, qi) => D.answers[qi] === q.a).length;
    logPractice(s, { k: "drill", drill: d.id, score: score / d.questions.length, right: score, of: d.questions.length });
    if (score === d.questions.length && typeof FX !== "undefined" && FX.confetti) FX.confetti();
    renderHead();
    drawDrill();
    window.scrollTo(0, 0);
  }

  /* ---------- Progress ---------- */
  function progressTab() {
    const s = cur.s, st = sst(s.id);
    let kpis, listHtml = "";
    if (isWriting(s)) {
      const w = writingStats(s);
      kpis = `<div class="kpi"><span class="kpi-num ${w.done ? "positive" : ""}">${w.done}<small> / ${w.total}</small></span><span class="kpi-lbl">prompts done</span></div>
        <div class="kpi"><span class="kpi-num">${w.best ? `CLB ${w.best}` : "-"}</span><span class="kpi-lbl">best estimate</span></div>
        <div class="kpi"><span class="kpi-num">${w.tries}</span><span class="kpi-lbl">${w.tries === 1 ? "try" : "tries"}</span></div>`;
      const recent = w.attempts.slice(-5).reverse();
      listHtml = recent.length ? `<div class="panel"><h3>Recent drafts</h3><ul class="log-list">${recent.map((a) => {
        const p = writingList(s).find((x) => x.id === a.id);
        return `<li><span>${esc(p ? p.title : a.id)}</span><span class="muted">${a.overall != null ? `CLB ${a.overall}` : ""}</span></li>`;
      }).join("")}</ul></div>` : UI.strip("info", "No drafts yet. Open Practice and write one.");
      listHtml += `<div class="btn-stack"><button type="button" class="btn default" id="p-hist">Open CLB estimate history</button></div>`;
    } else {
      const n = st.log.length, avg = avgScore(s);
      const isSp = isSpeaking(s);
      kpis = `<div class="kpi"><span class="kpi-num">${n}</span><span class="kpi-lbl">sessions</span></div>
        <div class="kpi"><span class="kpi-num ${avg != null && avg >= 0.8 ? "positive" : ""}">${avg == null ? "-" : isSp ? `${(avg * 5).toFixed(1)}<small> / 5</small>` : `${Math.round(avg * 100)}%`}</span><span class="kpi-lbl">${isSp ? "average rating" : "average score"}</span></div>
        <div class="kpi"><span class="kpi-num">${n ? fmtDate(st.log[n - 1].d) : "-"}</span><span class="kpi-lbl">last practice</span></div>`;
      const recent = st.log.slice(-6).reverse();
      listHtml = recent.length ? `<div class="panel"><h3>Recent sessions</h3><ul class="log-list">${recent.map((x) => `<li><span>${fmtDate(x.d)} · ${x.k === "speak" ? `Prompt ${x.p + 1}` : `Drill ${x.drill}`}</span><span class="muted">${x.k === "speak" ? `${x.rating} / 5 · ${x.checks} ticks` : `${x.right} of ${x.of}`}</span></li>`).join("")}</ul></div>`
        : UI.strip("info", "No sessions yet. Do one practice and it shows up here.");
      if (n) listHtml += `<div class="btn-stack"><button type="button" class="btn default" id="p-clear">Clear this section's log</button></div>`;
    }
    $("sec-body").innerHTML = `
      <div class="panel"><div class="kpi-row nomt">${kpis}</div></div>
      <div class="panel"><p><b>Lesson:</b> ${st.lessonRead ? "read" : "not read yet"}.${isWriting(s) ? "" : " Progress is saved on this device only."}</p></div>
      ${listHtml}`;
    const hist = $("p-hist"); if (hist) hist.addEventListener("click", () => go({ p: "history" }));
    const clr = $("p-clear");
    if (clr) clr.addEventListener("click", async () => {
      if (await UI.confirm({ title: "Clear this log?", text: "This removes practice sessions for this section only. It cannot be undone.", ok: "Clear", danger: true })) {
        st.log = []; saveState(state); renderHead(); progressTab();
      }
    });
    UI.setFooter([
      { id: "btn-pr-menu", label: "Menu", type: "default", icon: "menu", onClick: () => go({ p: "menu" }) },
      { id: "btn-pr-practice", label: "Practice", type: "emph", onClick: () => setTab("practice") },
    ]);
  }

  return { renderMenu, renderSection, leave, skillStats, byId, TABS, GROUPS };
})();
