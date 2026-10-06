/* CELPIP Coach v4 · brain games (1 to 3 minutes each, scored, best scores saved)
   Uses globals from app.js at runtime: state, saveState, bumpStreak, showScreen, goTab, todayISO, refreshAll. */
"use strict";

const GAMES = [
  { id: "tone", name: "Tone Swap", icon: "🎭", desc: "Pick the polite CLB 10 version before the clock runs out.", time: "about 2 min" },
  { id: "sandwich", name: "Sandwich Sort", icon: "🥪", desc: "Tap the 5 email bites in the right order.", time: "about 2 min" },
  { id: "words", name: "Word Upgrade", icon: "⚡", desc: "60-second sprint: swap a basic word for a stronger one.", time: "1 min" },
  { id: "errors", name: "Error Hunt", icon: "🔎", desc: "Tap the mistake. Built from your Day 1 email.", time: "about 2 min" },
  { id: "memory", name: "Memory Match", icon: "🧩", desc: "Flip cards to pair formal phrases with their purpose.", time: "about 2 min" },
  { id: "connect", name: "Connector Rush", icon: "🔗", desc: "Choose the right linking word, fast.", time: "1 min" },
];

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function dailyWarmupIds(iso) {
  let h = 2166136261;
  for (const ch of iso) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; };
  const ids = GAMES.map((g) => g.id);
  const out = [];
  while (out.length < 3) {
    const pick = ids[Math.floor(rnd() * ids.length)];
    if (!out.includes(pick)) out.push(pick);
  }
  return out;
}

