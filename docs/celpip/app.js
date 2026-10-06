/**
 * CELPIP Coach v4 · core: state + migration, navigation, home, learn, write, progress, phrase bank, PWA
 * Personal use · localStorage only · no backend · vanilla JS
 */
"use strict";

const STORAGE_KEY = "celpip-coach-v4";
/* v2 and v3 both stored progress under "celpip-email-coach-v1". The others are checked just in case. */
const LEGACY_KEYS = ["celpip-email-coach-v1", "celpip-email-coach-v3", "celpip-email-coach-v2"];
const TABS = ["home", "learn", "games", "write", "progress"];
const TAB_TITLES = { home: "Home", learn: "Learn", games: "Brain games", write: "Write", progress: "Progress" };
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* ---------- Dates ---------- */
function iso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function todayISO() { return iso(new Date()); }
function fromISO(s) { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); }
function addDays(s, n) { const d = fromISO(s); d.setDate(d.getDate() + n); return iso(d); }
/* v1 to v3 wrote dates as "2026-10-5" (no zero padding) */
function normalizeDate(s) {
  if (!s || typeof s !== "string") return null;
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  return m ? `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}` : null;
}
function legacyKey(d) { return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }

/* ---------- State ---------- */
function defaultState() {
  return {
    schema: 4,
    migratedFrom: null,
    // v1 to v3 fields (kept so nothing is lost)
    streak: 0,
    lastPracticeDate: null,
    lesson1Completions: 0,
    lesson2Completions: 0,
    lesson3Completions: 0,
    lastScore: null,
    lastBand: null,
    lastLesson: null,
    scenarioIndex: 0,
    l3ScenarioIndex: 0,
    completedScenarioIds: [],
    lessonsTouched: { 1: false, 2: false, 3: false },
    // v4 fields
    activeDays: [],
    challengeDone: {},
    challengeSeeded: false,
    games: {},
    warmups: {},
    attempts: [],
    attempted: {},
    bestClb: {},
    drafts: {},
    lastSubmission: {},
    favPhrases: [],
    lastClb: null,
    settings: { theme: null, reduceMotion: false },
    welcomed: false,
  };
}

function bandToNumber(band) {
  if (!band) return null;
  const nums = String(band).match(/\d+/g);
  if (!nums) return null;
  return Number(nums[0]); // "CLB 9-10" counts as 9 so the ring never overstates
}

function migrateLegacy(old, key) {
  const s = defaultState();
  const keep = ["streak", "lastPracticeDate", "lesson1Completions", "lesson2Completions", "lesson3Completions", "lastScore", "lastBand", "lastLesson", "scenarioIndex", "l3ScenarioIndex", "completedScenarioIds"];
  keep.forEach((k) => { if (old[k] !== undefined && old[k] !== null) s[k] = old[k]; });
  s.lessonsTouched = { ...s.lessonsTouched, ...(old.lessonsTouched || {}) };
  s.migratedFrom = key;
  // Rebuild practice days from the old streak counter
  const last = normalizeDate(old.lastPracticeDate);
  if (last) {
    const n = Math.max(1, Math.min(60, Number(old.streak) || 1));
    for (let i = 0; i < n; i++) s.activeDays.push(addDays(last, -i));
    s.lastPracticeDate = old.lastPracticeDate;
  }
  s.lastClb = bandToNumber(old.lastBand);
  return s;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const base = defaultState();
      return {
        ...base,
        ...parsed,
        lessonsTouched: { ...base.lessonsTouched, ...(parsed.lessonsTouched || {}) },
        settings: { ...base.settings, ...(parsed.settings || {}) },
      };
    }
    for (const key of LEGACY_KEYS) {
      const old = localStorage.getItem(key);
      if (old) {
        const s = migrateLegacy(JSON.parse(old), key);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); // legacy key is left untouched as a backup
        return s;
      }
    }
  } catch (e) {
    console.warn("Could not read saved progress", e);
  }
  return defaultState();
}

function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) { console.warn("Save failed", e); }
}

let state = loadState();

/* Seed Day 1 as done: the baseline email was written on Oct 5 */
if (!state.challengeSeeded) {
  state.challengeDone[LEARNER.challengeStart] = true;
  state.challengeSeeded = true;
  saveState(state);
}

/* ---------- Streak ---------- */
function bumpStreak() {
  const t = todayISO();
  if (!state.activeDays.includes(t)) state.activeDays.push(t);
  if (state.activeDays.length > 400) state.activeDays = state.activeDays.slice(-400);
  // keep the v1 fields in sync too
  const now = new Date();
  const y = new Date(); y.setDate(y.getDate() - 1);
  if (state.lastPracticeDate !== legacyKey(now)) {
    state.streak = state.lastPracticeDate === legacyKey(y) ? state.streak + 1 : 1;
    state.lastPracticeDate = legacyKey(now);
  }
  saveState(state);
}

function practiceDaySet() {
  const set = new Set(state.activeDays);
  Object.keys(state.challengeDone).forEach((k) => { if (state.challengeDone[k]) set.add(k); });
  return set;
}

function computeStreak() {
  const set = practiceDaySet();
  let d = todayISO();
  if (!set.has(d)) d = addDays(d, -1);
  let n = 0;
  while (set.has(d)) { n++; d = addDays(d, -1); }
  return n;
}

