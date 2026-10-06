/* CELPIP Coach v5 · offline cache
   Scope is this folder only (the script directory). Requests outside /celpip/ are never
   cached or claimed, so the rest of the portfolio is untouched. */
const CACHE = "celpip-email-coach-v5";
const SCOPE_URL = new URL("./", self.location);

function inScope(url) {
  return url.origin === SCOPE_URL.origin && url.pathname.startsWith(SCOPE_URL.pathname);
}

const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./content.js",
  "./checker.js",
  "./fx.js",
  "./ui.js",
  "./games.js",
  "./lessons.js",
  "./app.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // cache: "reload" skips the HTTP cache so a new version never stores stale files
      .then((cache) => cache.addAll(ASSETS.map((u) => new Request(u, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("celpip-email-coach-") && k !== CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

/* Cache first within a version so HTML, CSS and JS always match.
   New versions arrive by changing CACHE above, which triggers the in-app update toast. */
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (!inScope(url) || url.pathname.endsWith("/sw.js")) return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: event.request.mode === "navigate" }).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((res) => {
          if (res && res.ok && inScope(new URL(res.url))) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          }
          return res;
        })
        .catch(() =>
          event.request.mode === "navigate" ? caches.match("./index.html") : Response.error()
        );
    })
  );
});
