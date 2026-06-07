/* Mhanga Service Worker — offline-capable PWA
   Strategy:
     - HTML / navigation requests  → NETWORK-FIRST (so app updates appear
       immediately; falls back to cache only when offline)
     - Everything else (manifest, icons, future assets) → CACHE-FIRST with
       background refresh
   Bump CACHE on every release to evict the previous shell. */
const CACHE = "mhanga-v2";
const SHELL = ["/", "/index.html", "/manifest.json"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isHTML(req) {
  return req.mode === "navigate" ||
    (req.headers.get("accept") || "").includes("text/html");
}

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;

  if (isHTML(e.request)) {
    // Network-first: always try fresh HTML, fall back to cache offline
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match(e.request).then(r => r || caches.match("/index.html")))
    );
    return;
  }

  // Cache-first for static assets, refresh in background
  e.respondWith(
    caches.match(e.request).then(cached => {
      const net = fetch(e.request).then(res => {
        if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      }).catch(() => cached);
      return cached || net;
    })
  );
});