/* ---------- 30-day challenge ---------- */
const BASELINE = [
  { label: "Baseline: Writing", plan: "Your Day 1 email to the building manager about the heating vents and dishwasher. Done! It scored about CLB 8 to 9, and your watch list came from it.", act: { t: "prompt", id: "t1-heat", type: "t1" }, cta: "Open the heating prompt" },
  { label: "Baseline: Speaking", plan: "Record yourself answering one CELPIP speaking task on your phone (outside this app). Then do the Daily Brain Warm-up.", act: { t: "warmup" }, cta: "Start warm-up" },
  { label: "Baseline: Reading", plan: "Do one CELPIP reading practice set (outside this app). Then flip through 10 phrase cards.", act: { t: "phrases" }, cta: "Open phrase cards" },
  { label: "Baseline: Listening", plan: "Do one CELPIP listening practice set (outside this app). Then play Connector Rush.", act: { t: "game", id: "connect" }, cta: "Play Connector Rush" },
];
const PRACTICE = [
  { plan: "Lesson 2: Tone and Grammar. Fix the threats and you/your mistakes from Day 1.", act: { t: "lesson", n: 2 } },
  { plan: "Rewrite your Day 1 heating email using the 5 bites. Then compare with the model answer.", act: { t: "prompt", id: "t1-heat", type: "t1" } },
  { plan: "Task 1: Co-op deadline extension.", act: { t: "prompt", id: "t1-coop", type: "t1" } },
  { plan: "Task 2: Oakville transit or parking. Use the planner first.", act: { t: "prompt", id: "t2-transit", type: "t2" } },
  { plan: "Error Hunt, then Lesson 1: Fill the Gaps.", act: { t: "game", id: "errors" } },
  { plan: "Task 1: Recruiter thank-you and next steps.", act: { t: "prompt", id: "t1-recruiter", type: "t1" } },
  { plan: "Task 1: Reference request to your former manager.", act: { t: "prompt", id: "t1-reference", type: "t1" } },
  { plan: "Task 2: Work from home or office?", act: { t: "prompt", id: "t2-remote", type: "t2" } },
  { plan: "Task 1: GO Train delay made you late.", act: { t: "prompt", id: "t1-go", type: "t1" } },
  { plan: "Brain Warm-up plus phrase bank review. Star 5 favourites.", act: { t: "warmup" } },
  { plan: "Task 1: Rent increase notice.", act: { t: "prompt", id: "t1-rent", type: "t1" } },
  { plan: "Task 2: Should Sheridan require co-op?", act: { t: "prompt", id: "t2-coop", type: "t2" } },
  { plan: "Task 1: Noisy upstairs neighbour.", act: { t: "prompt", id: "t1-noise", type: "t1" } },
  { plan: "Task 1: Reschedule an interview.", act: { t: "prompt", id: "t1-reschedule", type: "t1" } },
  { plan: "Task 2: Community centre funding.", act: { t: "prompt", id: "t2-centre", type: "t2" } },
  { plan: "Brain Warm-up plus Sandwich Sort.", act: { t: "game", id: "sandwich" } },
  { plan: "Task 1: Cancel a gym membership.", act: { t: "prompt", id: "t1-gym", type: "t1" } },
  { plan: "Task 1: Research assistant opportunity.", act: { t: "prompt", id: "t1-professor", type: "t1" } },
  { plan: "Task 2: Building party room makeover.", act: { t: "prompt", id: "t2-room", type: "t2" } },
  { plan: "Task 1: Recommend a Niagara weekend (informal tone).", act: { t: "prompt", id: "t1-niagara", type: "t1" } },
  { plan: "Task 1: ServiceOntario card delay.", act: { t: "prompt", id: "t1-serviceontario", type: "t1" } },
  { plan: "Task 2: Company training budget.", act: { t: "prompt", id: "t2-training", type: "t2" } },
  { plan: "Lesson 3: Full timed draft, 27 minutes, no breaks.", act: { t: "lesson", n: 3 } },
  { plan: "Watch list review, then Error Hunt. Aim for a perfect round.", act: { t: "game", id: "errors" } },
  { plan: "Redo your weakest prompt from the writing history.", act: { t: "weakest" } },
  { plan: "Mock test: one Task 1 and one Task 2 back to back. You are ready!", act: { t: "mock" } },
];
const CHALLENGE = (() => {
  const days = [];
  for (let i = 0; i < 30; i++) {
    const date = addDays(LEARNER.challengeStart, i);
    if (i < 4) days.push({ n: i + 1, date, base: true, label: BASELINE[i].label, plan: BASELINE[i].plan, act: BASELINE[i].act, cta: BASELINE[i].cta });
    else days.push({ n: i + 1, date, base: false, label: "Practice", plan: PRACTICE[i - 4].plan, act: PRACTICE[i - 4].act, cta: "Start" });
  }
  return days;
})();
function challengeDoneCount() { return CHALLENGE.filter((d) => state.challengeDone[d.date]).length; }
function todayChallenge() { return CHALLENGE.find((d) => d.date === todayISO()) || null; }

function runAction(a) {
  if (!a) return;
  if (a.t === "prompt") openPrompt(a.type, a.id);
  else if (a.t === "warmup") Games.warmup();
  else if (a.t === "game") Games.start(a.id, {});
  else if (a.t === "phrases") openPhrases();
  else if (a.t === "lesson") { if (a.n === 1) startLesson(false); else if (a.n === 2) startLesson2(); else startLesson3(false); }
  else if (a.t === "weakest") {
    const scored = state.attempts.filter((x) => x.kind !== "l3");
    if (!scored.length) { FX.toast("No attempts yet. Start with the heating email."); openPrompt("t1", "t1-heat"); return; }
    const w = scored.reduce((m, x) => (x.overall < m.overall ? x : m), scored[0]);
    openPrompt(w.type, w.id);
  } else if (a.t === "mock") { goTab("write"); FX.toast("Pick one Task 1, then one Task 2. Timer on!"); }
}

/* ---------- Navigation ---------- */
let currentTab = "home";

function showScreen(id, opts = {}) {
  if (id !== "screen-writer") stopWriterTimer();
  const el = $(id);
  const deep = el.classList.contains("deep");
  document.querySelectorAll(".screen").forEach((s) => {
    const on = s === el;
    s.classList.toggle("active", on);
    s.classList.remove("from-left");
    if (on) s.removeAttribute("hidden");
    else s.setAttribute("hidden", "");
  });
  if (opts.fromLeft) el.classList.add("from-left");
  document.body.classList.toggle("is-deep", deep);
  if (deep && !(history.state && history.state.deep)) history.pushState({ deep: true }, "", location.href);
  window.scrollTo(0, 0);
}

function goTab(tab) {
  if (!TABS.includes(tab)) tab = "home";
  Games.abort();
  const fromLeft = TABS.indexOf(tab) < TABS.indexOf(currentTab);
  currentTab = tab;
  document.body.dataset.lastTab = tab;
  renderTab(tab);
  showScreen(`screen-${tab}`, { fromLeft });
  document.querySelectorAll(".tab-btn").forEach((b) => {
    const on = b.dataset.tab === tab;
    b.classList.toggle("active", on);
    if (on) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
  });
  $("appbar-title").textContent = TAB_TITLES[tab];
  history.replaceState(null, "", `#${tab}`);
}

/* Legacy helpers used by lessons.js */
function goHome() { goTab(document.body.dataset.lastTab || "home"); }
function refreshHomeMeta() { refreshAll(); }

function leaveDeep() {
  stopWriterTimer();
  Games.abort();
  goTab(document.body.dataset.lastTab || "home");
}

window.addEventListener("popstate", () => {
  if (document.body.classList.contains("is-deep")) leaveDeep();
  else {
    const t = location.hash.slice(1);
    if (TABS.includes(t) && t !== currentTab) goTab(t);
  }
});

function renderTab(tab) {
  refreshStreak();
  if (tab === "home") renderHome();
  else if (tab === "learn") renderLearn();
  else if (tab === "games") renderGames();
  else if (tab === "write") renderWriteList();
  else if (tab === "progress") renderProgress();
}

function refreshAll() {
  refreshStreak();
  const active = document.querySelector(".screen.tab.active");
  if (active) renderTab(active.dataset.tab);
}

function refreshStreak() {
  const n = computeStreak();
  const el = $("streak-count");
  if (el.textContent !== String(n)) { el.textContent = String(n); FX.pop($("streak-display")); }
  $("streak-display").title = `${n} day practice streak`;
}

