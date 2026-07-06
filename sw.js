const CACHE = "gate-v4";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./img/return-greet.png",
  "./img/return-evening.png",
  "./img/return-bath.png",
  "./img/return-prebed.png",
  "./icon-192.png",
  "./icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      // 一括addAllだと1つの欠品で全滅するため、個別に拾い失敗は無視する
      Promise.all(ASSETS.map((a) => c.add(a).catch(() => {})))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // 取得に成功した同一オリジンの資産はキャッシュへ写しておく
        if (res.ok && new URL(e.request.url).origin === self.location.origin) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
