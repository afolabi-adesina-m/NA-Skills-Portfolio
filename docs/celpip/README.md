# CELPIP Email Coach

Personal, mobile-first PWA for **CELPIP Writing Task 1** (emails). Target: **CLB 10**.  
No accounts. No backend. Progress stays in the browser (`localStorage`).

## Lessons

1. **Fill the Gaps** · email sandwich in 5 bites with instant feedback  
2. **Tone and Grammar** · you/your · cut weak openers · rewrite threats politely  
3. **Full Timed Draft** · 27-minute free write · subject + body · band estimate  

### Email sandwich (5 bites)

1. Who I am  
2. Why I write  
3. How it hurts me  
4. What I want (clear ask + polite timeline)  
5. Thank you + name  

Rules: no threats · skip "I hope this email meets you well" · firm but polite · subject + body.

## Open on your phone

Same Wi-Fi is fastest:

```bash
cd celpip-email-coach
python3 -m http.server 8765
# or: npx --yes serve -l 8765
```

Open `http://YOUR_LAN_IP:8765` on the phone → **Add to Home Screen**.  
After the first load, the service worker (cache `v3`) works offline.  
If the phone shows an old build, hard-refresh or clear site data once so `v3` installs.

### GitHub Pages

Unlisted path on the portfolio site (`docs/` → Pages): `/NA-Skills-Portfolio/celpip/`.  
Not linked from the hub, nav, or project pages. Paths in the page, manifest (`start_url` / `scope`), and service worker registration are relative, and the worker is scoped to this folder only (cache `v3`).

Prefer HTTP over `file://` so the service worker can register.

## Files

- `index.html` · screens (home, L1, L2, L3, result)  
- `styles.css` · mobile-first soft navy UI  
- `app.js` · lessons, scoring, localStorage  
- `manifest.json` / `sw.js` · PWA (cache **v3**, folder scope only)  
- `icons/` · home-screen icons  

Viewport target: **390px**.

## Progress

Stored under `celpip-email-coach-v1`: streak, per-lesson completions, last band, path progress (0/3 lessons).

## Personal use

Built for Afolabi's CELPIP practice only.