/* ---------- Theme and settings ---------- */
function applySettings() {
  const dark = state.settings.theme === "dark";
  document.documentElement.toggleAttribute("data-theme", false);
  if (dark) document.documentElement.setAttribute("data-theme", "dark");
  document.documentElement.classList.toggle("reduce-motion", !!state.settings.reduceMotion);
  document.querySelector(".theme-icon").textContent = dark ? "☀️" : "🌙";
  $("btn-theme").setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  document.querySelector('meta[name="theme-color"]').setAttribute("content", dark ? "#0f1c2e" : "#1d3557");
  $("set-dark").checked = dark;
  $("set-motion").checked = !!state.settings.reduceMotion;
}
function toggleTheme(force) {
  const dark = typeof force === "boolean" ? force : state.settings.theme !== "dark";
  state.settings.theme = dark ? "dark" : "light";
  saveState(state);
  applySettings();
}

/* ---------- Home ---------- */
function ringsInto(container, size) {
  container.innerHTML = "";
  const streak = computeStreak();
  const clb = state.lastClb;
  const done = challengeDoneCount();
  const items = [
    FX.ring({ value: Math.min(streak, 30), max: 30, size, center: `🔥${streak}`, sub: "day streak", cls: "streak" }),
    FX.ring({ value: clb || 0, max: LEARNER.target, size, center: clb ? `CLB ${clb}` : "–", sub: "target 10", cls: "clb" }),
    FX.ring({ value: done, max: 30, size, center: `${done}/30`, sub: "days done", cls: "cal" }),
  ];
  const caps = ["Streak", "Latest estimate", "30-day challenge"];
  items.forEach((r, i) => {
    const c = document.createElement("div");
    c.className = "ring-caption";
    c.textContent = caps[i];
    r.appendChild(c);
    container.appendChild(r);
  });
}

function renderHome() {
  ringsInto($("home-rings"), 96);
  // Today card
  const t = todayChallenge();
  const tc = $("today-card");
  const today = todayISO();
  if (t) {
    const done = !!state.challengeDone[t.date];
    tc.innerHTML = `
      <div class="today-top">
        <div class="day-badge"><small>Day</small><b>${t.n}</b></div>
        <div style="flex:1;min-width:0">
          <p class="muted tiny">${fromISO(t.date).toLocaleDateString("en-CA", { weekday: "long", month: "short", day: "numeric" })}</p>
          <h2>${esc(t.label)}</h2>
        </div>
        ${done ? '<span class="chip good">Done ✓</span>' : ""}
      </div>
      <p class="muted" style="margin-top:8px">${esc(t.plan)}</p>
      <div class="btn-row">
        <button type="button" class="btn-primary" id="btn-today-go">${esc(t.cta)}</button>
        <button type="button" class="btn-secondary" id="btn-today-done" style="margin-top:8px">${done ? "Undo" : "Mark done"}</button>
      </div>`;
    $("btn-today-go").onclick = () => runAction(t.act);
    $("btn-today-done").onclick = (e) => toggleDay(t.date, e.currentTarget);
  } else if (today < LEARNER.challengeStart) {
    tc.innerHTML = `<h2>30-day challenge starts Oct 5</h2><p class="muted">Warm up with a brain game today.</p>`;
  } else {
    const n = challengeDoneCount();
    tc.innerHTML = `<h2>Challenge finished 🎓</h2><p class="muted">You completed ${n} of 30 days. Keep a small daily habit going.</p>
      <button type="button" class="btn-primary" id="btn-today-go">Write a Task 1</button>`;
    $("btn-today-go").onclick = () => goTab("write");
  }
  // Warm-up
  const ids = dailyWarmupIds(today);
  const warmDone = !!state.warmups[today];
  $("warmup-games").innerHTML = ids.map((id) => {
    const g = GAMES.find((x) => x.id === id);
    const playedToday = state.games[id] && state.games[id].lastDate === today;
    return `<div class="warmup-game${playedToday ? " done" : ""}"><span>${g.icon}</span>${esc(g.name)}</div>`;
  }).join("");
  $("warmup-status").textContent = warmDone ? "Done today ✓" : "3 short games";
  $("warmup-status").className = `chip${warmDone ? " good" : ""}`;
  $("btn-warmup").textContent = warmDone ? "Play it again" : "Start warm-up";
  // Watch chips
  const wc = $("watch-chips");
  if (!wc.dataset.ready) {
    wc.innerHTML = WATCH_LIST.map((w) => `<button type="button" class="watch-chip" data-w="${w.id}">${w.icon} ${esc(w.title)}</button>`).join("");
    wc.querySelectorAll(".watch-chip").forEach((b) => b.addEventListener("click", () => {
      const wasActive = b.classList.contains("active");
      wc.querySelectorAll(".watch-chip").forEach((x) => x.classList.remove("active"));
      const d = $("watch-detail");
      if (wasActive) { d.hidden = true; return; }
      b.classList.add("active");
      const w = WATCH_LIST.find((x) => x.id === b.dataset.w);
      d.hidden = false;
      d.innerHTML = watchHtml(w);
      d.classList.remove("watch-detail"); void d.offsetWidth; d.classList.add("watch-detail");
    }));
    wc.dataset.ready = "1";
  }
}

function watchHtml(w) {
  return `<div class="bad-line"><b>Day 1</b>${esc(w.bad)}</div><div class="good-line"><b>CLB 10</b>${esc(w.good)}</div><p class="kid-line">👶 ${esc(w.kid)}</p>`;
}

function toggleDay(date, el) {
  if (date > todayISO()) { FX.toast("That day has not arrived yet. One day at a time!"); FX.shake(el); return; }
  const now = !state.challengeDone[date];
  if (now) state.challengeDone[date] = true;
  else delete state.challengeDone[date];
  saveState(state);
  if (now) {
    FX.confetti({ el, count: 60 });
    FX.coach("done", challengeDoneCount() >= 30 ? "All 30 days! You did it, Afolabi!" : `Day ${CHALLENGE.find((d) => d.date === date).n} done. Keep the chain going!`);
  }
  refreshAll();
}

/* ---------- Learn ---------- */
function renderLearn() {
  const g = $("guides");
  if (!g.dataset.ready) {
    g.innerHTML = GUIDES.map((x, i) => `<details class="card guide"${i === 0 ? " open" : ""}><summary>👣 ${esc(x.title)}</summary><ol>${x.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol></details>`).join("");
    $("watch-full").innerHTML = WATCH_LIST.map((w) => `<div class="card watch-item"><h3>${w.icon} ${esc(w.title)}</h3>${watchHtml(w)}</div>`).join("");
    g.dataset.ready = "1";
  }
  const meta = (n, c) => {
    const m = $(`l${n}-meta`), cta = $(`l${n}-cta`);
    if (c > 0) { m.textContent = `Completed ${c}×`; cta.textContent = "Again"; }
    else { m.textContent = "Not started"; cta.textContent = "Start"; }
  };
  meta(1, state.lesson1Completions);
  meta(2, state.lesson2Completions);
  meta(3, state.lesson3Completions);
}

