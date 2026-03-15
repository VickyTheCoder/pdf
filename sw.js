const CACHE_NAME = "pdftool-v1"

const urlsToCache = [
  "/pdf/",
  "/pdf/index.html",
  "/pdf/app.js",
  "/pdf/manifest.json"
]

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache)
    })
  )
})

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request)
    })
  )
})
