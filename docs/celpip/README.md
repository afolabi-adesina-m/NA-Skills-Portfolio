# CELPIP Coach v6

A small offline study app for Afolabi's 30-day CELPIP Writing challenge (Oct 5 to Nov 3, 2026, target CLB 10+).
Plain HTML, CSS and JavaScript. No frameworks, no UI library, no build step, no server code.

Live path when deployed: `https://afolabi-adesina-m.github.io/NA-Skills-Portfolio/celpip/`
(the page has `<meta name="robots" content="noindex">`, so search engines skip it).

v6 adds a short grammar lesson and a lesson-first step before practice. v5 rebuilt the layout and navigation.
Content, games, the draft checker, the calendar, the phrase bank and saved progress still carry over. The storage key is unchanged.

## How it is laid out

There is no bottom tab bar any more. Every screen works the same way: **launchpad, then app, then back**.

**Launchpad** (the home screen): a dark shell bar ("CELPIP Coach", settings, avatar AA) and five groups of same-size tiles, 2 per row on a phone:

| Group | Tiles |
|---|---|
| Today | Today's task (Day N of 30 and the one next action), Daily Warm-up, Streak |
| Learn | Lesson 1, Lesson 2, Lesson 3, Grammar (subject-verb agreement), Phrase Bank, Watch List, Baby Steps |
| Practice | Task 1 Emails (done count), Task 2 Surveys, Timed Draft (opens your next unfinished Task 1 on the Write tab) |
| Games | One tile per game with your best score |
| Progress | 30-Day Plan, CLB estimate |

**Every app page** uses the same frame:
* Shell bar with a back arrow and the page title.
* Header with the title, a subtitle and key status (timer, score, CLB).
* Content.
* A footer bar pinned to the bottom. The one main action is the blue button on the right. Back, Cancel or Quit sit on the left. Each screen has only one blue button.

**Prompt lists** (Task 1 and Task 2): search box, filter chips (All, Not started, In progress, Done), and status labels in grey, orange or green with the best CLB.
Tap a prompt to open its page, with tabs **Prompt, Plan, Write, Model answer, Review**.
The timer starts the first time you open Write, and shows in the header. If you try to leave a draft that is in progress, a dialog asks first (your text is saved either way).

**Step by step screens**: Lessons 1 and 2, the grammar lesson, and the Sandwich Sort game show numbered steps, one step per screen, with Previous and Next in the footer. Lesson 1 uses: 1 Who I am, 2 Why I write, 3 How it hurts me, 4 What I want, 5 Thank you.

**Lesson first**: opening a Task 1 email, a Task 2 survey, or Timed Draft shows a short Lesson first step until the linked lesson is finished. The blue button is Start lesson. Skip to practice is a smaller text link. Task 1 links to Lesson 1, 2 or 3 (the one that fits, or the next one you have not finished) and then the grammar lesson. Task 2 links to the grammar lesson. Lesson 3's own timed draft does not ask you to finish Lesson 3 first. Skip does not erase saved progress.

**Feedback**: coloured message strips (blue info, green success, orange warning, red error), small toasts for quick confirmations,
and dialogs only for real confirmations. Confetti only plays when you finish a lesson or a game.

**Settings** (gear icon): dark theme, reduced motion (also follows the phone setting), app version.

The CLB number is an **estimate** from simple rules in `checker.js`. It is not an official CELPIP score.

## Files (everything goes into `docs/celpip/`)

```
index.html      shell bar, pages, footer bar, dialog, toasts
styles.css      light and dark themes, tiles, pages, lists, wizard, strips
ui.js           small UI kit: icons, tiles, footer bar, message strips, status labels, wizard steps, dialog
content.js      prompts, model answers, phrases, game data, watch list (same as v4)
checker.js      draft checker and CLB estimate, also runs in Node (same as v4)
fx.js           confetti, rings, shake, toasts
games.js        the six games and the daily warm-up
lessons.js      Lessons 1 to 3, plus Grammar: subject-verb agreement
app.js          state, migration, router, launchpad, pages, calendar, writer, review
sw.js           offline cache
manifest.json   install info (scope ./)
icons/          app icons
```

## Offline cache and updates

* `sw.js` uses cache `celpip-email-coach-v6`, scope `./` (only the celpip folder).
* It calls `skipWaiting()` and `clients.claim()`, and removes older `celpip-email-coach-*` caches.
* Files come cache-first, so HTML, CSS and JS always match one version.
* **To ship a change:** edit the files, then bump `CACHE` in `sw.js` (for example to `celpip-email-coach-v6`).
  Open pages will show "Update available, tap to refresh".
* The first visit after a new cache goes live may still show the previous version for one load while the new worker installs. The next load is current.

## Saved progress

* v6 keeps the same localStorage key as v4 and v5: `celpip-coach-v4` (schema 4). Nothing is renamed, so no progress is lost.
* The grammar lesson adds `lessonGrammarCompletions` (starts at 0 when missing) and `lessonsTouched.4`. Drafts, scores, streak and the other fields stay as they are.
* `seenV5` is still the one-time "New look" toast from v5.
* The v2/v3 migration is still there: on a first run with no v4 data it copies progress from `celpip-email-coach-v1`
  (it also checks `celpip-email-coach-v3` and `-v2`). The old key is left alone as a backup.

## Run it locally

```bash
mkdir -p /tmp/site/NA-Skills-Portfolio && cp -r celpip-v5 /tmp/site/NA-Skills-Portfolio/celpip
cd /tmp/site && python3 -m http.server 8765
# open http://localhost:8765/NA-Skills-Portfolio/celpip/
```

## Deploy

Copy the contents of this folder into `docs/celpip/` in the `NA-Skills-Portfolio` repo, replacing the v4 files
(add the new `ui.js`), then commit and push. GitHub Pages serves it under `/NA-Skills-Portfolio/celpip/`. All paths are relative.