/* ---------- Games tab ---------- */
function renderGames() {
  const today = todayISO();
  const ids = dailyWarmupIds(today);
  const warmDone = !!state.warmups[today];
  $("warmup-list-2").textContent = `Today: ${ids.map((id) => GAMES.find((g) => g.id === id).name).join(", ")} (short versions).`;
  $("warmup-status-2").textContent = warmDone ? "Done today ✓" : "3 short games";
  $("warmup-status-2").className = `chip${warmDone ? " good" : ""}`;
  $("game-grid").innerHTML = GAMES.map((g) => {
    const r = state.games[g.id];
    return `<button type="button" class="game-card" data-game="${g.id}">
      <span class="game-icon" aria-hidden="true">${g.icon}</span>
      <h3>${esc(g.name)}</h3><p>${esc(g.desc)}</p>
      <span class="game-best">${r ? `Best ${r.best} · played ${r.plays}×` : esc(g.time)}</span></button>`;
  }).join("");
  $("game-grid").querySelectorAll(".game-card").forEach((b) => b.addEventListener("click", () => Games.start(b.dataset.game, {})));
}

/* ---------- Progress ---------- */
let selectedDay = null;
function renderProgress() {
  ringsInto($("progress-rings"), 96);
  const cal = $("calendar");
  const today = todayISO();
  const startDow = (fromISO(LEARNER.challengeStart).getDay() + 6) % 7; // Monday = 0
  let html = "";
  for (let i = 0; i < startDow; i++) html += `<span class="cal-day blank"></span>`;
  CHALLENGE.forEach((d) => {
    const cls = ["cal-day", d.base ? "base" : "prac"];
    if (state.challengeDone[d.date]) cls.push("done");
    if (d.date === today) cls.push("today");
    if (d.date > today) cls.push("future");
    if (selectedDay === d.date) cls.push("sel");
    const tag = d.base ? { Writing: "Write", Speaking: "Speak", Reading: "Read", Listening: "Listen" }[d.label.split(": ")[1]] : `Day ${d.n}`;
    const dt = fromISO(d.date);
    html += `<button type="button" class="${cls.join(" ")}" data-date="${d.date}" role="gridcell"
      aria-label="Day ${d.n}, ${dt.toLocaleDateString("en-CA", { month: "short", day: "numeric" })}, ${esc(d.label)}${state.challengeDone[d.date] ? ", done" : ""}">
      ${dt.getDate()}<small>${esc(tag)}</small></button>`;
  });
  cal.innerHTML = html;
  cal.querySelectorAll(".cal-day[data-date]").forEach((b) => b.addEventListener("click", () => {
    selectedDay = b.dataset.date;
    toggleDay(b.dataset.date, b);
    const nb = cal.querySelector(`[data-date="${selectedDay}"]`);
    if (nb) nb.classList.add("just");
  }));
  $("cal-count").textContent = `${challengeDoneCount()}/30`;
  const show = CHALLENGE.find((d) => d.date === (selectedDay || today)) || CHALLENGE[0];
  const dd = $("day-detail");
  dd.innerHTML = `<h3>Day ${show.n} · ${fromISO(show.date).toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" })} · ${esc(show.label)}</h3>
    <p class="muted">${esc(show.plan)}</p>
    <button type="button" class="btn-primary" id="btn-day-go">${esc(show.cta)}</button>`;
  $("btn-day-go").onclick = () => runAction(show.act);

  $("best-list").innerHTML = GAMES.map((g) => {
    const r = state.games[g.id];
    return `<div class="best-row"><span>${g.icon} ${esc(g.name)}</span><b>${r ? r.best : "–"}</b></div>`;
  }).join("");
  const hist = state.attempts.slice(0, 8);
  $("history").innerHTML = hist.length
    ? hist.map((a) => `<div class="hist-row"><span>${esc(promptTitle(a))}<br><span class="muted tiny">${esc(a.date)} · ${a.words} words</span></span><b>CLB ${a.clb}</b></div>`).join("")
    : `<p class="muted small">No timed drafts yet. Your estimates will show here.</p>`;
  const lessons = [state.lesson1Completions, state.lesson2Completions, state.lesson3Completions];
  $("version-note").textContent = `CELPIP Coach v4 · Lessons done ${lessons.filter((x) => x > 0).length}/3 · progress is saved on this device only${state.migratedFrom ? " · earlier progress carried over" : ""}`;
}

function promptTitle(a) {
  const p = findPrompt(a.type, a.id);
  if (p) return `${a.type === "t2" ? "Task 2" : "Task 1"} · ${p.title}`;
  return "Lesson 3 · timed draft";
}

/* ---------- Phrase bank ---------- */
const phraseKey = (p) => `${p.g}|${p.basic}`;
let phraseFilter = "All", phraseList = PHRASES, phraseIdx = 0;
function openPhrases() {
  const groups = ["All", "★ Starred", ...PHRASE_GROUPS];
  $("phrase-groups").innerHTML = groups.map((g) => `<button type="button" class="chip-btn${g === phraseFilter ? " active" : ""}" data-g="${esc(g)}">${esc(g)}</button>`).join("");
  $("phrase-groups").querySelectorAll(".chip-btn").forEach((b) => b.addEventListener("click", () => {
    phraseFilter = b.dataset.g;
    phraseIdx = 0;
    $("phrase-groups").querySelectorAll(".chip-btn").forEach((x) => x.classList.toggle("active", x === b));
    filterPhrases();
    renderFlash();
  }));
  filterPhrases();
  showScreen("screen-phrases");
  renderFlash();
}
function filterPhrases() {
  if (phraseFilter === "All") phraseList = PHRASES;
  else if (phraseFilter === "★ Starred") phraseList = PHRASES.filter((p) => state.favPhrases.includes(phraseKey(p)));
  else phraseList = PHRASES.filter((p) => p.g === phraseFilter);
}
function renderFlash(dir) {
  const f = $("flash");
  f.classList.remove("flipped", "swipe-l", "swipe-r");
  if (!phraseList.length) {
    f.innerHTML = `<div class="flash-inner"><div class="flash-face flash-front"><p class="center muted">No starred phrases yet. Tap ☆ on any card to save it here.</p></div></div>`;
    $("flash-pos").textContent = "";
    $("flash-star").classList.remove("on");
    $("flash-star").textContent = "☆";
    return;
  }
  phraseIdx = (phraseIdx + phraseList.length) % phraseList.length;
  const p = phraseList[phraseIdx];
  f.innerHTML = `<div class="flash-inner">
    <div class="flash-face flash-front"><span class="tag">${esc(p.g)} · instead of</span><p class="txt">${esc(p.basic)}</p><span class="hint">Tap to see the CLB 10 version</span></div>
    <div class="flash-face flash-back"><span class="tag">CLB 10 · ${esc(p.g)}</span><p class="txt">${esc(p.clb)}</p><span class="hint">Swipe for the next card</span></div></div>`;
  if (dir) { void f.offsetWidth; f.classList.add(dir === "next" ? "swipe-l" : "swipe-r"); }
  $("flash-pos").textContent = `${phraseIdx + 1} of ${phraseList.length}`;
  const on = state.favPhrases.includes(phraseKey(p));
  $("flash-star").classList.toggle("on", on);
  $("flash-star").textContent = on ? "★" : "☆";
  $("flash-star").setAttribute("aria-pressed", String(on));
}
function flashMove(d) { if (!phraseList.length) return; phraseIdx += d; renderFlash(d > 0 ? "next" : "prev"); }
function wirePhrases() {
  const f = $("flash");
  let x0 = null, y0 = null, moved = false;
  f.addEventListener("pointerdown", (e) => { x0 = e.clientX; y0 = e.clientY; moved = false; });
  f.addEventListener("pointermove", (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    if (Math.abs(dx) > 8) { moved = true; if (!FX.reduced()) f.style.transform = `translateX(${dx * 0.4}px) rotate(${dx * 0.03}deg)`; }
  });
  const end = (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0, dy = e.clientY - y0;
    f.style.transform = "";
    x0 = null;
    if (moved && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) flashMove(dx < 0 ? 1 : -1);
    else if (!moved) f.classList.toggle("flipped");
  };
  f.addEventListener("pointerup", end);
  f.addEventListener("pointercancel", () => { x0 = null; f.style.transform = ""; });
  f.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") flashMove(1);
    else if (e.key === "ArrowLeft") flashMove(-1);
    else if (e.key === " " || e.key === "Enter") { e.preventDefault(); f.classList.toggle("flipped"); }
  });
  $("flash-prev").onclick = () => flashMove(-1);
  $("flash-next").onclick = () => flashMove(1);
  $("flash-star").onclick = () => {
    if (!phraseList.length) return;
    const k = phraseKey(phraseList[phraseIdx]);
    const i = state.favPhrases.indexOf(k);
    if (i >= 0) state.favPhrases.splice(i, 1);
    else { state.favPhrases.push(k); FX.confetti({ el: $("flash-star"), count: 18 }); }
    saveState(state);
    FX.pop($("flash-star"));
    if (phraseFilter === "★ Starred") { filterPhrases(); renderFlash(); }
    else renderFlash();
  };
}

