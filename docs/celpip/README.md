# CELPIP Coach v4

A small offline study app for Afolabi's 30-day CELPIP Writing challenge (Oct 5 to Nov 3, 2026, target CLB 10+).
Plain HTML, CSS and JavaScript. No frameworks, no build step, no server code.

Live path when deployed: `https://afolabi-adesina-m.github.io/NA-Skills-Portfolio/celpip/`
(the page has `<meta name="robots" content="noindex">`, so search engines skip it).

## What is inside

| Tab | What you can do |
|---|---|
| Home | Streak, latest CLB estimate and 30-day progress rings, today's plan, the Daily Brain Warm-up (3 short games), and the watch list from the Day 1 baseline. |
| Learn | Lessons 1 to 3 from v2/v3, two baby-step guides, and the swipeable phrase bank (36 cards in 6 groups, with favourite stars). |
| Games | Six brain games: Tone Swap, Sandwich Sort, Word Upgrade, Error Hunt, Memory Match, Connector Rush. Each is scored and keeps your best score. |
| Write | 12 Task 1 email prompts (27 min) and 6 Task 2 survey prompts (26 min) in the CELPIP layout. Task 2 has a 5-step planner. A timed writer runs the draft checker, then shows a CLB estimate with 4 parts. The CLB 10 model answers (150 to 200 words, with highlighted phrases and notes) unlock after you try. |
| Progress | 30-day calendar (today ringed, tap a day to mark it done, Days 1 to 4 are baselines), best game scores, and recent attempts. |

There is also a dark mode (the moon button), a reduced-motion setting (it also follows the phone's setting), confetti, progress rings and card flips.

The CLB number is an **estimate** from simple rules in `checker.js`. It is not an official CELPIP score.

## Files (everything goes into `docs/celpip/`)

```
index.html      app shell, screens, tab bar, toasts
styles.css      soft navy theme, light and dark
content.js      prompts, model answers, phrases, game data, watch list
checker.js      draft checker and CLB estimate (also runs in Node)
fx.js           confetti, rings, shake, toasts, coach line
games.js        the six games and the daily warm-up
lessons.js      Lessons 1 to 3 (carried over from v3)
app.js          state, migration, tabs, calendar, writer, review
sw.js           offline cache
manifest.json   install info (scope ./)
icons/          app icons
```

## Offline cache and updates

* `sw.js` uses cache `celpip-email-coach-v4`, scope `./` (only the celpip folder).
* It calls `skipWaiting()` and `clients.claim()`, and removes older `celpip-email-coach-*` caches.
* Files come cache-first, so HTML, CSS and JS always match one version.
* **To ship a change:** edit the files, then bump `CACHE` in `sw.js` (for example to `celpip-email-coach-v5`).
  Open pages will show "Update available, tap to refresh".
* The first visit after v4 goes live may still show v3 for one load while the new worker installs. The next load is v4.

## Saved progress

* v4 stores everything in localStorage key `celpip-coach-v4`.
* On first run it copies progress from the v2/v3 key `celpip-email-coach-v1`
  (it also checks `celpip-email-coach-v3` and `-v2`): lesson counts, scenarios, last score and band.
  It rebuilds the streak days from the old streak.
* The old key is left alone as a backup.

## Run it locally

```bash
mkdir -p /tmp/site/NA-Skills-Portfolio && cp -r celpip-v4 /tmp/site/NA-Skills-Portfolio/celpip
cd /tmp/site && python3 -m http.server 8765
# open http://localhost:8765/NA-Skills-Portfolio/celpip/
```

## Deploy

Copy the contents of this folder into `docs/celpip/` in the `NA-Skills-Portfolio` repo, replacing the v3 files, then commit and push. GitHub Pages serves it under `/NA-Skills-Portfolio/celpip/`. All paths are relative.
