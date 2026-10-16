// Uygulama kabuğunu önbelleğe alır; veriler (API) her zaman sunucudan gelir.
const CACHE = "musteri-bulucu-v1";
const SHELL = ["/static/style.css", "/static/app.js", "/static/countries.json", "/static/icon-192.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin || url.pathname.startsWith("/api/")) return;
  // Önce ağ, bağlantı yoksa önbellek
  e.respondWith(fetch(e.request).then((r) => {
    if (r.ok && url.pathname.startsWith("/static/")) { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, cp)); }
    return r;
  }).catch(() => caches.match(e.request).then((m) => m || new Response("Bağlantı yok. İnternet bağlantınızı kontrol edin.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }))));
});