/* ---------- Write: prompt list ---------- */
let writeSeg = "t1";
function findPrompt(type, id) { return (type === "t2" ? T2_PROMPTS : T1_PROMPTS).find((p) => p.id === id); }

function renderWriteList() {
  document.querySelectorAll(".seg").forEach((b) => {
    const on = b.dataset.seg === writeSeg;
    b.classList.toggle("active", on);
    b.setAttribute("aria-selected", String(on));
  });
  $("write-intro").textContent = writeSeg === "t1"
    ? "Task 1 · Writing an Email · 27 minutes · 150 to 200 words. Model answers unlock after you try."
    : "Task 2 · Responding to Survey Questions · 26 minutes · 150 to 200 words. Choose Option A or B.";
  const list = writeSeg === "t1" ? T1_PROMPTS : T2_PROMPTS;
  $("prompt-list").innerHTML = list.map((p) => {
    const tries = state.attempts.filter((a) => a.id === p.id).length;
    const best = state.bestClb[p.id];
    return `<button type="button" class="card prompt-card" data-id="${p.id}">
      <span class="prompt-icon" aria-hidden="true">${p.icon}</span>
      <span class="prompt-main"><h3>${esc(p.title)}</h3>
        <span class="meta">${writeSeg === "t1" ? `To ${esc(p.to)} · ${esc(p.tag)}` : "Option A or B"}${tries ? ` · ${tries} ${tries === 1 ? "try" : "tries"}` : ""}</span></span>
      ${best ? `<span class="chip good">CLB ${best}</span>` : state.attempted[p.id] ? '<span class="chip">Tried</span>' : '<span class="chevron chev">›</span>'}</button>`;
  }).join("");
  $("prompt-list").querySelectorAll(".prompt-card").forEach((b) => b.addEventListener("click", () => openPrompt(writeSeg, b.dataset.id)));
}

function celpipBoxHtml(type, p) {
  if (type === "t2") {
    return `<div class="celpip-box"><div class="celpip-head"><span>Writing Task 2: Responding to Survey Questions</span><span class="clock">26:00</span></div>
      <div class="celpip-body">
        <p class="instr">Read the following information.</p>
        <p>${esc(p.situation)}</p>
        <div class="options"><div class="option"><b>Option A:</b> ${esc(p.optionA)}</div><div class="option"><b>Option B:</b> ${esc(p.optionB)}</div></div>
        <p class="instr">Choose the option that you prefer. Why do you prefer your choice? Explain the reasons for your choice. Write about 150 to 200 words.</p>
      </div></div>`;
  }
  return `<div class="celpip-box"><div class="celpip-head"><span>Writing Task 1: Writing an Email</span><span class="clock">27:00</span></div>
    <div class="celpip-body">
      <p class="instr">Read the following information.</p>
      <p>${esc(p.situation)}</p>
      <p class="instr">Write an email to ${esc(p.to)} in about 150 to 200 words. Your email should do the following things:</p>
      <ul>${p.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
    </div></div>`;
}

function openPrompt(type, id) {
  const p = findPrompt(type, id);
  if (!p) return;
  $("prompt-title").textContent = p.title;
  const tries = state.attempts.filter((a) => a.id === id);
  const best = state.bestClb[id];
  const pb = $("prompt-body");
  pb.innerHTML = `${celpipBoxHtml(type, p)}
    ${tries.length ? `<p class="muted small" style="margin-bottom:8px">You tried this ${tries.length}× · best estimate CLB ${best}</p>` : ""}
    ${state.drafts[id] ? '<p class="chip warn" style="margin-bottom:8px">You have a saved draft</p>' : ""}
    <button type="button" class="btn-primary" id="btn-prompt-start">Start timed practice (${type === "t2" ? 26 : 27} min)</button>
    <h2 class="section-title">CLB 10 model answer</h2>
    <div id="model-slot"></div>`;
  $("btn-prompt-start").onclick = () => openWriter({ kind: type, type, id, prompt: p, title: p.title, minutes: type === "t2" ? 26 : 27, keywords: p.keywords });
  renderModelSlot($("model-slot"), type, p);
  showScreen("screen-prompt");
}

function renderModelSlot(slot, type, p) {
  if (!state.attempted[p.id]) {
    slot.innerHTML = `<div class="card lock-card"><div class="lock-emoji">🔒</div>
      <p><b>Write first, then peek.</b></p><p class="muted small">The model answer unlocks after you submit a draft. Trying first is how your brain learns.</p>
      <button type="button" class="linkish" id="btn-unlock-paper">I wrote it on paper. Unlock it.</button></div>`;
    $("btn-unlock-paper").onclick = () => {
      if (!confirm("Did you really write your own answer first?")) return;
      state.attempted[p.id] = true;
      saveState(state);
      renderModelSlot(slot, type, p);
    };
    return;
  }
  slot.innerHTML = `<button type="button" class="btn-secondary" id="btn-reveal-model">✨ Reveal the model answer</button>`;
  $("btn-reveal-model").onclick = () => { slot.innerHTML = ""; slot.appendChild(modelCard(type, p)); FX.confetti({ el: slot, count: 30 }); };
}

function highlightHtml(text, highlights) {
  const ranges = [];
  highlights.forEach((h, i) => {
    const s = text.indexOf(h.p);
    if (s >= 0) ranges.push({ s, e: s + h.p.length, i });
  });
  ranges.sort((a, b) => a.s - b.s);
  let out = "", pos = 0;
  ranges.forEach((r) => {
    if (r.s < pos) return;
    out += esc(text.slice(pos, r.s)) + `<mark data-i="${r.i}" tabindex="0">${esc(text.slice(r.s, r.e))}</mark>`;
    pos = r.e;
  });
  return out + esc(text.slice(pos));
}