const Games = (() => {
  let cur = null;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  function cleanup() {
    if (!cur) return;
    cur.timers.forEach((t) => { clearInterval(t); clearTimeout(t); });
    cur.timers = [];
  }

  /* ---- API passed to each game ---- */
  function makeApi() {
    const A = {
      stage: $("game-stage"),
      later(fn, ms) { const t = setTimeout(() => { if (cur && !cur.ended) fn(); }, ms); cur.timers.push(t); return t; },
      progress(text) { $("game-progress").textContent = text; },
      bar(frac, low) {
        const b = $("game-timebar");
        b.style.width = `${Math.max(0, Math.min(1, frac)) * 100}%`;
        b.classList.toggle("low", !!low);
      },
      setScore(n) { cur.score = Math.max(0, Math.round(n)); $("game-score").textContent = cur.score; },
      add(n, el) {
        A.setScore(cur.score + n);
        if (el && n > 0 && !FX.reduced()) {
          const r = el.getBoundingClientRect();
          const f = document.createElement("div");
          f.className = "float-pts";
          f.textContent = `+${n}`;
          f.style.left = `${r.left + r.width / 2 - 14}px`;
          f.style.top = `${r.top}px`;
          document.body.appendChild(f);
          setTimeout(() => f.remove(), 950);
        }
        FX.pop($("game-score"));
      },
      countdown(seconds, onTick, onEnd) {
        const start = Date.now();
        const total = seconds * 1000;
        let stopped = false;
        const t = setInterval(() => {
          if (stopped || !cur || cur.ended) return;
          const left = Math.max(0, total - (Date.now() - start));
          A.bar(left / total, left / total < 0.25);
          if (onTick) onTick(left / 1000);
          if (left <= 0) { stopped = true; clearInterval(t); onEnd && onEnd(); }
        }, 100);
        cur.timers.push(t);
        return {
          stop() { stopped = true; clearInterval(t); return Math.max(0, total - (Date.now() - start)) / 1000; },
          left() { return Math.max(0, total - (Date.now() - start)) / 1000; },
        };
      },
      correct(el, pts, small) {
        if (pts) A.add(pts, el);
        FX.confetti({ el, count: small ? 14 : 26 });
        FX.pop(el);
        FX.coach("correct");
        cur.right = (cur.right || 0) + 1;
      },
      wrong(el) {
        FX.shake(el);
        FX.coach("wrong");
        cur.wrongs = (cur.wrongs || 0) + 1;
      },
      finish(summary) { finish(summary); },
    };
    return A;
  }

  function start(id, opts = {}) {
    cleanup();
    const g = GAMES.find((x) => x.id === id);
    cur = { id, score: 0, opts, timers: [], ended: false, right: 0, wrongs: 0, startedAt: Date.now() };
    $("game-name").textContent = g.name + (opts.warmup ? ` · warm-up ${opts.warmup.i + 1}/3` : "");
    $("game-score").textContent = "0";
    $("game-progress").textContent = "";
    const A = makeApi();
    A.bar(1);
    A.stage.innerHTML = "";
    A.stage.dataset.game = id;
    showScreen("screen-game");
    RUNNERS[id](A.stage, A, opts);
  }

  function quit() {
    cleanup();
    if (cur) cur.ended = true;
    cur = null;
    goTab(document.body.dataset.lastTab || "games");
  }

  function finish(summary) {
    if (!cur || cur.ended) return;
    cur.ended = true;
    cleanup();
    const { id, score, opts } = cur;
    const g = GAMES.find((x) => x.id === id);
    const rec = state.games[id] || { best: 0, plays: 0, last: 0 };
    const isBest = score > (rec.best || 0);
    rec.best = Math.max(rec.best || 0, score);
    rec.plays = (rec.plays || 0) + 1;
    rec.last = score;
    rec.lastDate = todayISO();
    state.games[id] = rec;
    bumpStreak();
    saveState(state);

    const stage = $("game-stage");
    const w = opts.warmup;
    if (w) w.results.push({ id, score });
    const last = w && w.i >= w.ids.length - 1;
    stage.innerHTML = `
      <div class="card end-card" id="end-card">
        <div class="end-emoji">${isBest ? "🏆" : "🎉"}</div>
        <p class="muted small">${esc(g.name)} complete</p>
        <div class="end-score" id="end-score">0</div>
        <p class="muted small">points</p>
        ${isBest ? '<span class="chip good end-best">New best score!</span>' : `<span class="chip end-best">Best: ${rec.best}</span>`}
        <p class="small" style="margin-top:10px">${esc(summary || "")}</p>
        <p class="small muted" style="margin-top:6px" data-coach-line></p>
        <div id="end-actions"></div>
      </div>`;
    FX.countUp($("end-score"), score, 800);
    FX.coach("done");
    setTimeout(() => FX.confetti({ big: true, count: isBest ? 140 : 90 }), 150);
    const actions = $("end-actions");
    if (w && !last) {
      actions.innerHTML = `<button type="button" class="btn-primary" id="btn-warm-next">Next game (${w.i + 2} of 3) →</button>
        <button type="button" class="btn-secondary" id="btn-warm-quit">Stop warm-up</button>`;
      $("btn-warm-next").onclick = () => start(w.ids[w.i + 1], { short: true, warmup: { ...w, i: w.i + 1 } });
      $("btn-warm-quit").onclick = () => quit();
    } else if (w && last) {
      state.warmups[todayISO()] = true;
      saveState(state);
      const total = w.results.reduce((a, r) => a + r.score, 0);
      actions.innerHTML = `
        <div class="card" style="margin-top:14px;text-align:left">
          <div class="card-head"><h2>Warm-up done! 🧠</h2><span class="chip good">${total} pts</span></div>
          ${w.results.map((r) => `<div class="best-row"><span>${GAMES.find((x) => x.id === r.id).icon} ${GAMES.find((x) => x.id === r.id).name}</span><b>${r.score}</b></div>`).join("")}
        </div>
        <button type="button" class="btn-primary" id="btn-warm-done">Back to Home</button>`;
      $("btn-warm-done").onclick = () => { cur = null; goTab("home"); };
      FX.toast("Daily Brain Warm-up complete!");
    } else {
      actions.innerHTML = `<button type="button" class="btn-primary" id="btn-play-again">Play again</button>
        <button type="button" class="btn-secondary" id="btn-games-back">Back to games</button>`;
      $("btn-play-again").onclick = () => start(id, {});
      $("btn-games-back").onclick = () => { cur = null; goTab("games"); };
    }
    if (typeof refreshAll === "function") refreshAll();
  }

  function warmup() {
    const ids = dailyWarmupIds(todayISO());
    start(ids[0], { short: true, warmup: { ids, i: 0, results: [] } });
  }

  /* ---------- The six games ---------- */
  const RUNNERS = {};

  RUNNERS.tone = (stage, A, opts) => {
    const items = shuffle(GAME_TONE).slice(0, opts.short ? 5 : 10);
    let i = 0, right = 0;
    const next = () => {
      if (i >= items.length) return A.finish(`${right} of ${items.length} polite picks.`);
      const it = items[i];
      A.progress(`${i + 1}/${items.length}`);
      const opts2 = shuffle([{ t: it.a, ok: true }, ...it.b.map((t) => ({ t, ok: false }))]);
      stage.innerHTML = `
        <div class="game-q"><p class="eyebrow">Situation</p><p class="mid">${esc(it.s)}</p>
        <p class="muted small" style="margin-top:6px">Which one is the polite CLB 10 version? You have 10 seconds.</p></div>
        <div class="opt-grid">${opts2.map((o, k) => `<button type="button" class="opt" data-k="${k}" ${o.ok ? 'data-ok="1"' : ""}>${esc(o.t)}</button>`).join("")}</div>`;
      const btns = [...stage.querySelectorAll(".opt")];
      let done = false;
      const timer = A.countdown(10, null, () => {
        if (done) return;
        done = true;
        btns.forEach((b) => { b.disabled = true; if (b.dataset.ok) b.classList.add("correct"); });
        A.wrong(stage.querySelector(".game-q"));
        FX.coach("wrong", "Time's up! The green one is the polite version.");
        i++; A.later(next, 1300);
      });
      btns.forEach((b) => b.addEventListener("click", () => {
        if (done) return;
        done = true;
        const left = timer.stop();
        btns.forEach((x) => { x.disabled = true; if (x.dataset.ok) x.classList.add("correct"); });
        if (b.dataset.ok) { right++; A.correct(b, 100 + Math.round(left * 10)); }
        else { b.classList.add("wrong"); A.wrong(b); }
        i++; A.later(next, b.dataset.ok ? 800 : 1400);
      }));
    };
    next();
  };

  RUNNERS.sandwich = (stage, A, opts) => {
    const sets = shuffle(GAME_SANDWICH).slice(0, opts.short ? 2 : 3);
    let r = 0;
    const round = () => {
      if (r >= sets.length) return A.finish(`${sets.length} emails built in the right order.`);
      const set = sets[r];
      A.progress(`Email ${r + 1}/${sets.length}`);
      A.bar(r / sets.length);
      const pile = shuffle(set.bites.map((t, k) => ({ t, k })));
      let expected = 0, errors = 0;
      const t0 = Date.now();
      stage.innerHTML = `
        <div class="game-q"><p class="eyebrow">Email: ${esc(set.t)}</p><p class="small muted">Tap the bites in order: Who, Why, Hurt, Ask, Thanks.</p></div>
        <div class="slots">${SANDWICH_LABELS.map((l, k) => `<div class="slot${k === 0 ? " next" : ""}" data-slot="${k}"><span class="n">${k + 1}</span><span class="st"><span class="lbl">${esc(l)}</span></span></div>`).join("")}</div>
        <div class="bite-pile">${pile.map((p) => `<button type="button" class="opt" data-k="${p.k}">${esc(p.t)}</button>`).join("")}</div>`;
      stage.querySelectorAll(".bite-pile .opt").forEach((b) => b.addEventListener("click", () => {
        const k = Number(b.dataset.k);
        if (k === expected) {
          const slot = stage.querySelector(`[data-slot="${k}"]`);
          slot.classList.remove("next");
          slot.classList.add("filled");
          slot.querySelector(".st").innerHTML = `<span class="lbl">${esc(SANDWICH_LABELS[k])}</span><br>${esc(set.bites[k])}`;
          b.classList.add("used");
          A.add(20, slot);
          expected++;
          const nx = stage.querySelector(`[data-slot="${expected}"]`);
          if (nx) nx.classList.add("next");
          if (expected === 5) {
            const secs = (Date.now() - t0) / 1000;
            const pts = Math.max(20, 100 - errors * 15) + Math.max(0, Math.round(40 - secs));
            A.correct(stage.querySelector(".slots"), pts);
            r++; A.later(round, 1100);
          }
        } else {
          errors++;
          A.wrong(b);
          FX.shake(stage.querySelector(`[data-slot="${expected}"]`));
        }
      }));
    };
    round();
  };

  function sprint(stage, A, opts, pool, render, label) {
    const secs = opts.short ? 40 : 60;
    let items = shuffle(pool), i = 0, right = 0, combo = 0, maxCombo = 0, locked = false;
    A.countdown(secs, (left) => A.progress(`${Math.ceil(left)}s`), () => A.finish(`${right} correct ${label}. Best combo x${maxCombo}.`));
    const next = () => {
      if (i >= items.length) { items = shuffle(pool); i = 0; }
      const it = items[i++];
      const opts2 = shuffle([{ t: it.a, ok: true }, ...it.b.map((t) => ({ t, ok: false }))]);
      stage.innerHTML = render(it) + `<div class="opt-grid two">${opts2.map((o) => `<button type="button" class="opt center" ${o.ok ? 'data-ok="1"' : ""}>${esc(o.t)}</button>`).join("")}</div>
        <p class="center small muted" style="margin-top:12px">Combo <b id="combo">x${combo}</b></p>`;
      locked = false;
      stage.querySelectorAll(".opt").forEach((b) => b.addEventListener("click", () => {
        if (locked) return;
        locked = true;
        if (b.dataset.ok) {
          right++; combo++; maxCombo = Math.max(maxCombo, combo);
          b.classList.add("correct");
          A.correct(b, 100 + Math.min(100, (combo - 1) * 20), true);
          A.later(next, 280);
        } else {
          combo = 0;
          b.classList.add("wrong");
          stage.querySelector('[data-ok="1"]').classList.add("correct");
          A.wrong(b);
          A.later(next, 750);
        }
      }));
    };
    next();
  }

  RUNNERS.words = (stage, A, opts) => sprint(stage, A, opts, GAME_WORDS,
    (it) => `<div class="game-q center"><p class="eyebrow">Upgrade this word</p><p class="big">${esc(it.w)}</p><p class="muted small">Pick the stronger, formal choice</p></div>`, "upgrades");

  RUNNERS.connect = (stage, A, opts) => sprint(stage, A, opts, GAME_CONNECT,
    (it) => `<div class="game-q"><p class="eyebrow">Fill the gap</p><p class="mid">${esc(it.s).replace("___", '<span class="chip">_____</span>')}</p></div>`, "connectors");

  RUNNERS.errors = (stage, A, opts) => {
    const items = shuffle(GAME_ERRORS).slice(0, opts.short ? 5 : 8);
    let i = 0, right = 0;
    const next = () => {
      if (i >= items.length) return A.finish(`${right} of ${items.length} mistakes found first try.`);
      const it = items[i];
      A.progress(`${i + 1}/${items.length}`);
      A.bar(i / items.length);
      let tries = 0, done = false;
      stage.innerHTML = `
        <div class="game-q"><p class="eyebrow">Tap the mistake</p>
          <div class="chunks">${it.c.map((c, k) => `<button type="button" class="chunk" data-k="${k}" ${k === it.x ? 'data-ok="1"' : ""}>${esc(c)}</button>`).join("")}</div>
          <div class="fix-box" id="fix-box"></div>
        </div>`;
      const reveal = (pts) => {
        done = true;
        stage.querySelectorAll(".chunk").forEach((b) => { b.disabled = true; });
        stage.querySelector(`[data-k="${it.x}"]`).classList.add("correct");
        $("fix-box").innerHTML = `<div class="good-line"><b>Fix</b>${esc(it.fix)}</div><p class="kid-line">${esc(it.why)}</p>
          <button type="button" class="btn-primary" id="btn-err-next">${i + 1 >= items.length ? "Finish" : "Next"} →</button>`;
        $("btn-err-next").onclick = () => { i++; next(); };
        if (pts) right += pts === 100 ? 1 : 0;
      };
      stage.querySelectorAll(".chunk").forEach((b) => b.addEventListener("click", () => {
        if (done) return;
        if (Number(b.dataset.k) === it.x) {
          const pts = tries === 0 ? 100 : 50;
          A.correct(b, pts);
          reveal(pts);
        } else {
          tries++;
          b.classList.add("wrong");
          b.disabled = true;
          A.wrong(b);
          if (tries >= 2) reveal(0);
        }
      }));
    };
    next();
  };

  RUNNERS.memory = (stage, A, opts) => {
    const pairs = shuffle(GAME_MEMORY).slice(0, opts.short ? 4 : 6);
    const cards = shuffle(pairs.flatMap((p, k) => [{ k, t: p.f, kind: "phrase" }, { k, t: p.p, kind: "purpose" }]));
    let first = null, lock = false, moves = 0, matched = 0;
    const t0 = Date.now();
    stage.innerHTML = `
      <div class="game-q"><p class="eyebrow">Find the pairs</p><p class="small muted">Match each formal phrase (italic) with what it does.</p></div>
      <div class="mem-grid" style="grid-template-columns:repeat(${cards.length === 8 ? 4 : 3},1fr)">
        ${cards.map((c, n) => `<button type="button" class="mem-card" data-n="${n}" data-k="${c.k}" aria-label="Card ${n + 1}">
          <div class="mem-inner"><div class="mem-face mem-front">?</div><div class="mem-face mem-back ${c.kind}">${esc(c.t)}</div></div></button>`).join("")}
      </div>`;
    const tick = setInterval(() => A.progress(`${Math.round((Date.now() - t0) / 1000)}s · ${moves} moves`), 500);
    cur.timers.push(tick);
    A.progress("0s · 0 moves");
    stage.querySelectorAll(".mem-card").forEach((b) => b.addEventListener("click", () => {
      if (lock || b.classList.contains("flipped") || b.classList.contains("matched")) return;
      b.classList.add("flipped");
      if (!first) { first = b; return; }
      moves++;
      const a = first; first = null;
      if (a.dataset.k === b.dataset.k) {
        a.classList.add("matched"); b.classList.add("matched");
        matched++;
        A.correct(b, 100, true);
        A.bar(matched / pairs.length);
        if (matched === pairs.length) {
          const secs = Math.round((Date.now() - t0) / 1000);
          const bonus = Math.max(0, 300 - (moves - pairs.length) * 25) + Math.max(0, 120 - secs);
          A.add(bonus, stage.querySelector(".mem-grid"));
          A.later(() => A.finish(`All ${pairs.length} pairs in ${moves} moves and ${secs}s.`), 700);
        }
      } else {
        lock = true;
        A.wrong(b);
        A.later(() => { a.classList.remove("flipped"); b.classList.remove("flipped"); lock = false; }, 850);
      }
    }));
  };

  function abort() { cleanup(); if (cur) cur.ended = true; cur = null; }

  return { start, quit, abort, warmup, isPlaying: () => !!(cur && !cur.ended) };
})();
