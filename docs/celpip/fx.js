/* CELPIP Coach v5 · effects: confetti, toast, shake, progress rings, coach line */
"use strict";

const FX = (() => {
  const mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  const reduced = () => mq.matches || document.documentElement.classList.contains("reduce-motion");

  /* ---- Hand-rolled canvas confetti ---- */
  let canvas, ctx, parts = [], raf = null;
  const COLORS = ["#0070f2", "#30914c", "#e76500", "#5d36ff", "#4db1ff", "#d1efff", "#f5b04d"];
  function ensureCanvas() {
    if (canvas) return;
    canvas = document.getElementById("confetti");
    ctx = canvas.getContext("2d");
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      canvas.style.width = innerWidth + "px";
      canvas.style.height = innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    addEventListener("resize", resize);
  }
  function confetti(opts = {}) {
    if (reduced()) return;
    ensureCanvas();
    const count = opts.count || 70;
    let x = opts.x, y = opts.y;
    if (opts.el) {
      const r = opts.el.getBoundingClientRect();
      x = r.left + r.width / 2;
      y = r.top + r.height / 2;
    }
    if (x == null) x = innerWidth / 2;
    if (y == null) y = innerHeight / 3;
    const spread = opts.spread || (opts.big ? 1 : 0.6);
    for (let i = 0; i < count; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.6 * spread;
      const v = (opts.big ? 9 : 6) + Math.random() * (opts.big ? 7 : 4);
      parts.push({
        x, y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        g: 0.22 + Math.random() * 0.1,
        w: 6 + Math.random() * 6,
        h: 4 + Math.random() * 6,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        c: COLORS[(Math.random() * COLORS.length) | 0],
        life: 0,
        max: 70 + Math.random() * 50,
        round: Math.random() < 0.3,
      });
    }
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function tick() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter((p) => p.life < p.max && p.y < innerHeight + 40);
    for (const p of parts) {
      p.life++;
      p.vy += p.g;
      p.vx *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - p.life / p.max);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.w / 2.4, 0, Math.PI * 2); ctx.fill(); }
      else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (parts.length) raf = requestAnimationFrame(tick);
    else { raf = null; ctx.clearRect(0, 0, innerWidth, innerHeight); }
  }

  /* ---- Shake / pop ---- */
  function shake(el) {
    if (!el) return;
    if (navigator.vibrate) try { navigator.vibrate(30); } catch (e) {}
    el.classList.remove("shake");
    void el.offsetWidth;
    el.classList.add("shake");
    setTimeout(() => el.classList.remove("shake"), 500);
  }
  function pop(el) {
    if (!el) return;
    el.classList.remove("pop");
    void el.offsetWidth;
    el.classList.add("pop");
    setTimeout(() => el.classList.remove("pop"), 450);
  }

  /* ---- Toast ---- */
  let toastTimer = null;
  function toast(msg, ms = 2200) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.hidden = false;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      t.classList.remove("show");
      setTimeout(() => { t.hidden = true; }, 300);
    }, ms);
  }

  /* ---- Progress ring (SVG) ---- */
  function ring({ value = 0, max = 1, size = 92, stroke = 9, center = "", sub = "", cls = "" }) {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const pct = Math.max(0, Math.min(1, max ? value / max : 0));
    const wrap = document.createElement("div");
    wrap.className = `ring ${cls}`;
    wrap.style.width = size + "px";
    wrap.innerHTML = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
        <circle class="ring-track" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}" fill="none"/>
        <circle class="ring-fill" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}" fill="none"
          stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c}"
          transform="rotate(-90 ${size / 2} ${size / 2})"/>
      </svg>
      <div class="ring-center"><span class="ring-num">${center}</span><span class="ring-sub">${sub}</span></div>`;
    const fill = wrap.querySelector(".ring-fill");
    const target = c * (1 - pct);
    if (reduced()) fill.style.strokeDashoffset = target;
    else requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.strokeDashoffset = target; }));
    return wrap;
  }

  /* ---- Count-up number ---- */
  function countUp(el, to, ms = 700, suffix = "") {
    if (reduced()) { el.textContent = to + suffix; return; }
    const start = performance.now();
    const from = 0;
    const step = (t) => {
      const k = Math.min(1, (t - start) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(from + (to - from) * e) + suffix;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---- Coach line ---- */
  function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }
  function coach(kind = "hello", text) {
    const msg = text || pick(COACH_LINES[kind] || COACH_LINES.hello);
    document.querySelectorAll("[data-coach-line]").forEach((el) => {
      el.classList.remove("coach-in");
      void el.offsetWidth;
      el.textContent = msg;
      el.classList.add("coach-in");
    });
    return msg;
  }

  return { confetti, shake, pop, toast, ring, countUp, coach, reduced, pick };
})();