function modelCard(type, p) {
  const body = type === "t2" ? p.model : p.model.body;
  const words = CHECKER.wordCount(body);
  const wrap = document.createElement("div");
  wrap.className = "model";
  wrap.innerHTML = `<div class="card model-inner" id="model-card">
    <div class="card-head"><h2>Model answer${type === "t2" ? ` · Option ${p.choice}` : ""}</h2><span class="chip good wc-badge">${words} words ✓</span></div>
    ${type === "t2" ? "" : `<div class="email-row"><span class="email-key">Subject:</span> <b>${esc(p.model.subject)}</b></div>`}
    <div class="model-email">${highlightHtml(body, p.highlights)}</div>
    <div class="hl-tip" id="hl-tip" hidden></div>
    <p class="muted tiny" style="margin-top:8px">Tap a yellow phrase to see why it scores high. Word count is the body only (${words}, target 150 to 200).</p>
  </div>
  <div class="card">
    <div class="card-head"><h2>Why these phrases score high</h2></div>
    <ul class="hl-list">${p.highlights.map((h) => `<li><q>${esc(h.p)}</q><br>${esc(h.why)}</li>`).join("")}</ul>
  </div>
  <div class="card">
    <div class="card-head"><h2>Why this is CLB 10</h2></div>
    <ul class="why-list">${p.why.map((w) => `<li>${esc(w)}</li>`).join("")}</ul>
  </div>`;
  wrap.querySelectorAll("mark").forEach((m) => {
    const show = () => {
      wrap.querySelectorAll("mark").forEach((x) => x.classList.toggle("on", x === m));
      const tip = wrap.querySelector("#hl-tip");
      tip.hidden = false;
      tip.innerHTML = `<b>Why it works:</b> ${esc(p.highlights[Number(m.dataset.i)].why)}`;
      tip.classList.remove("hl-tip"); void tip.offsetWidth; tip.classList.add("hl-tip");
    };
    m.addEventListener("click", show);
    m.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(); } });
  });
  return wrap;
}

/* ---------- Writer (timed) ---------- */
let writer = null;
let writerTimerId = null;
let saveTimer = null;

function stopWriterTimer() {
  if (writerTimerId) { clearInterval(writerTimerId); writerTimerId = null; }
}

function openWriter(cfg) {
  stopWriterTimer();
  writer = { cfg, total: cfg.minutes * 60, secondsLeft: cfg.minutes * 60, submitted: false };
  const t2 = cfg.type === "t2";
  $("writer-kind").textContent = cfg.kind === "l3" ? "Lesson 3 · Timed Task 1" : t2 ? "Timed Task 2" : "Timed Task 1";
  $("writer-subject-wrap").hidden = t2;
  $("writer-body-label").textContent = t2 ? "Your response" : "Email body";
  $("writer-body").placeholder = t2
    ? "I believe Option ... is the better choice.\n\nFirst, ...\nFor example, ...\n\nSecond, ...\n\nSome people may argue that ...\n\nFor these reasons, ..."
    : "Dear ...,\n\nWho I am\nWhy I write\nHow it hurts me\nWhat I want (+ polite timeline)\n\nThank you\nAfolabi Adesina";
  const p = cfg.prompt;
  $("writer-prompt").innerHTML = cfg.kind === "l3"
    ? `<p>${esc(cfg.promptText)}</p><p class="scenario-eyebrow" style="margin-top:8px">Use the 5 bites: Who · Why · Hurt · Ask · Thanks</p>`
    : t2
      ? `<p>${esc(p.situation)}</p><p style="margin-top:6px"><b>A:</b> ${esc(p.optionA)}</p><p><b>B:</b> ${esc(p.optionB)}</p>`
      : `<p>${esc(p.situation)}</p><p style="margin-top:6px"><b>Write to ${esc(p.to)}:</b></p><ul>${p.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`;
  $("writer-prompt-box").open = true;
  const d = state.drafts[cfg.id] || {};
  $("writer-subject").value = d.subject || "";
  $("writer-body").value = d.body || "";
  renderPlanner(t2, d);
  $("writer-check").hidden = true;
  updateWriterMeta();
  updateWriterTimer();
  showScreen("screen-writer");
  if (d.body) FX.toast("Your saved draft is back. Timer restarted.");
  writerTimerId = setInterval(() => {
    if (!writer || writer.submitted) return;
    writer.secondsLeft -= 1;
    updateWriterTimer();
    if (writer.secondsLeft === 300) FX.toast("5 minutes left. Check your sign-off and word count.");
    if (writer.secondsLeft <= 0) { stopWriterTimer(); submitWriter(true); }
  }, 1000);
}

function renderPlanner(t2, d) {
  const pl = $("writer-planner");
  pl.hidden = !t2;
  if (!t2) { pl.innerHTML = ""; return; }
  const plan = d.plan || {};
  pl.innerHTML = `<div class="card-head"><h2>Task 2 planner</h2><span class="chip">2 to 3 minutes</span></div>
    <p class="muted small" style="margin-bottom:8px">Pick a side, jot quick notes, then write. Notes are saved but not scored.</p>
    <div class="options" style="grid-template-columns:1fr 1fr;margin-bottom:10px">
      <button type="button" class="option${d.option === "A" ? " active" : ""}" data-opt="A"><b>Option A</b></button>
      <button type="button" class="option${d.option === "B" ? " active" : ""}" data-opt="B"><b>Option B</b></button>
    </div>
    ${T2_PLANNER.map((s) => `<div class="plan-row"><label for="plan-${s.key}">${esc(s.label)}</label><p class="hint">${esc(s.hint)}</p><textarea id="plan-${s.key}" data-plan="${s.key}" rows="1">${esc(plan[s.key] || "")}</textarea></div>`).join("")}
    <button type="button" class="btn-secondary" id="btn-plan-outline">Turn my plan into an outline</button>`;
  pl.querySelectorAll("[data-opt]").forEach((b) => b.addEventListener("click", () => {
    pl.querySelectorAll("[data-opt]").forEach((x) => x.classList.toggle("active", x === b));
    FX.pop(b);
    queueSave();
  }));
  pl.querySelectorAll("textarea").forEach((t) => t.addEventListener("input", queueSave));
  $("btn-plan-outline").onclick = () => {
    const opt = (pl.querySelector("[data-opt].active") || {}).dataset;
    const choice = opt ? opt.opt : "A";
    const v = (k) => ($(`plan-${k}`).value || "").trim();
    const parts = [
      `I believe Option ${choice} is the better choice. ${v("opinion")}`.trim(),
      `First, ${v("r1") || "..."} For example, ...`,
      `Second, ${v("r2") || "..."} For instance, ...`,
      `Some people may argue that ${v("other") || "..."} That is a fair point, but ...`,
      `For these reasons, I strongly support Option ${choice}. ${v("close")}`.trim(),
    ];
    const body = $("writer-body");
    if (body.value.trim() && !confirm("Add the outline below what you already wrote?")) return;
    body.value = (body.value.trim() ? body.value.trim() + "\n\n" : "") + parts.join("\n\n");
    updateWriterMeta();
    queueSave();
    body.focus();
  };
}

