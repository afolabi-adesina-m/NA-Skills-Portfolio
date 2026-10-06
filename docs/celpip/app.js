/**
 * CELPIP Coach v5 · core: state + migration (unchanged from v4), router, launchpad, dynamic pages,
 * list report + object page for prompts, timed writer, review, phrase bank, plan, settings, PWA.
 * Personal use · localStorage only · no backend · vanilla JS
 */
"use strict";

const STORAGE_KEY = "celpip-coach-v4";
/* v2 and v3 both stored progress under "celpip-email-coach-v1". The others are checked just in case. */
const LEGACY_KEYS = ["celpip-email-coach-v1", "celpip-email-coach-v3", "celpip-email-coach-v2"];
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

const APP_VERSION = 5;
const WIZ5 = ["Who I am", "Why I write", "How it hurts me", "What I want", "Thank you"];
const GAME_ICONS = { tone: "chat", sandwich: "layers", words: "zap", errors: "search", memory: "grid", connect: "link" };

function actionLabel(a) {
  if (!a) return "Open";
  if (a.t === "prompt") { const p = findPrompt(a.type, a.id); return `${a.type === "t2" ? "Task 2" : "Task 1"}: ${p ? p.title : "prompt"}`; }
  if (a.t === "warmup") return "Daily Warm-up";
  if (a.t === "game") return `Play ${GAMES.find((g) => g.id === a.id).name}`;
  if (a.t === "phrases") return "Phrase Bank";
  if (a.t === "lesson") return `Lesson ${a.n}`;
  if (a.t === "weakest") return "Redo your weakest prompt";
  if (a.t === "mock") return "Mock test: Task 1 + Task 2";
  return "Open";
}

function runAction(a) {
  if (!a) return;
  if (a.t === "prompt") openObject(a.type, a.id, "prompt");
  else if (a.t === "warmup") go({ p: "warmup" });
  else if (a.t === "game") go({ p: "game", id: a.id });
  else if (a.t === "phrases") go({ p: "phrases" });
  else if (a.t === "lesson") { if (a.n === 3) startLesson3(false); else go({ p: "lesson", n: a.n }); }
  else if (a.t === "weakest") {
    const scored = state.attempts.filter((x) => x.kind !== "l3");
    if (!scored.length) { FX.toast("No attempts yet. Start with the heating email."); openObject("t1", "t1-heat", "prompt"); return; }
    const w = scored.reduce((m, x) => (x.overall < m.overall ? x : m), scored[0]);
    openObject(w.type, w.id, "prompt");
  } else if (a.t === "mock") { go({ p: "list", type: "t1" }); FX.toast("Pick one Task 1, then one Task 2. Timer on!"); }
}

/* ---------- Router: launchpad -> app -> back ---------- */
let route = { p: "launchpad" };
let depth = 0;
let skipGuard = false;

