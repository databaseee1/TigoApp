const CACHE_NAME = "Tigoapp.v2";
const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./192x192.png",
  "./512x512.png",
  "./offline.html"
];

// Install Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        urlsToCache.map((url) =>
          fetch(url)
            .then((response) => {
              if (!response.ok) {
                throw new Error("Gagal fetch: " + url);
              }
              return cache.put(url, response);
            })
            .catch((err) => {
              console.warn("⚠️ Gagal cache:", url, err.message);
            })
        )
      );
    })
  );
  self.skipWaiting(); // langsung aktifkan versi baru
});

// Fetch dengan fallback ke offline.html
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return; // hanya tangani request GET
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((response) => {
          return response || caches.match("./offline.html");
        });
      })
  );
});

// Hapus cache lama
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  console.log("✅ Service Worker: Activated");
  self.clients.claim(); // pastikan langsung kontrol page
});