function writerValues() {
  const plan = {};
  document.querySelectorAll("#writer-planner [data-plan]").forEach((t) => { plan[t.dataset.plan] = t.value; });
  const opt = document.querySelector("#writer-planner [data-opt].active");
  return { subject: $("writer-subject").value, body: $("writer-body").value, plan, option: opt ? opt.dataset.opt : null };
}

function queueSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    if (!writer || writer.submitted) return;
    state.drafts[writer.cfg.id] = { ...writerValues(), t: Date.now() };
    saveState(state);
  }, 400);
}

function updateWriterTimer() {
  if (!writer) return;
  const s = Math.max(0, writer.secondsLeft);
  const el = $("writer-timer");
  el.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  el.classList.toggle("danger", s <= 60);
  el.classList.toggle("warn", s > 60 && s <= 300);
  const fill = $("writer-time-fill");
  fill.style.width = `${(s / writer.total) * 100}%`;
  fill.classList.toggle("low", s <= 300);
}

function updateWriterMeta() {
  const { subject, body } = writerValues();
  const n = CHECKER.wordCount(body.replace(/^\s*subject\s*:.*\n/i, ""));
  const chip = $("writer-words");
  chip.textContent = `${n} words`;
  chip.classList.toggle("ok", n >= 150 && n <= 200);
  chip.classList.toggle("over", n > 200);
  if (!writer) return;
  const quick = CHECKER.analyze({ subject, body, type: writer.cfg.type, prompt: writer.cfg.prompt || { keywords: writer.cfg.keywords } });
  const bad = quick.flags.filter((f) => f.level === "bad" && f.id !== "count" && f.id !== "subject" && f.id !== "signoff").length;
  $("writer-live").textContent = n < 150 ? `${150 - n} more to reach 150` : n > 200 ? `${n - 200} over 200` : bad ? `${bad} watch-list flag${bad > 1 ? "s" : ""}` : "Looking good";
}

function flagsHtml(flags) {
  if (!flags.length) return `<div class="flag good" style="background:var(--good-bg)"><span class="fi">✅</span><div><b>No watch-list problems found</b>Clean draft. Proud of you!</div></div>`;
  return flags.map((f, i) => `<div class="flag ${f.level}" style="animation-delay:${i * 0.04}s"><span class="fi">${f.level === "bad" ? "⛔" : "⚠️"}</span><div><b>${esc(f.title)}</b>${esc(f.detail)}</div></div>`).join("");
}

function checkWriterInline() {
  const v = writerValues();
  const r = CHECKER.analyze({ subject: v.subject, body: v.body, type: writer.cfg.type, prompt: writer.cfg.prompt || { keywords: writer.cfg.keywords } });
  const box = $("writer-check");
  box.hidden = false;
  box.innerHTML = `<div class="card-head"><h2>Draft checker</h2><span class="chip">${esc(r.label)} estimate</span></div>${flagsHtml(r.flags)}`;
  box.classList.remove("inline-check"); void box.offsetWidth; box.classList.add("inline-check");
  if (!r.flags.length) FX.confetti({ el: box, count: 40 });
  else FX.shake(box);
}

function submitWriter(fromTimer) {
  if (!writer || writer.submitted) return;
  const v = writerValues();
  if (!v.body.trim() && !fromTimer) {
    FX.shake($("writer-body"));
    FX.toast("Write your email first, then submit.");
    return;
  }
  writer.submitted = true;
  stopWriterTimer();
  const cfg = writer.cfg;
  const r = CHECKER.analyze({ subject: v.subject, body: v.body, type: cfg.type, prompt: cfg.prompt || { keywords: cfg.keywords } });
  const used = writer.total - Math.max(0, writer.secondsLeft);
  state.attempts.unshift({ id: cfg.id, kind: cfg.kind, type: cfg.type, date: todayISO(), clb: r.clb, overall: r.overall, words: r.words, secs: used, t: Date.now() });
  state.attempts = state.attempts.slice(0, 100);
  state.attempted[cfg.id] = true;
  state.bestClb[cfg.id] = Math.max(state.bestClb[cfg.id] || 0, r.clb);
  state.lastClb = r.clb;
  state.lastBand = r.label;
  state.lastScore = r.overall;
  state.lastSubmission[cfg.id] = { subject: v.subject, body: v.body, t: Date.now() };
  delete state.drafts[cfg.id];
  if (cfg.kind === "l3") {
    state.lesson3Completions += 1;
    state.lastLesson = 3;
    state.lessonsTouched[3] = true;
  }
  bumpStreak();
  saveState(state);
  renderReview(r, cfg, v, fromTimer, used);
}