function hashOf(r) {
  const parts = [r.p];
  if (r.type) parts.push(r.type);
  if (r.id) parts.push(r.id);
  if (r.tab) parts.push(r.tab);
  if (r.n) parts.push(r.n);
  return "#/" + parts.join("/");
}
function parseHash(h) {
  const parts = (h || "").replace(/^#\/?/, "").split("/").filter(Boolean);
  const p = parts[0];
  if (!p) return { p: "launchpad" };
  if (p === "list") return { p, type: parts[1] === "t2" ? "t2" : "t1" };
  if (p === "object") return { p, type: parts[1], id: parts[2], tab: parts[3] };
  if (p === "game") return { p, id: parts[1] };
  if (p === "lesson") return { p, n: Number(parts[1]) || 1 };
  if (["launchpad", "today", "settings", "phrases", "watch", "guides", "plan", "history", "warmup"].includes(p)) return { p };
  return { p: "launchpad" };
}

function go(r, opts = {}) {
  if (opts.replace) history.replaceState({ r, depth }, "", hashOf(r));
  else { depth += 1; history.pushState({ r, depth }, "", hashOf(r)); }
  render(r, opts);
}

function needsGuard() {
  return route.p === "object" && writer && writerTimerId && !writer.submitted && (currentBody() || "").trim().length > 0;
}
async function confirmLeaveDraft() {
  return UI.confirm({ title: "Leave the timed draft?", text: "The timer stops. Your draft is saved on this device, so you can finish it later.", ok: "Leave", cancel: "Keep writing" });
}
async function navBack() {
  if (needsGuard() && !(await confirmLeaveDraft())) return;
  flushDraft();
  if (depth > 0) { skipGuard = true; history.back(); }
  else go({ p: "launchpad" }, { replace: true, back: true });
}
window.addEventListener("popstate", async (e) => {
  if (!skipGuard && needsGuard()) {
    history.pushState({ r: route, depth }, "", hashOf(route));
    if (await confirmLeaveDraft()) { flushDraft(); skipGuard = true; history.back(); }
    return;
  }
  skipGuard = false;
  const st = e.state;
  depth = st ? st.depth : 0;
  render(st ? st.r : parseHash(location.hash), { back: true });
});

function leaveCurrent(next) {
  if (route.p === "object" && !(next.p === "object" && next.id === route.id && next.type === route.type)) {
    flushDraft();
    stopWriterTimer();
    writer = null;
    obj = null;
  }
  if ((route.p === "game" || route.p === "warmup") && next.p !== route.p) Games.abort();
}

function render(r, opts = {}) {
  leaveCurrent(r);
  route = r;
  switch (r.p) {
    case "today": renderToday(opts); break;
    case "settings": renderSettings(opts); break;
    case "list": renderList(r.type, opts); break;
    case "object": renderObject(r, opts); break;
    case "phrases": openPhrases(opts); break;
    case "watch": renderWatch(opts); break;
    case "guides": renderGuides(opts); break;
    case "plan": renderPlan(opts); break;
    case "history": renderHistory(opts); break;
    case "game": Games.start(r.id, {}); break;
    case "warmup": Games.warmup(); break;
    case "lesson": if (r.n === 2) startLesson2(); else startLesson(false); break;
    case "result": if (resultReady) showPage("result", { title: "Lesson result" }); else go({ p: "launchpad" }, { replace: true }); break;
    default: route = { p: "launchpad" }; renderLaunchpad(opts);
  }
}

/* Called by every renderer once its content is in place */
function showPage(id, opts = {}) {
  document.querySelectorAll(".page").forEach((s) => {
    const on = s.id === `page-${id}`;
    s.classList.toggle("active", on);
    s.classList.toggle("back", on && !!opts.back);
  });
  const home = id === "launchpad";
  $("btn-back").hidden = home;
  $("sb-logo").hidden = !home;
  $("sb-title").textContent = home ? "CELPIP Coach" : opts.title || "CELPIP Coach";
  $("btn-settings").hidden = id === "settings";
  document.title = home ? "CELPIP Coach" : `${opts.title || ""} · CELPIP Coach`;
  if (!opts.keepFooter) UI.setFooter([]);
  if (!opts.keepScroll) window.scrollTo(0, 0);
}

/* Legacy helpers still used by lessons.js and games.js */
function goHome() { go({ p: "launchpad" }, { replace: true }); }
function refreshHomeMeta() {}
function refreshAll() { if (route.p === "launchpad") renderLaunchpad({ keep: true }); }
function backBtn(id = "btn-foot-back", label = "Back") { return { id, label, type: "default", onClick: navBack }; }

/* ---------- Theme and settings ---------- */
function applySettings() {
  const dark = state.settings.theme === "dark";
  document.documentElement.removeAttribute("data-theme");
  if (dark) document.documentElement.setAttribute("data-theme", "dark");
  document.documentElement.classList.toggle("reduce-motion", !!state.settings.reduceMotion);
  document.querySelector('meta[name="theme-color"]').setAttribute("content", dark ? "#0e1318" : "#1d2d3e");
  const sd = $("set-dark"), sm = $("set-motion");
  if (sd) sd.checked = dark;
  if (sm) sm.checked = !!state.settings.reduceMotion;
}
function toggleTheme(force) {
  const dark = typeof force === "boolean" ? force : state.settings.theme !== "dark";
  state.settings.theme = dark ? "dark" : "light";
  saveState(state);
  applySettings();
}

/* ---------- Launchpad ---------- */
function promptStatus(id) {
  if (state.bestClb[id]) return { k: "done", label: `Done · CLB ${state.bestClb[id]}`, cls: "positive" };
  if (state.drafts[id] || state.attempted[id]) return { k: "progress", label: "In progress", cls: "critical" };
  return { k: "new", label: "Not started", cls: "neutral" };
}
function clbColor(n) { return n == null ? "" : n >= 10 ? "good" : n >= 8 ? "critical" : "error"; }

function renderLaunchpad(opts = {}) {
  const today = todayISO();
  const t = todayChallenge();
  const streak = computeStreak();
  const ids = dailyWarmupIds(today);
  const warmDone = !!state.warmups[today];
  const t1Done = T1_PROMPTS.filter((p) => state.bestClb[p.id]).length;
  const t2Done = T2_PROMPTS.filter((p) => state.bestClb[p.id]).length;
  const best = (list) => { const v = list.map((p) => state.bestClb[p.id] || 0); const m = Math.max(0, ...v); return m || null; };
  const daysDone = challengeDoneCount();

  let todayTile;
  if (t) {
    const done = !!state.challengeDone[t.date];
    todayTile = { id: "tile-today", title: "Today's task", sub: t.label === "Practice" ? t.plan : t.label, kpi: `Day ${t.n}`, unit: "of 30", cls: "featured",
      foot: done ? "Done today" : `Next: ${actionLabel(t.act)}`, footCls: done ? "positive" : "action", footIcon: done ? "check" : "play" };
  } else if (today < LEARNER.challengeStart) {
    todayTile = { id: "tile-today", title: "Today's task", sub: "The 30-day challenge starts Oct 5", icon: "calendar", foot: "Next: Daily Warm-up", footCls: "action", footIcon: "play" };
  } else {
    todayTile = { id: "tile-today", title: "Today's task", sub: "Challenge finished. Keep a small daily habit.", kpi: daysDone, unit: "of 30 done", foot: "Next: Task 1 Emails", footCls: "action", footIcon: "play" };
  }
  const groups = [
    { name: "Today", tiles: [
      todayTile,
      { id: "tile-warmup", title: "Daily Warm-up", sub: ids.map((id) => GAMES.find((g) => g.id === id).name).join(", "), icon: "activity",
        kpi: warmDone ? "" : 3, unit: warmDone ? "" : "games", foot: warmDone ? "Done today" : "About 4 minutes", footCls: warmDone ? "positive" : "", footIcon: warmDone ? "check" : "" },
      { id: "tile-streak", title: "Streak", sub: "Days in a row", kpi: streak, unit: streak === 1 ? "day" : "days", icon: "flame",
        foot: practiceDaySet().has(today) ? "Today counts" : "Practice today to keep it", footCls: practiceDaySet().has(today) ? "positive" : "" },
    ] },
    { name: "Learn", tiles: [
      { id: "tile-l1", title: "Lesson 1", sub: "Fill the Gaps · email sandwich", kpi: state.lesson1Completions, unit: "done", icon: "layers", foot: "5 steps + subject" },
      { id: "tile-l2", title: "Lesson 2", sub: "Tone and Grammar drills", kpi: state.lesson2Completions, unit: "done", icon: "edit", foot: `${L2_DRILLS.length} drills` },
      { id: "tile-l3", title: "Lesson 3", sub: "Full Timed Draft", kpi: state.lesson3Completions, unit: "done", icon: "clock", foot: "27 minutes" },
      { id: "tile-phrases", title: "Phrase Bank", sub: "Swipe CLB 10 phrases", kpi: PHRASES.length, unit: "cards", icon: "cards", foot: `${state.favPhrases.length} starred` },
      { id: "tile-watch", title: "Watch List", sub: "From your Day 1 email", kpi: WATCH_LIST.length, unit: "habits", icon: "eye", foot: "In the draft checker" },
      { id: "tile-guides", title: "Baby Steps", sub: "Task 1 and Task 2, step by step", kpi: GUIDES.length, unit: "guides", icon: "list", foot: "Start here" },
    ] },
    { name: "Practice", tiles: [
      { id: "tile-t1", title: "Task 1 Emails", sub: "27 min · 150 to 200 words", kpi: t1Done, unit: `/ ${T1_PROMPTS.length} done`, icon: "mail", foot: best(T1_PROMPTS) ? `Best CLB ${best(T1_PROMPTS)}` : `${T1_PROMPTS.length} prompts` },
      { id: "tile-t2", title: "Task 2 Surveys", sub: "26 min · Option A or B", kpi: t2Done, unit: `/ ${T2_PROMPTS.length} done`, icon: "survey", foot: best(T2_PROMPTS) ? `Best CLB ${best(T2_PROMPTS)}` : `${T2_PROMPTS.length} prompts` },
      { id: "tile-timed", title: "Timed Draft", sub: "A Task 1 you have not finished, clock on", icon: "clock", foot: "27 minute timer" },
    ] },
    { name: "Games", note: "Best score", tiles: GAMES.map((g) => {
      const rec = state.games[g.id];
      return { id: `tile-game-${g.id}`, title: g.name, sub: g.desc, kpi: rec ? rec.best : "", unit: rec ? "best" : "", icon: GAME_ICONS[g.id],
        foot: rec ? `Played ${rec.plays} ${rec.plays === 1 ? "time" : "times"}` : `New · ${g.time}` };
    }) },
    { name: "Progress", tiles: [
      { id: "tile-plan", title: "30-Day Plan", sub: "Oct 5 to Nov 3, 2026", kpi: daysDone, unit: "/ 30 days", icon: "calendar", foot: t ? `Today is Day ${t.n}` : "Calendar and best scores" },
      { id: "tile-clb", title: "CLB Estimate", sub: "Latest timed draft", kpi: state.lastClb != null ? state.lastClb : "", unit: state.lastClb != null ? "target 10" : "", kpiColor: clbColor(state.lastClb),
        icon: "trend", foot: state.attempts.length ? `${state.attempts.length} drafts · estimate only` : "No drafts yet" },
    ] },
  ];
  $("lp-groups").innerHTML = groups.map((g) => `<section class="lp-group" aria-label="${g.name}"><h2>${g.name}${g.note ? ` <small>${g.note}</small>` : ""}</h2>
    <div class="tile-grid">${g.tiles.map(UI.tile).join("")}</div></section>`).join("");
  $("lp-foot").textContent = `CELPIP Coach v${APP_VERSION} · progress is saved on this device only`;
  if (!opts.keep) showPage("launchpad", opts);
}

const TILE_ACTIONS = {
  "tile-today": () => go({ p: "today" }),
  "tile-warmup": () => go({ p: "warmup" }),
  "tile-streak": () => go({ p: "plan" }),
  "tile-l1": () => go({ p: "lesson", n: 1 }),
  "tile-l2": () => go({ p: "lesson", n: 2 }),
  "tile-l3": () => startLesson3(false),
  "tile-phrases": () => go({ p: "phrases" }),
  "tile-watch": () => go({ p: "watch" }),
  "tile-guides": () => go({ p: "guides" }),
  "tile-t1": () => go({ p: "list", type: "t1" }),
  "tile-t2": () => go({ p: "list", type: "t2" }),
  "tile-timed": () => {
    const pick = T1_PROMPTS.find((p) => !state.bestClb[p.id]) || T1_PROMPTS[Math.floor(Math.random() * T1_PROMPTS.length)];
    openObject("t1", pick.id, "write");
  },
  "tile-plan": () => go({ p: "plan" }),
  "tile-clb": () => go({ p: "history" }),
};

/* ---------- Today's task ---------- */
function renderToday(opts) {
  const t = todayChallenge();
  const head = $("today-head"), body = $("today-body");
  if (!t) {
    head.innerHTML = `<h2 class="dp-title">Today's task</h2><p class="dp-sub">${todayISO() < LEARNER.challengeStart ? "The 30-day challenge starts on Oct 5." : "The 30-day challenge is finished. Well done, Afolabi."}</p>`;
    body.innerHTML = UI.strip("info", "Keep a small daily habit: one warm-up and one Task 1 a week keeps your writing sharp.");
    showPage("today", { ...opts, title: "Today's task" });
    UI.setFooter([backBtn(), { id: "btn-today-go", label: "Daily Warm-up", type: "emph", onClick: () => go({ p: "warmup" }) }]);
    return;
  }
  const done = !!state.challengeDone[t.date];
  const outside = t.base && t.n > 1;
  head.innerHTML = `<p class="dp-eyebrow">${fromISO(t.date).toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" })}</p>
    <h2 class="dp-title">Day ${t.n} of 30</h2>
    <p class="dp-sub">${esc(t.label)}</p>
    <div class="dp-status">${done ? UI.status("positive", "Done") : UI.status("critical", "Open")}${t.base ? UI.status("info", "Baseline") : ""}</div>`;
  body.innerHTML = `
    ${done ? UI.strip("success", "Today is marked done. Your streak is safe.") : ""}
    <div class="panel"><h3>What to do</h3><p>${esc(t.plan)}</p></div>
    ${outside ? UI.strip("info", "This baseline happens outside the app. Do it first, then mark today done.") : ""}
    <div class="panel"><h3>Recommended next action</h3>
      <p class="row" style="border:0"><span>${UI.icon("play")}${esc(actionLabel(t.act))}</span></p>
      <p class="muted small">Use the button at the bottom right to start it.</p>
    </div>`;
  showPage("today", { ...opts, title: "Today's task" });
  UI.setFooter([
    { id: "btn-today-done", label: done ? "Undo done" : "Mark done", type: "default", onClick: () => { toggleDay(t.date); renderToday({ keepScroll: true }); } },
    { id: "btn-today-go", label: t.cta === "Start" ? "Start" : t.cta, type: "emph", onClick: () => runAction(t.act) },
  ]);
}

function toggleDay(date, el) {
  if (date > todayISO()) { FX.toast("That day has not arrived yet. One day at a time."); if (el) FX.shake(el); return false; }
  const now = !state.challengeDone[date];
  if (now) state.challengeDone[date] = true;
  else delete state.challengeDone[date];
  saveState(state);
  const d = CHALLENGE.find((x) => x.date === date);
  FX.toast(now ? (challengeDoneCount() >= 30 ? "All 30 days done. You did it, Afolabi!" : `Day ${d.n} marked done`) : `Day ${d.n} marked not done`);
  return true;
}

/* ---------- Settings ---------- */
function renderSettings(opts) {
  $("settings-head").innerHTML = `<div class="profile"><span class="big-avatar" aria-hidden="true">AA</span>
    <div><h2 class="dp-title">Afolabi Adesina</h2><p class="dp-sub">Oakville · Sheridan · Target CLB 10+</p></div></div>`;
  const lessons = [state.lesson1Completions, state.lesson2Completions, state.lesson3Completions];
  $("settings-body").innerHTML = `
    <div class="panel"><h3>Appearance</h3>
      <label class="switch-row"><span>Dark theme<small>Easier on the eyes at night</small></span><input type="checkbox" id="set-dark" /><i class="switch" aria-hidden="true"></i></label>
      <label class="switch-row"><span>Reduce motion<small>Turns off slides, flips and confetti</small></span><input type="checkbox" id="set-motion" /><i class="switch" aria-hidden="true"></i></label>
    </div>
    <div class="panel"><h3>Your challenge</h3>
      <ul class="row-list">
        <li class="row"><span>Dates</span><b>Oct 5 to Nov 3, 2026</b></li>
        <li class="row"><span>Days done</span><b>${challengeDoneCount()} of 30</b></li>
        <li class="row"><span>Streak</span><b>${computeStreak()} days</b></li>
        <li class="row"><span>Lessons tried</span><b>${lessons.filter((x) => x > 0).length} of 3</b></li>
      </ul>
    </div>
    <div class="panel"><h3>About</h3>
      <p class="small muted" id="version-note">CELPIP Coach v${APP_VERSION} · progress is saved on this device only${state.migratedFrom ? " · earlier progress carried over" : ""}. CLB numbers are estimates from simple rules, not official CELPIP scores.</p>
    </div>`;
  applySettings();
  $("set-dark").addEventListener("change", (e) => { toggleTheme(e.target.checked); FX.toast(e.target.checked ? "Dark theme on" : "Light theme on"); });
  $("set-motion").addEventListener("change", (e) => { state.settings.reduceMotion = e.target.checked; saveState(state); applySettings(); FX.toast(e.target.checked ? "Motion reduced" : "Motion on"); });
  showPage("settings", { ...opts, title: "Settings" });
  UI.setFooter([{ id: "btn-settings-done", label: "Done", type: "emph", onClick: navBack }]);
}

/* ---------- Watch list ---------- */
function watchHtml(w) {
  return `<div class="bad-line"><b>Day 1</b>${esc(w.bad)}</div><div class="good-line"><b>CLB 10</b>${esc(w.good)}</div><p class="kid-line">${esc(w.kid)}</p>`;
}
function renderWatch(opts) {
  $("watch-head").innerHTML = `<h2 class="dp-title">Watch List</h2><p class="dp-sub">Six habits from your Day 1 email. The draft checker looks for every one.</p>
    <div class="kpi-row"><div class="kpi"><span class="kpi-num">${WATCH_LIST.length}</span><span class="kpi-lbl">habits</span></div><div class="kpi"><span class="kpi-num">CLB 8 to 9</span><span class="kpi-lbl">Day 1 baseline</span></div></div>`;
  $("watch-body").innerHTML = `
    ${UI.strip("info", "Fix these six and your emails move toward CLB 10.")}
    <div id="watch-full">${WATCH_LIST.map((w, i) => `<details class="panel watch-item" ${i === 0 ? "open" : ""}><summary>${esc(w.title)}</summary>${watchHtml(w)}</details>`).join("")}</div>
    <div class="panel"><h3>Rules to remember</h3><ul class="rule-list">
      ${["No threats", "Skip \"I hope this email meets you well\"", "Firm but polite", "Always write a clear subject and body", "Sign as Afolabi"].map((r) => `<li>${UI.icon("check")}${esc(r)}</li>`).join("")}
    </ul></div>`;
  showPage("watch", { ...opts, title: "Watch List" });
  UI.setFooter([backBtn(), { id: "btn-watch-game", label: "Practice in Error Hunt", type: "emph", onClick: () => go({ p: "game", id: "errors" }) }]);
}

/* ---------- Baby steps ---------- */
function renderGuides(opts) {
  $("guides-head").innerHTML = `<h2 class="dp-title">Baby Steps</h2><p class="dp-sub">Tiny steps, one at a time. Read one guide before you write.</p>`;
  $("guides-body").innerHTML = `<div id="guides">${GUIDES.map((g) => `<div class="panel guide"><h3>${esc(g.title)}</h3><ol class="steps">${g.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol></div>`).join("")}</div>`;
  showPage("guides", { ...opts, title: "Baby Steps" });
  UI.setFooter([backBtn(), { id: "btn-guides-go", label: "Start Lesson 1", type: "emph", onClick: () => go({ p: "lesson", n: 1 }) }]);
}

/* ---------- List report: Task 1 and Task 2 ---------- */
function findPrompt(type, id) { return (type === "t2" ? T2_PROMPTS : T1_PROMPTS).find((p) => p.id === id); }
const listState = { t1: { f: "all", q: "" }, t2: { f: "all", q: "" } };
const FILTERS = [["all", "All"], ["new", "Not started"], ["progress", "In progress"], ["done", "Done"]];

function renderList(type, opts = {}) {
  const list = type === "t2" ? T2_PROMPTS : T1_PROMPTS;
  const ls = listState[type];
  const counts = { all: list.length, new: 0, progress: 0, done: 0 };
  list.forEach((p) => { counts[promptStatus(p.id).k] += 1; });
  $("list-head").innerHTML = `<h2 class="dp-title">${type === "t2" ? "Task 2 Surveys" : "Task 1 Emails"}</h2>
    <p class="dp-sub">${type === "t2" ? "Responding to Survey Questions · 26 minutes · 150 to 200 words" : "Writing an Email · 27 minutes · 150 to 200 words"}</p>
    <div class="kpi-row">
      <div class="kpi"><span class="kpi-num positive" id="list-done">${counts.done}</span><span class="kpi-lbl">done of ${list.length}</span></div>
      <div class="kpi"><span class="kpi-num">${counts.progress}</span><span class="kpi-lbl">in progress</span></div>
      <div class="kpi"><span class="kpi-num">${(() => { const b = Math.max(0, ...list.map((p) => state.bestClb[p.id] || 0)); return b ? `CLB ${b}` : "-"; })()}</span><span class="kpi-lbl">best estimate</span></div>
    </div>`;
  if (!opts.keepToolbar) {
    $("list-toolbar").innerHTML = `<div class="search">${UI.icon("search")}<input type="search" id="list-search" placeholder="Search prompts" aria-label="Search prompts" value="${esc(ls.q)}" autocomplete="off" /></div>
      <div class="chip-row" id="list-filters" role="group" aria-label="Filter by status">${FILTERS.map(([k, l]) => `<button type="button" class="chip-btn" data-f="${k}" aria-pressed="${ls.f === k}">${l}<span class="n">${counts[k]}</span></button>`).join("")}</div>`;
    $("list-search").addEventListener("input", (e) => { ls.q = e.target.value; renderListItems(type); });
    $("list-filters").querySelectorAll(".chip-btn").forEach((b) => b.addEventListener("click", () => {
      ls.f = b.dataset.f;
      $("list-filters").querySelectorAll(".chip-btn").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      renderListItems(type);
    }));
  }
  renderListItems(type);
  if (!opts.keepToolbar) {
    showPage("list", { ...opts, title: type === "t2" ? "Task 2 Surveys" : "Task 1 Emails" });
    UI.setFooter([backBtn(), { id: "btn-list-next", label: "Start next prompt", type: "emph", onClick: () => {
      const next = list.find((p) => promptStatus(p.id).k === "progress") || list.find((p) => promptStatus(p.id).k === "new") || list[0];
      openObject(type, next.id, "prompt");
    } }]);
  }
}

function renderListItems(type) {
  const list = type === "t2" ? T2_PROMPTS : T1_PROMPTS;
  const ls = listState[type];
  const q = ls.q.trim().toLowerCase();
  const items = list.filter((p) => (ls.f === "all" || promptStatus(p.id).k === ls.f)
    && (!q || [p.title, p.situation, p.tag || "", p.to || "", p.optionA || "", p.optionB || ""].join(" ").toLowerCase().includes(q)));
  const body = $("list-body");
  body.innerHTML = `<p class="list-count" aria-live="polite">${items.length} ${items.length === 1 ? "prompt" : "prompts"}</p>` + (items.length
    ? `<ul class="list" id="prompt-list">${items.map((p) => {
        const st = promptStatus(p.id);
        const tries = state.attempts.filter((a) => a.id === p.id).length;
        return `<li><button type="button" class="li prompt-card" data-id="${p.id}">
          <span class="li-ico">${UI.icon(type === "t2" ? "survey" : "mail")}</span>
          <span class="li-main"><span class="li-title">${esc(p.title)}</span>
            <span class="li-meta">${type === "t1" ? `To ${esc(p.to)} · ${esc(p.tag)}` : "Option A or B"}${tries ? ` · ${tries} ${tries === 1 ? "try" : "tries"}` : ""}</span></span>
          <span class="li-side">${UI.status(st.cls, st.label)}</span>${UI.icon("chevron", "chev")}</button></li>`;
      }).join("")}</ul>`
    : `<div class="list-empty">No prompts match. Try another filter or search word.</div>`);
  body.querySelectorAll(".li").forEach((b) => b.addEventListener("click", () => openObject(type, b.dataset.id, "prompt")));
}

/* ---------- 30-Day Plan ---------- */
let selectedDay = null;
function renderPlan(opts = {}) {
  const today = todayISO();
  const t = todayChallenge();
  $("plan-head").innerHTML = `<h2 class="dp-title">30-Day Plan</h2><p class="dp-sub">Oct 5 to Nov 3, 2026 · tap a day to mark it done</p>
    <div class="kpi-row">
      <div class="kpi"><span class="kpi-num" id="cal-count">${challengeDoneCount()}/30</span><span class="kpi-lbl">days done</span></div>
      <div class="kpi"><span class="kpi-num" id="streak-count">${computeStreak()}</span><span class="kpi-lbl">day streak</span></div>
      <div class="kpi"><span class="kpi-num">${t ? `Day ${t.n}` : "-"}</span><span class="kpi-lbl">today</span></div>
    </div>`;
  const startDow = (fromISO(LEARNER.challengeStart).getDay() + 6) % 7;
  let cal = "";
  for (let i = 0; i < startDow; i++) cal += `<span class="cal-day blank"></span>`;
  CHALLENGE.forEach((d) => {
    const cls = ["cal-day", d.base ? "base" : "prac"];
    if (state.challengeDone[d.date]) cls.push("done");
    if (d.date === today) cls.push("today");
    if (d.date > today) cls.push("future");
    if (selectedDay === d.date) cls.push("sel");
    const tag = d.base ? { Writing: "Write", Speaking: "Speak", Reading: "Read", Listening: "Listen" }[d.label.split(": ")[1]] : `Day ${d.n}`;
    const dt = fromISO(d.date);
    cal += `<button type="button" class="${cls.join(" ")}" data-date="${d.date}" aria-pressed="${!!state.challengeDone[d.date]}"
      aria-label="Day ${d.n}, ${dt.toLocaleDateString("en-CA", { month: "short", day: "numeric" })}, ${esc(d.label)}${state.challengeDone[d.date] ? ", done" : ""}${d.date === today ? ", today" : ""}">${dt.getDate()}<small>${esc(tag)}</small></button>`;
  });
  const show = CHALLENGE.find((d) => d.date === (selectedDay || today)) || CHALLENGE[0];
  const showDone = !!state.challengeDone[show.date];
  $("plan-body").innerHTML = `
    <div class="panel"><h3>Calendar</h3>
      <div class="cal-dow" aria-hidden="true"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div>
      <div class="calendar" id="calendar">${cal}</div>
      <div class="cal-legend"><span><i class="lg base"></i>Baseline</span><span><i class="lg prac"></i>Practice</span><span><i class="lg done"></i>Done</span><span><i class="lg today"></i>Today</span></div>
    </div>
    <div class="panel" id="day-detail"><h3>Day ${show.n} · ${fromISO(show.date).toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" })}</h3>
      <div class="dp-status" style="margin:0 0 .5rem">${showDone ? UI.status("positive", "Done") : show.date > today ? UI.status("neutral", "Not yet") : UI.status("critical", "Open")}<span class="muted small">${esc(show.label)}</span></div>
      <p>${esc(show.plan)}</p>
      ${show.date > today ? UI.strip("info", "This day has not arrived yet. You can look ahead, but you can only mark it done on the day.") : ""}
    </div>
    <div class="panel"><h3>Best game scores</h3><ul class="row-list" id="best-list">${GAMES.map((g) => {
      const r = state.games[g.id];
      return `<li class="row"><span>${UI.icon(GAME_ICONS[g.id])}${esc(g.name)}</span><b>${r ? r.best : "-"}</b></li>`;
    }).join("")}</ul></div>`;
  $("calendar").querySelectorAll(".cal-day[data-date]").forEach((b) => b.addEventListener("click", () => {
    selectedDay = b.dataset.date;
    const changed = toggleDay(b.dataset.date, b);
    renderPlan({ keepScroll: true, refresh: true });
    const nb = $("calendar").querySelector(`[data-date="${selectedDay}"]`);
    if (nb) { if (changed) FX.pop(nb); nb.focus({ preventScroll: true }); }
  }));
  if (!opts.refresh) showPage("plan", { ...opts, title: "30-Day Plan" });
  UI.setFooter([backBtn(), { id: "btn-day-go", label: show.date === today ? "Start today's task" : `Open Day ${show.n} task`, type: "emph", onClick: () => runAction(show.act) }]);
}

/* ---------- CLB estimate / writing history ---------- */
function promptTitle(a) {
  if (a.kind === "l3") return "Lesson 3 · timed draft";
  const p = findPrompt(a.type, a.id);
  return p ? `${a.type === "t2" ? "Task 2" : "Task 1"} · ${p.title}` : "Timed draft";
}
function renderHistory(opts) {
  const best = state.attempts.reduce((m, a) => Math.max(m, a.clb || 0), 0);
  $("history-head").innerHTML = `<h2 class="dp-title">CLB Estimate</h2><p class="dp-sub">From your timed drafts. Target CLB 10.</p>
    <div class="kpi-row">
      <div class="kpi"><span class="kpi-num ${state.lastClb >= 10 ? "positive" : state.lastClb >= 8 ? "critical" : ""}" id="hist-latest">${state.lastClb != null ? `CLB ${state.lastClb}` : "-"}</span><span class="kpi-lbl">latest</span></div>
      <div class="kpi"><span class="kpi-num">${best ? `CLB ${best}` : "-"}</span><span class="kpi-lbl">best</span></div>
      <div class="kpi"><span class="kpi-num">${state.attempts.length}</span><span class="kpi-lbl">drafts</span></div>
    </div>`;
  const hist = state.attempts.slice(0, 20);
  $("history-body").innerHTML = `${UI.strip("info", "Estimate only, not an official CELPIP score. It comes from simple rules: content, vocabulary, readability and task.")}
    <div class="panel"><h3>Writing history</h3>
    ${hist.length ? `<div id="history">${hist.map((a, i) => `<button type="button" class="row hist-row" data-i="${i}"><span>${esc(promptTitle(a))}<br><span class="muted tiny">${esc(a.date)} · ${a.words} words</span></span><span>${UI.status(a.clb >= 10 ? "positive" : a.clb >= 8 ? "critical" : "negative", `CLB ${a.clb}`)}</span></button>`).join("")}</div>`
      : `<p class="muted small" id="history">No timed drafts yet. Your estimates will show here.</p>`}
    </div>`;
  $("history-body").querySelectorAll(".hist-row").forEach((b) => b.addEventListener("click", () => {
    const a = hist[Number(b.dataset.i)];
    openObject(a.kind === "l3" ? "l3" : a.type, a.id, "review");
  }));
  showPage("history", { ...opts, title: "CLB Estimate" });
  UI.setFooter([backBtn(), { id: "btn-hist-write", label: "Write a Task 1", type: "emph", onClick: () => go({ p: "list", type: "t1" }) }]);
}

/* ---------- Phrase bank ---------- */
const phraseKey = (p) => `${p.g}|${p.basic}`;
let phraseFilter = "All", phraseList = PHRASES, phraseIdx = 0;
function openPhrases(opts = {}) {
  const groups = ["All", "Starred", ...PHRASE_GROUPS];
  $("phrase-groups").innerHTML = groups.map((g) => `<button type="button" class="chip-btn" data-g="${esc(g)}" aria-pressed="${g === phraseFilter}">${esc(g)}</button>`).join("");
  $("phrase-groups").querySelectorAll(".chip-btn").forEach((b) => b.addEventListener("click", () => {
    phraseFilter = b.dataset.g;
    phraseIdx = 0;
    $("phrase-groups").querySelectorAll(".chip-btn").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    filterPhrases();
    renderFlash();
  }));
  filterPhrases();
  showPage("phrases", { ...opts, title: "Phrase Bank" });
  renderFlash();
}
function filterPhrases() {
  if (phraseFilter === "All") phraseList = PHRASES;
  else if (phraseFilter === "Starred") phraseList = PHRASES.filter((p) => state.favPhrases.includes(phraseKey(p)));
  else phraseList = PHRASES.filter((p) => p.g === phraseFilter);
  $("phr-count").textContent = phraseList.length;
  $("phr-starred").textContent = state.favPhrases.length;
}
function phraseFooter() {
  const has = phraseList.length > 0;
  const on = has && state.favPhrases.includes(phraseKey(phraseList[phraseIdx]));
  UI.setFooter([
    { id: "flash-prev", label: "Previous", type: "default", disabled: !has, onClick: () => flashMove(-1) },
    { id: "flash-star", icon: "star", type: "default", aria: on ? "Remove star" : "Star this phrase", pressed: on, disabled: !has, onClick: toggleStar },
    { id: "flash-next", label: "Next", type: "emph", disabled: !has, onClick: () => flashMove(1) },
  ]);
}
function renderFlash(dir) {
  const f = $("flash");
  f.classList.remove("flipped", "swipe-l", "swipe-r");
  if (!phraseList.length) {
    f.innerHTML = `<div class="flash-inner"><div class="flash-face flash-front"><p class="center muted">No starred phrases yet. Tap the star on any card to save it here.</p></div></div>`;
    $("flash-pos").textContent = "";
    phraseFooter();
    return;
  }
  phraseIdx = (phraseIdx + phraseList.length) % phraseList.length;
  const p = phraseList[phraseIdx];
  f.innerHTML = `<div class="flash-inner">
    <div class="flash-face flash-front"><span class="tag">${esc(p.g)} · instead of</span><p class="txt">${esc(p.basic)}</p><span class="hint">Tap to see the CLB 10 version</span></div>
    <div class="flash-face flash-back"><span class="tag">CLB 10 · ${esc(p.g)}</span><p class="txt">${esc(p.clb)}</p><span class="hint">Swipe for the next card</span></div></div>`;
  if (dir) { void f.offsetWidth; f.classList.add(dir === "next" ? "swipe-l" : "swipe-r"); }
  $("flash-pos").textContent = `${phraseIdx + 1} of ${phraseList.length}`;
  phraseFooter();
}
function flashMove(d) { if (!phraseList.length) return; phraseIdx += d; renderFlash(d > 0 ? "next" : "prev"); }
function toggleStar() {
  if (!phraseList.length) return;
  const k = phraseKey(phraseList[phraseIdx]);
  const i = state.favPhrases.indexOf(k);
  if (i >= 0) { state.favPhrases.splice(i, 1); FX.toast("Removed from starred"); }
  else { state.favPhrases.push(k); FX.toast("Starred"); }
  saveState(state);
  if (phraseFilter === "Starred") filterPhrases();
  $("phr-starred").textContent = state.favPhrases.length;
  renderFlash();
}
function wirePhrases() {
  const f = $("flash");
  let x0 = null, y0 = null, moved = false;
  f.addEventListener("pointerdown", (e) => { x0 = e.clientX; y0 = e.clientY; moved = false; });
  f.addEventListener("pointermove", (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    if (Math.abs(dx) > 8) { moved = true; if (!FX.reduced()) f.style.transform = `translateX(${dx * 0.35}px)`; }
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
}

/* ---------- Object page: one prompt, sections as tabs ---------- */
let obj = null;          // { cfg, tab, revealed }
let writer = null;       // { cfg, total, secondsLeft, submitted, restored }
let writerTimerId = null;
let saveTimer = null;
const TAB_LABELS = { prompt: "Prompt", plan: "Plan", write: "Write", model: "Model answer", review: "Review" };
const T1_PLAN = [
  { key: "who", label: "1. Who I am", hint: "Your name and your link to the reader: unit, class, or job." },
  { key: "why", label: "2. Why I write", hint: "The problem or the request, in one sentence." },
  { key: "hurt", label: "3. How it hurts me", hint: "How it affects you: sleep, study, work, money. Add one real detail." },
  { key: "ask", label: "4. What I want", hint: "One polite request with a date. No threats." },
  { key: "thanks", label: "5. Thank you", hint: "Thank them, then sign as Afolabi." },
];

function cfgFor(type, id) {
  if (type === "l3") {
    const p = L3_PROMPTS.find((x) => x.id === id);
    return p ? { kind: "l3", type: "t1", routeType: "l3", id: p.id, title: "Lesson 3 · Full timed draft", promptText: p.prompt, keywords: p.keywords, minutes: 27 } : null;
  }
  const p = findPrompt(type, id);
  return p ? { kind: type, type, routeType: type, id, prompt: p, title: p.title, minutes: type === "t2" ? 26 : 27, keywords: p.keywords } : null;
}
function openObject(type, id, tab, opts = {}) { go({ p: "object", type, id, tab: tab || "prompt" }, opts); }
function objTabs(cfg) { return cfg.kind === "l3" ? ["prompt", "plan", "write", "review"] : ["prompt", "plan", "write", "model", "review"]; }
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, "0")}`;

function renderObject(r, opts = {}) {
  const cfg = cfgFor(r.type, r.id);
  if (!cfg) { go({ p: "launchpad" }, { replace: true }); return; }
  if (!obj || obj.cfg.id !== cfg.id) obj = { cfg, tab: "prompt", revealed: false };
  obj.tab = objTabs(cfg).includes(r.tab) ? r.tab : "prompt";
  renderObjHead();
  renderObjTabs();
  showPage("object", { ...opts, title: cfg.kind === "l3" ? "Lesson 3" : cfg.type === "t2" ? "Task 2 Survey" : "Task 1 Email" });
  renderObjTab();
}

function renderObjHead() {
  const c = obj.cfg, p = c.prompt;
  const st = promptStatus(c.id);
  const tries = state.attempts.filter((a) => a.id === c.id).length;
  const best = state.bestClb[c.id];
  $("obj-head").innerHTML = `
    <p class="dp-eyebrow">${c.kind === "l3" ? "Lesson 3 · Full timed draft" : c.type === "t2" ? "Task 2 · Responding to Survey Questions" : `Task 1 · Email to ${esc(p.to)}`}</p>
    <h2 class="dp-title" id="obj-title">${c.kind === "l3" ? "Timed Task 1 email" : esc(p.title)}</h2>
    <div class="dp-status">${UI.status(st.cls, st.label)}</div>
    <div class="kpi-row">
      <div class="kpi"><span class="kpi-num" id="obj-time"><span class="timer" id="writer-timer">${fmt(c.minutes * 60)}</span></span><span class="kpi-lbl" id="writer-timer-lbl">timer starts in Write</span></div>
      <div class="kpi"><span class="kpi-num ${best >= 10 ? "positive" : best >= 8 ? "critical" : ""}" id="obj-best">${best ? `CLB ${best}` : "-"}</span><span class="kpi-lbl">best estimate</span></div>
      <div class="kpi"><span class="kpi-num">${tries}</span><span class="kpi-lbl">${tries === 1 ? "try" : "tries"}</span></div>
    </div>`;
  updateWriterTimer();
}

function renderObjTabs() {
  const hasDraft = !!state.drafts[obj.cfg.id];
  $("obj-tabs").innerHTML = objTabs(obj.cfg).map((t) => `<button type="button" class="tab" role="tab" id="tab-${t}" data-tab="${t}" aria-selected="${obj.tab === t}" aria-controls="obj-body">
    ${TAB_LABELS[t]}${t === "write" && hasDraft && obj.tab !== "write" ? '<span class="dot" aria-label="saved draft"></span>' : ""}${t === "model" && !state.attempted[obj.cfg.id] ? " " + UI.icon("lock") : ""}</button>`).join("");
  $("obj-tabs").querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => setObjTab(b.dataset.tab)));
}

function setObjTab(tab, opts = {}) {
  if (!opts.noFlush) flushDraft();
  obj.tab = tab;
  route = { ...route, tab };
  history.replaceState({ r: route, depth }, "", hashOf(route));
  renderObjTabs();
  renderObjTab();
  updateWriterTimer();
  const tabsTop = $("obj-tabs").offsetTop - $("shellbar").offsetHeight;
  if (window.scrollY > tabsTop) window.scrollTo(0, Math.max(0, tabsTop));
}

function renderObjTab() {
  const b = $("obj-body");
  b.classList.remove("model-reveal"); void b.offsetWidth; b.classList.add("model-reveal");
  ({ prompt: renderPromptTab, plan: renderPlanTab, write: renderWriteTab, model: renderModelTab, review: renderReviewTab })[obj.tab]();
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
      <ul>${p.bullets.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
    </div></div>`;
}
function promptMiniHtml(c) {
  if (c.kind === "l3") return `<p>${esc(c.promptText)}</p>`;
  const p = c.prompt;
  return c.type === "t2"
    ? `<p>${esc(p.situation)}</p><p><b>A:</b> ${esc(p.optionA)}</p><p><b>B:</b> ${esc(p.optionB)}</p>`
    : `<p>${esc(p.situation)}</p><p><b>Write to ${esc(p.to)}:</b></p><ul>${p.bullets.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
}

/* Prompt tab */
function renderPromptTab() {
  const c = obj.cfg;
  const tries = state.attempts.filter((a) => a.id === c.id).length;
  $("obj-body").innerHTML = `
    ${c.kind === "l3"
      ? `<div class="celpip-box"><div class="celpip-head"><span>Lesson 3: Timed Task 1</span><span class="clock">27:00</span></div><div class="celpip-body"><p>${esc(c.promptText)}</p><p class="instr">Write about 150 to 200 words. Use the 5 bites: Who I am, Why I write, How it hurts me, What I want, Thank you.</p></div></div>`
      : celpipBoxHtml(c.type, c.prompt)}
    ${tries ? UI.strip("info", `You tried this ${tries} ${tries === 1 ? "time" : "times"}. Best estimate CLB ${state.bestClb[c.id]}.`) : ""}
    ${state.drafts[c.id] ? UI.strip("warning", "You have a saved draft. It comes back when you open Write.") : ""}`;
  UI.setFooter([
    { id: "btn-to-plan", label: "Plan first", type: "default", onClick: () => setObjTab("plan") },
    { id: "btn-prompt-start", label: `Start writing (${c.minutes} min)`, type: "emph", onClick: () => setObjTab("write") },
  ]);
}

/* Plan tab */
function renderPlanTab() {
  const c = obj.cfg;
  const t2 = c.type === "t2";
  const d = state.drafts[c.id] || {};
  const plan = d.plan || {};
  const rows = t2 ? T2_PLANNER : T1_PLAN;
  $("obj-body").innerHTML = `
    ${UI.strip("info", t2 ? "Pick a side, then jot quick notes. Two or three minutes is enough. Notes are saved, not scored." : "Jot one quick note for each bite. Two or three minutes is enough. Notes are saved, not scored.")}
    <div class="panel planner" id="writer-planner">
      ${t2 ? `<p class="field-label">Your choice</p><div class="options" style="grid-template-columns:1fr 1fr;margin:0 0 .75rem">
        <button type="button" class="option" data-opt="A" aria-pressed="${d.option === "A"}"><b>Option A</b></button>
        <button type="button" class="option" data-opt="B" aria-pressed="${d.option === "B"}"><b>Option B</b></button></div>` : ""}
      ${rows.map((s) => `<div class="plan-row"><label class="field-label" for="plan-${s.key}">${esc(s.label)}</label><p class="hint">${esc(s.hint)}</p>
        <textarea class="textarea short" id="plan-${s.key}" data-plan="${s.key}" rows="2">${esc(plan[s.key] || "")}</textarea></div>`).join("")}
    </div>`;
  const pl = $("writer-planner");
  pl.querySelectorAll("[data-opt]").forEach((b) => b.addEventListener("click", () => {
    pl.querySelectorAll("[data-opt]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    queueSave();
  }));
  pl.querySelectorAll("textarea").forEach((t) => t.addEventListener("input", queueSave));
  UI.setFooter([
    { id: "btn-plan-outline", label: "Outline into draft", type: "default", onClick: outlineIntoDraft },
    { id: "btn-plan-write", label: "Start writing", type: "emph", onClick: () => setObjTab("write") },
  ]);
}

async function outlineIntoDraft() {
  const c = obj.cfg;
  const d = collectDraft();
  const v = (k) => ((d.plan || {})[k] || "").trim();
  let parts;
  if (c.type === "t2") {
    const choice = d.option || "A";
    parts = [
      `I believe Option ${choice} is the better choice. ${v("opinion")}`.trim(),
      `First, ${v("r1") || "..."} For example, ...`,
      `Second, ${v("r2") || "..."} For instance, ...`,
      `Some people may argue that ${v("other") || "..."} That is a fair point, but ...`,
      `For these reasons, I strongly support Option ${choice}. ${v("close")}`.trim(),
    ];
  } else {
    parts = ["Dear ...,", v("who") || "My name is Afolabi Adesina, and ...", v("why") || "I am writing to ...", v("hurt") || "Because of this, ...", v("ask") || "Could you please ... by ...?", `${v("thanks") || "Thank you for your help."}\n\nSincerely,\nAfolabi Adesina`];
  }
  if (d.body.trim() && !(await UI.confirm({ title: "Add the outline?", text: "The outline goes below what you already wrote. Nothing is deleted.", ok: "Add outline", cancel: "Cancel" }))) return;
  d.body = (d.body.trim() ? d.body.trim() + "\n\n" : "") + parts.join("\n\n");
  state.drafts[c.id] = { ...d, t: Date.now() };
  saveState(state);
  FX.toast("Outline added to your draft");
  setObjTab("write", { noFlush: true });
}

/* Drafts */
function collectDraft() {
  if (!obj) return null;
  const d = { subject: "", body: "", plan: {}, option: null, ...(state.drafts[obj.cfg.id] || {}) };
  d.plan = { ...(d.plan || {}) };
  const s = $("writer-subject"), b = $("writer-body");
  if (s) d.subject = s.value;
  if (b) d.body = b.value;
  document.querySelectorAll("#obj-body [data-plan]").forEach((t) => { d.plan[t.dataset.plan] = t.value; });
  const opt = document.querySelector('#obj-body [data-opt][aria-pressed="true"]');
  if (opt) d.option = opt.dataset.opt;
  return d;
}
function saveDraftNow() {
  if (!obj) return;
  const d = collectDraft();
  const any = d.body.trim() || d.subject.trim() || d.option || Object.values(d.plan).some((x) => x && x.trim());
  if (!any) return;
  state.drafts[obj.cfg.id] = { ...d, t: Date.now() };
  saveState(state);
}
function queueSave() { clearTimeout(saveTimer); saveTimer = setTimeout(saveDraftNow, 400); }
function flushDraft() { clearTimeout(saveTimer); saveDraftNow(); }
function currentBody() { const b = $("writer-body"); return b ? b.value : obj && state.drafts[obj.cfg.id] ? state.drafts[obj.cfg.id].body || "" : ""; }

/* Write tab + timer */
function stopWriterTimer() { if (writerTimerId) { clearInterval(writerTimerId); writerTimerId = null; } }
function startWriter() {
  stopWriterTimer();
  writer = { cfg: obj.cfg, total: obj.cfg.minutes * 60, secondsLeft: obj.cfg.minutes * 60, submitted: false };
  writerTimerId = setInterval(() => {
    if (!writer || writer.submitted) return;
    writer.secondsLeft -= 1;
    updateWriterTimer();
    if (writer.secondsLeft === 300) FX.toast("5 minutes left. Check your sign-off and word count.");
    if (writer.secondsLeft <= 0) { stopWriterTimer(); submitWriter(true); }
  }, 1000);
}
function updateWriterTimer() {
  const el = $("writer-timer"), lbl = $("writer-timer-lbl");
  if (!el || !obj) return;
  if (!writer) {
    const last = (state.lastSubmission || {})[obj.cfg.id];
    const showLast = last && typeof last.secs === "number" && obj.tab !== "write";
    el.textContent = showLast ? fmt(last.secs) : fmt(obj.cfg.minutes * 60);
    lbl.textContent = showLast ? "last time used" : "timer starts in Write";
    el.parentElement.className = "kpi-num timer"; return;
  }
  const s = Math.max(0, writer.secondsLeft);
  el.textContent = writer.submitted ? fmt(Math.max(0, writer.total - s)) : fmt(s);
  lbl.textContent = writer.submitted ? "time used" : "left";
  el.parentElement.className = `kpi-num timer${!writer.submitted && s <= 60 ? " danger" : !writer.submitted && s <= 300 ? " warn" : ""}`;
}

function renderWriteTab() {
  const c = obj.cfg;
  const t2 = c.type === "t2";
  const fresh = !writer || writer.submitted;
  if (fresh) startWriter();
  const d = state.drafts[c.id] || {};
  const planNotes = Object.entries(d.plan || {}).filter(([, x]) => x && x.trim());
  $("obj-body").innerHTML = `
    <details class="panel prompt-mini"><summary>Prompt</summary>${promptMiniHtml(c)}</details>
    ${planNotes.length ? `<details class="panel prompt-mini"><summary>Your plan</summary><ul>${d.option ? `<li>Option ${esc(d.option)}</li>` : ""}${planNotes.map(([, x]) => `<li>${esc(x)}</li>`).join("")}</ul></details>` : ""}
    <div class="panel">
      ${t2 ? "" : `<label class="field-label" for="writer-subject">Subject</label><input type="text" class="input" id="writer-subject" maxlength="140" placeholder="Issue + who you are (unit, role, order)" autocomplete="off" />`}
      <label class="field-label" for="writer-body">${t2 ? "Your response" : "Email body"}</label>
      <textarea class="textarea" id="writer-body" rows="12"></textarea>
      <div class="write-meta"><span class="wc-chip" id="writer-words">0 words</span><span id="writer-live" aria-live="polite">Aim for 150 to 200 words</span></div>
    </div>
    <div id="writer-check" aria-live="polite"></div>`;
  const body = $("writer-body");
  body.placeholder = t2
    ? "I believe Option ... is the better choice.\n\nFirst, ...\nFor example, ...\n\nSecond, ...\n\nSome people may argue that ...\n\nFor these reasons, ..."
    : "Dear ...,\n\nWho I am\nWhy I write\nHow it hurts me\nWhat I want (+ polite timeline)\n\nThank you\nAfolabi Adesina";
  body.value = d.body || "";
  if (!t2) $("writer-subject").value = d.subject || "";
  body.addEventListener("input", () => { updateWriterMeta(); queueSave(); });
  if (!t2) $("writer-subject").addEventListener("input", () => { updateWriterMeta(); queueSave(); });
  updateWriterMeta();
  updateWriterTimer();
  if (fresh) FX.toast(d.body ? "Your saved draft is back. Timer started." : `Timer started: ${c.minutes} minutes`);
  UI.setFooter([
    { id: "btn-writer-check", label: "Check", type: "default", onClick: checkWriterInline },
    { id: "btn-writer-submit", label: "Submit", type: "emph", onClick: () => submitWriter(false) },
  ]);
}

function updateWriterMeta() {
  const b = $("writer-body");
  if (!b || !obj) return;
  const s = $("writer-subject");
  const n = CHECKER.wordCount(b.value.replace(/^\s*subject\s*:.*\n/i, ""));
  const chip = $("writer-words");
  chip.textContent = `${n} words`;
  chip.classList.toggle("ok", n >= 150 && n <= 200);
  chip.classList.toggle("over", n > 200);
  const quick = CHECKER.analyze({ subject: s ? s.value : "", body: b.value, type: obj.cfg.type, prompt: obj.cfg.prompt || { keywords: obj.cfg.keywords } });
  const bad = quick.flags.filter((f) => f.level === "bad" && !["count", "subject", "signoff"].includes(f.id)).length;
  $("writer-live").textContent = n < 150 ? `${150 - n} more to reach 150` : n > 200 ? `${n - 200} over 200` : bad ? `${bad} watch-list flag${bad > 1 ? "s" : ""}` : "Looking good";
}

function flagsStrips(flags) {
  if (!flags.length) return UI.strip("success", "Clean draft. Proud of you!", "No watch-list problems found.");
  return flags.map((f) => UI.strip(f.level === "bad" ? "error" : "warning", esc(f.detail), esc(f.title) + ".")).join("");
}

function checkWriterInline() {
  const v = collectDraft();
  const r = CHECKER.analyze({ subject: v.subject, body: v.body, type: obj.cfg.type, prompt: obj.cfg.prompt || { keywords: obj.cfg.keywords } });
  const box = $("writer-check");
  box.innerHTML = `<h3 class="section-title">Draft checker</h3>
    ${UI.strip("info", `${esc(r.label)} estimate right now · ${r.words} words. Estimate only.`)}
    ${flagsStrips(r.flags)}`;
  if (r.flags.length) FX.shake(box);
  box.scrollIntoView({ behavior: FX.reduced() ? "auto" : "smooth", block: "start" });
}

function submitWriter(fromTimer) {
  if (!writer || writer.submitted || !obj) return;
  const v = collectDraft();
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
  state.lastSubmission[cfg.id] = { subject: v.subject, body: v.body, t: Date.now(), secs: used, fromTimer: !!fromTimer };
  delete state.drafts[cfg.id];
  if (cfg.kind === "l3") {
    state.lesson3Completions += 1;
    state.lastLesson = 3;
    state.lessonsTouched[3] = true;
  }
  bumpStreak();
  saveState(state);
  renderObjHead();
  setObjTab("review", { noFlush: true });
  FX.toast(fromTimer ? "Time is up. Your draft was submitted." : "Submitted. Here is your estimate.");
  if (cfg.kind === "l3") setTimeout(() => FX.confetti({ big: true, count: 110 }), 250);
}

/* Review tab */
function renderReviewTab() {
  const c = obj.cfg;
  const last = state.lastSubmission[c.id];
  const b = $("obj-body");
  if (!last) {
    b.innerHTML = UI.strip("info", "No review yet. Submit a timed draft and your CLB estimate shows here.");
    UI.setFooter([{ id: "btn-rv-write", label: "Start writing", type: "emph", onClick: () => setObjTab("write") }]);
    return;
  }
  const r = CHECKER.analyze({ subject: last.subject, body: last.body, type: c.type, prompt: c.prompt || { keywords: c.keywords } });
  const tone = r.clb >= 10 ? "positive" : r.clb >= 8 ? "critical" : "negative";
  const timeTxt = last.secs != null ? ` · ${last.fromTimer ? "time ran out" : `finished in ${fmt(last.secs)}`}` : "";
  b.innerHTML = `<div id="review-body">
    <div class="panel score-panel">
      ${r.clb >= 10 ? UI.successCheck(52) : ""}
      <div class="kpi"><span class="kpi-num ${tone}" id="review-clb">${esc(r.label)}</span><span class="kpi-lbl">Estimate · ${r.overall}/100 · ${r.words} words${timeTxt}</span></div>
    </div>
    ${UI.strip("info", "Estimate only, not an official CELPIP score. It comes from the simple rules below.")}
    <h3 class="section-title">Draft checker · watch list <span class="chip ${r.flags.length ? "warn" : "good"}">${r.flags.length} flag${r.flags.length === 1 ? "" : "s"}</span></h3>
    <div id="review-flags">${flagsStrips(r.flags)}</div>
    ${r.good.length ? UI.strip("success", r.good.map(esc).join(" · "), "What you did well:") : ""}
    <h3 class="section-title">Breakdown</h3>
    <div class="panel">
      ${r.cats.map((ct) => `<div class="cat"><div class="cat-top"><span>${esc(ct.label)}</span><span>CLB ${ct.clb}${ct.clb >= 10 && ct.score >= 88 ? "+" : ""} · ${ct.score}</span></div>
        <div class="cat-bar"><div class="cat-fill ${ct.score >= 80 ? "good" : ct.score >= 64 ? "mid" : "low"}" data-w="${ct.score}"></div></div>
        <details><summary>How this was scored</summary><ul>${ct.notes.map((n) => `<li class="${n.ok ? "" : "no"}"><span>${n.ok ? "Yes" : "Not yet"} · ${esc(n.text)}</span><span class="pts">${n.pts > 0 ? "+" : ""}${n.pts}${n.max && n.max !== n.pts ? ` of ${n.max}` : ""}</span></li>`).join("")}</ul></details></div>`).join("")}
      <p class="muted tiny">Weights: content 30%, vocabulary 25%, readability 20%, task 25%. A threat caps the estimate at CLB 9.</p>
    </div>
    <h3 class="section-title">Your draft</h3>
    <article class="panel email-preview">
      ${c.type === "t2" ? "" : `<div class="email-row"><span class="email-key">Subject:</span> <span>${esc(r.subject || "(no subject)")}</span></div>`}
      <div class="email-body">${esc(last.body.trim() || "(empty)")}</div>
    </article></div>`;
  requestAnimationFrame(() => requestAnimationFrame(() => b.querySelectorAll(".cat-fill").forEach((f) => { f.style.width = `${f.dataset.w}%`; })));
  if (c.kind === "l3") {
    UI.setFooter([
      { id: "btn-rv-done", label: "Done", type: "default", onClick: navBack },
      { id: "btn-rv-again", label: "Next timed prompt", type: "emph", onClick: () => startLesson3(true) },
    ]);
  } else {
    UI.setFooter([
      { id: "btn-rv-again", label: "Write again", type: "default", onClick: () => setObjTab("write") },
      { id: "btn-rv-model", label: "See model answer", type: "emph", onClick: () => { obj.revealed = true; setObjTab("model"); } },
    ]);
  }
}

/* Model answer tab */
function highlightHtml(text, highlights) {
  const ranges = [];
  highlights.forEach((h, i) => { const s = text.indexOf(h.p); if (s >= 0) ranges.push({ s, e: s + h.p.length, i }); });
  ranges.sort((a, b) => a.s - b.s);
  let out = "", pos = 0;
  ranges.forEach((r) => {
    if (r.s < pos) return;
    out += esc(text.slice(pos, r.s)) + `<mark data-i="${r.i}" tabindex="0" role="button">${esc(text.slice(r.s, r.e))}</mark>`;
    pos = r.e;
  });
  return out + esc(text.slice(pos));
}
function renderModelTab() {
  const c = obj.cfg, p = c.prompt;
  const b = $("obj-body");
  const write = { id: "btn-model-write", label: state.attempts.some((a) => a.id === c.id) ? "Write again" : "Start writing", type: "emph", onClick: () => setObjTab("write") };
  if (!state.attempted[c.id]) {
    b.innerHTML = `<div class="panel center lock-card">${UI.icon("lock", "lock-ico")}
      <h3>Write first, then peek</h3><p class="muted small">The model answer unlocks after you submit a draft. Trying first is how your brain learns.</p>
      <button type="button" class="link-btn" id="btn-unlock-paper">I wrote it on paper. Unlock it.</button></div>`;
    $("btn-unlock-paper").onclick = async () => {
      if (!(await UI.confirm({ title: "Unlock the model answer?", text: "Did you write your own answer first, on paper or in your head?", ok: "Yes, unlock", cancel: "Not yet" }))) return;
      state.attempted[c.id] = true;
      saveState(state);
      FX.toast("Model answer unlocked");
      renderObjHead(); renderObjTabs(); renderModelTab();
    };
    UI.setFooter([write]);
    return;
  }
  const body = c.type === "t2" ? p.model : p.model.body;
  const words = CHECKER.wordCount(body);
  if (!obj.revealed) {
    b.innerHTML = `${UI.strip("success", "Unlocked. Read it, then compare it with your own draft.")}
      <div class="panel"><h3>CLB 10 model answer${c.type === "t2" ? ` · Option ${p.choice}` : ""}</h3><p class="muted small">${words} words · ${p.highlights.length} highlighted phrases, each with a short note.</p></div>`;
    UI.setFooter([{ id: "btn-reveal-model", label: "Reveal model answer", type: "emph", onClick: () => { obj.revealed = true; renderModelTab(); } }]);
    return;
  }
  b.innerHTML = `<div id="review-model"><div class="panel model-inner" id="model-card">
      <h3>Model answer${c.type === "t2" ? ` · Option ${p.choice}` : ""} <span class="chip good">${words} words</span></h3>
      ${c.type === "t2" ? "" : `<div class="email-row"><span class="email-key">Subject:</span> <b>${esc(p.model.subject)}</b></div>`}
      <div class="model-email">${highlightHtml(body, p.highlights)}</div>
      <div id="hl-tip" style="margin-top:.75rem">${UI.strip("info", "Tap a highlighted phrase to see why it scores high.")}</div>
    </div>
    <div class="panel"><h3>Why these phrases score high</h3><ul class="hl-list">${p.highlights.map((h) => `<li><q>${esc(h.p)}</q><br>${esc(h.why)}</li>`).join("")}</ul></div>
    <div class="panel"><h3>Why this is CLB 10</h3><ul class="why-list">${p.why.map((w) => `<li>${UI.icon("check")}${esc(w)}</li>`).join("")}</ul></div></div>`;
  b.querySelectorAll("mark").forEach((m) => {
    const show = () => {
      b.querySelectorAll("mark").forEach((x) => x.classList.toggle("on", x === m));
      $("hl-tip").innerHTML = UI.strip("info", esc(p.highlights[Number(m.dataset.i)].why), "Why it works:");
    };
    m.addEventListener("click", show);
    m.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(); } });
  });
  UI.setFooter([write]);
}

/* ---------- Wire UI ---------- */
function wire() {
  $("btn-back").addEventListener("click", navBack);
  $("btn-settings").addEventListener("click", () => go({ p: "settings" }));
  $("btn-avatar").addEventListener("click", () => { if (route.p !== "settings") go({ p: "settings" }); });
  $("lp-groups").addEventListener("click", (e) => {
    const t = e.target.closest(".tile");
    if (!t) return;
    if (t.id.startsWith("tile-game-")) go({ p: "game", id: t.id.slice(10) });
    else if (TILE_ACTIONS[t.id]) TILE_ACTIONS[t.id]();
  });
  wirePhrases();
  $("update-toast").addEventListener("click", () => location.reload());
  window.addEventListener("beforeunload", flushDraft);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flushDraft(); });
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
(() => {
  let start = parseHash(location.hash);
  if (start.p === "object" && !cfgFor(start.type, start.id)) start = { p: "launchpad" };
  history.replaceState({ r: start, depth: 0 }, "", hashOf(start));
  render(start);
})();
if (state.migratedFrom && !state.welcomed) setTimeout(() => FX.toast("Welcome back. Your earlier progress came with you."), 600);
else if (!state.seenV5 && state.welcomed) setTimeout(() => FX.toast("New look: tap a tile to start. The back arrow brings you home."), 600);
if (!state.welcomed || !state.seenV5) { state.welcomed = true; state.seenV5 = true; saveState(state); }
/* Small hook for debugging and automated tests */
window.CELPIP = { get state() { return state; }, CHECKER, version: APP_VERSION, go };
