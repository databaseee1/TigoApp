const CACHE_NAME = "Tigoapp.v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./192x192.png",
  "./512x512.png",
  "./offline.html"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        urlsToCache.map((url) =>
          cache.add(url).catch((err) => {
            console.warn("Gagal cache:", url, err);
          })
        )
      );
    })
  );
});

// Fetch dengan fallback ke offline.html
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Simpan response ke cache (optional, biar update otomatis)
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => {
        // Kalau offline, ambil dari cache atau offline.html
        return caches.match(event.request).then((response) => {
          return response || caches.match("./offline.html");
        });
      })
  );
});

// Update cache lama kalau ada versi baru
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
  console.log("Service Worker: Activated");
});