function renderReview(r, cfg, v, fromTimer, used) {
  $("review-title").textContent = cfg.kind === "l3" ? "Lesson 3 · your estimate" : `${cfg.type === "t2" ? "Task 2" : "Task 1"} · your estimate`;
  const rb = $("review-body");
  const mm = `${Math.floor(used / 60)}:${String(used % 60).padStart(2, "0")}`;
  rb.innerHTML = `
    <div class="score-hero"><div id="score-ring"></div>
      <div><h3>${esc(r.label)}</h3><p>Estimate only, not an official CELPIP score. It comes from the simple rules below.</p>
      <p style="margin-top:4px">${r.words} words · ${fromTimer ? "time ran out" : `finished in ${mm}`}</p></div></div>
    <div class="card"><div class="card-head"><h2>Breakdown</h2><span class="chip">${r.overall}/100</span></div>
      ${r.cats.map((c) => `<div class="cat"><div class="cat-top"><span>${esc(c.label)}</span><span>CLB ${c.clb}${c.clb >= 10 && c.score >= 88 ? "+" : ""} · ${c.score}</span></div>
        <div class="cat-bar"><div class="cat-fill" data-w="${c.score}"></div></div>
        <details><summary>How this was scored</summary><ul>${c.notes.map((n) => `<li class="${n.ok ? "" : "no"}"><span>${n.ok ? "✓" : "·"} ${esc(n.text)}</span><span class="pts">${n.pts > 0 ? "+" : ""}${n.pts}${n.max && n.max !== n.pts ? ` of ${n.max}` : ""}</span></li>`).join("")}</ul></details></div>`).join("")}
      <p class="muted tiny">Weights: content 30%, vocabulary 25%, readability 20%, task 25%. A threat caps the estimate at CLB 9.</p>
    </div>
    <div class="card" id="review-flags"><div class="card-head"><h2>Draft checker · watch list</h2><span class="chip ${r.flags.length ? "warn" : "good"}">${r.flags.length} flag${r.flags.length === 1 ? "" : "s"}</span></div>${flagsHtml(r.flags)}</div>
    ${r.good.length ? `<div class="card"><div class="card-head"><h2>What you did well</h2></div><div class="good-chips">${r.good.map((g) => `<span class="chip good">✓ ${esc(g)}</span>`).join("")}</div></div>` : ""}
    <article class="email-preview">
      ${cfg.type === "t2" ? "" : `<div class="email-row"><span class="email-key">Subject:</span> <span id="email-subject-rv">${esc(r.subject || "(no subject)")}</span></div>`}
      <div class="email-body">${esc(v.body.trim() || "(empty)")}</div>
    </article>
    <div id="review-model"></div>
    <div class="result-actions">
      <button type="button" class="btn-primary" id="btn-rv-again">${cfg.kind === "l3" ? "Another timed prompt" : "Try this prompt again"}</button>
      <button type="button" class="btn-secondary" id="btn-rv-done">Done for now</button>
    </div>`;
  const ring = FX.ring({ value: r.overall, max: 100, size: 96, center: `${r.clb}${r.clb >= 10 && r.overall >= 88 ? "+" : ""}`, sub: "CLB est." });
  $("score-ring").appendChild(ring);
  requestAnimationFrame(() => requestAnimationFrame(() => rb.querySelectorAll(".cat-fill").forEach((f) => { f.style.width = `${f.dataset.w}%`; })));
  if (cfg.prompt && cfg.prompt.model) {
    const slot = $("review-model");
    slot.innerHTML = `<button type="button" class="btn-secondary" id="btn-reveal-model" style="margin-bottom:14px">✨ Reveal the CLB 10 model answer</button>`;
    $("btn-reveal-model").onclick = () => { slot.innerHTML = '<h2 class="section-title">CLB 10 model answer</h2>'; slot.appendChild(modelCard(cfg.type, cfg.prompt)); FX.confetti({ el: slot, count: 30 }); };
  }
  $("btn-rv-again").onclick = () => (cfg.kind === "l3" ? startLesson3(true) : openWriter(cfg));
  $("btn-rv-done").onclick = () => goTab(cfg.kind === "l3" ? "learn" : "write");
  showScreen("screen-review");
  if (r.clb >= 9) setTimeout(() => FX.confetti({ big: true, count: 130 }), 300);
  FX.coach(r.clb >= 10 ? "done" : "hello", r.clb >= 10 ? "CLB 10 range! That is the target, Afolabi!" : `CLB ${r.clb} estimate. Fix the flags and try again. You are close.`);
}

/* ---------- Micro-interactions ---------- */
document.addEventListener("pointerdown", (e) => {
  const b = e.target.closest(".btn-primary, .quick, .game-card, .tab-btn, .lesson-card");
  if (!b || FX.reduced()) return;
  const r = b.getBoundingClientRect();
  const s = document.createElement("span");
  const size = Math.max(r.width, r.height);
  s.className = "ripple";
  s.style.width = s.style.height = `${size}px`;
  s.style.left = `${e.clientX - r.left - size / 2}px`;
  s.style.top = `${e.clientY - r.top - size / 2}px`;
  if (getComputedStyle(b).position === "static") b.style.position = "relative";
  b.style.overflow = "hidden";
  b.appendChild(s);
  setTimeout(() => s.remove(), 600);
});

/* ---------- Wire UI ---------- */
function wire() {
  document.querySelectorAll(".tab-btn").forEach((b) => b.addEventListener("click", () => goTab(b.dataset.tab)));
  document.querySelectorAll("[data-back]").forEach((b) => b.addEventListener("click", leaveDeep));
  document.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => {
    const g = b.dataset.go;
    if (g === "phrases") openPhrases();
    else goTab(g);
  }));
  $("btn-theme").addEventListener("click", () => { toggleTheme(); FX.pop($("btn-theme")); });
  $("set-dark").addEventListener("change", (e) => toggleTheme(e.target.checked));
  $("set-motion").addEventListener("change", (e) => { state.settings.reduceMotion = e.target.checked; saveState(state); applySettings(); });
  $("btn-warmup").addEventListener("click", () => Games.warmup());
  $("btn-warmup-2").addEventListener("click", () => Games.warmup());
  $("btn-open-phrases").addEventListener("click", openPhrases);
  document.querySelectorAll(".seg").forEach((b) => b.addEventListener("click", () => { writeSeg = b.dataset.seg; renderWriteList(); }));

  // Lessons (v2/v3 behaviour)
  $("btn-start-l1").addEventListener("click", () => startLesson(false));
  $("btn-start-l2").addEventListener("click", () => startLesson2());
  $("btn-start-l3").addEventListener("click", () => startLesson3(false));
  $("btn-back-home").addEventListener("click", leaveDeep);
  $("btn-l2-back").addEventListener("click", leaveDeep);
  $("btn-result-home").addEventListener("click", leaveDeep);
  $("btn-done").addEventListener("click", leaveDeep);
  $("btn-again").addEventListener("click", () => {
    if (typeof resultAgainHandler === "function") resultAgainHandler();
    else startLesson(true);
  });
  $("btn-l2-check").addEventListener("click", checkL2);
  $("btn-l2-next").addEventListener("click", nextL2);

  // Writer
  $("btn-writer-back").addEventListener("click", () => {
    if (writer && !writer.submitted && $("writer-body").value.trim()) {
      if (!confirm("Leave timed practice? Your draft is saved on this device.")) return;
      state.drafts[writer.cfg.id] = { ...writerValues(), t: Date.now() };
      saveState(state);
    }
    leaveDeep();
  });
  $("writer-body").addEventListener("input", () => { updateWriterMeta(); queueSave(); });
  $("writer-subject").addEventListener("input", () => { updateWriterMeta(); queueSave(); });
  $("btn-writer-check").addEventListener("click", checkWriterInline);
  $("btn-writer-submit").addEventListener("click", () => submitWriter(false));

  // Games
  $("btn-game-back").addEventListener("click", () => Games.quit());

  wirePhrases();
  $("update-toast").addEventListener("click", () => location.reload());
}

/* ---------- PWA: service worker + update toast ---------- */
function showUpdateToast() {
  const b = $("update-toast");
  b.hidden = false;
  requestAnimationFrame(() => b.classList.add("show"));
}
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register("./sw.js", { scope: "./" }).then((reg) => {
      if (reg.waiting && hadController) showUpdateToast();
      reg.addEventListener("updatefound", () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener("statechange", () => {
          if ((nw.state === "installed" || nw.state === "activated") && hadController) showUpdateToast();
        });
      });
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") reg.update().catch(() => {});
      });
    }).catch(() => {});
    navigator.serviceWorker.addEventListener("controllerchange", () => { if (hadController) showUpdateToast(); });
  });
}

/* ---------- Boot ---------- */
applySettings();
wire();
const startTab = location.hash.slice(1);
currentTab = TABS.includes(startTab) ? startTab : "home";
goTab(currentTab);
FX.coach("hello");
if (state.migratedFrom && !state.welcomed) {
  setTimeout(() => FX.toast("Welcome to v4! Your earlier progress came with you."), 600);
}
if (!state.welcomed) { state.welcomed = true; saveState(state); }
/* Small hook for debugging and automated tests */
window.CELPIP = { get state() { return state; }, CHECKER, version: 4 };
