/* CELPIP Coach v5 · UI kit: line icons, footer toolbar, message strips, object status,
   wizard step indicator, tiles, confirmation dialog. Plain JS, no library. */
"use strict";

const ICONS = {
  back: '<path d="M15 18l-6-6 6-6"/>',
  chevron: '<path d="M9 18l6-6-6-6"/>',
  chevronLeft: '<path d="M15 18l-6-6 6-6"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  layers: '<path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  cards: '<rect x="2" y="7" width="14" height="14" rx="2"/><path d="M8 3h12a2 2 0 0 1 2 2v12"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/>',
  survey: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 12h6M9 16h4"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  trend: '<path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  success: '<circle cx="12" cy="12" r="10"/><path d="M8 12.5l2.5 2.5L16 9.5"/>',
  warning: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/>',
  error: '<circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
  play: '<path d="M6 4l14 8-14 8z"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  home: '<path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
};

const UI = (() => {
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  function icon(name, cls = "") {
    return `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.info}</svg>`;
  }

  /* ---- Message strip: info | success | warning | error. text is already-safe HTML. ---- */
  const STRIP_ICON = { info: "info", success: "success", warning: "warning", error: "error" };
  function strip(type, html, title) {
    const role = type === "error" || type === "warning" ? "alert" : "status";
    return `<div class="msg-strip ${type}" role="${role}">${icon(STRIP_ICON[type] || "info", "ms-ico")}<div class="ms-text">${title ? `<b>${title}</b> ` : ""}${html}</div></div>`;
  }

  /* ---- Object status: neutral | critical | positive | negative | info ---- */
  const STATUS_ICON = { neutral: "", critical: "clock", positive: "success", negative: "error", info: "info" };
  function status(kind, text, extra = "") {
    const ic = STATUS_ICON[kind];
    return `<span class="obj-status ${kind} ${extra}">${ic ? icon(ic) : ""}<span>${esc(text)}</span></span>`;
  }

  /* ---- Footer toolbar. Exactly one emphasized (primary) action, placed last on the right. ---- */
  function setFooter(buttons) {
    const foot = document.getElementById("footer");
    const bar = document.getElementById("footer-bar");
    const list = (buttons || []).filter(Boolean);
    const emph = list.filter((b) => b.type === "emph");
    if (emph.length > 1) console.warn("Only one primary action per screen", emph.map((b) => b.id));
    // primary always last (right)
    const ordered = [...list.filter((b) => b.type !== "emph"), ...emph];
    bar.innerHTML = ordered.map((b) => `<button type="button" class="btn ${b.type || "default"}${b.icon && !b.label ? " icon-only" : ""}" id="${b.id}"
      ${b.disabled ? "disabled" : ""} ${b.aria ? `aria-label="${esc(b.aria)}"` : ""} ${b.pressed != null ? `aria-pressed="${b.pressed}"` : ""}>
      ${b.icon ? icon(b.icon) : ""}${b.label ? `<span>${esc(b.label)}</span>` : ""}</button>`).join("");
    ordered.forEach((b) => { if (b.onClick) document.getElementById(b.id).addEventListener("click", b.onClick); });
    foot.hidden = !ordered.length;
    document.body.classList.toggle("has-footer", ordered.length > 0);
  }

  /* ---- Wizard step indicator ---- */
  function wizard(labels, current, opts = {}) {
    const done = opts.done || ((i) => i < current);
    return `<ol class="wizard" aria-label="Steps">${labels.map((l, i) => {
      const st = i === current ? "current" : done(i) ? "done" : "todo";
      return `<li class="wz-step ${st}" ${i === current ? 'aria-current="step"' : ""}>
        <span class="wz-dot">${st === "done" ? icon("check") : i + 1}</span><span class="sr-only">${esc(l)}${st === "done" ? ", done" : ""}</span></li>`;
    }).join("")}</ol>
    <p class="wz-label"><span class="muted">Step ${current + 1} of ${labels.length}:</span> ${esc(labels[current] || "")}</p>`;
  }

  /* ---- Generic tile ---- */
  function tile(t) {
    const kpi = t.kpi != null && t.kpi !== ""
      ? `<span class="tile-kpi ${t.kpiColor || ""}"><b>${esc(t.kpi)}</b>${t.unit ? `<small>${esc(t.unit)}</small>` : ""}</span>`
      : "";
    return `<button type="button" class="tile${t.cls ? " " + t.cls : ""}" id="${t.id}" aria-label="${esc(t.aria || `${t.title}. ${t.sub || ""} ${t.kpi != null ? t.kpi : ""} ${t.unit || ""}. ${t.foot || ""}`)}">
      <span class="tile-head"><span class="tile-title">${esc(t.title)}</span>${t.sub ? `<span class="tile-sub">${esc(t.sub)}</span>` : ""}</span>
      <span class="tile-content">${kpi}${t.icon ? icon(t.icon, "tile-ico") : ""}</span>
      <span class="tile-foot ${t.footCls || ""}">${t.footIcon ? icon(t.footIcon) : ""}<span>${esc(t.foot || "")}</span></span>
    </button>`;
  }

  /* ---- Animated success check ---- */
  function successCheck(size = 56) {
    return `<svg class="success-check" width="${size}" height="${size}" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24"/><path d="M15 27l7 7 15-15"/></svg>`;
  }

  /* ---- Confirmation dialog (native <dialog>) ---- */
  function confirm({ title, text, ok = "OK", cancel = "Cancel", danger = false }) {
    return new Promise((resolve) => {
      const d = document.getElementById("dialog");
      document.getElementById("dlg-title").textContent = title;
      document.getElementById("dlg-text").textContent = text;
      const okB = document.getElementById("dlg-ok");
      const noB = document.getElementById("dlg-cancel");
      okB.textContent = ok;
      noB.textContent = cancel;
      okB.className = `btn ${danger ? "negative" : "emph"}`;
      const done = (v) => {
        okB.onclick = noB.onclick = null;
        d.removeEventListener("cancel", onCancel);
        if (d.open) d.close();
        resolve(v);
      };
      const onCancel = (e) => { e.preventDefault(); done(false); };
      okB.onclick = () => done(true);
      noB.onclick = () => done(false);
      d.addEventListener("cancel", onCancel);
      if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", "");
      noB.focus();
    });
  }

  return { esc, icon, strip, status, setFooter, wizard, tile, successCheck, confirm };
})();
