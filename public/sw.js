const CACHE = 'hs-cache-v1'
const ASSETS = [
  '/',
  '/index.html'
]

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)))
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  )
})

self.addEventListener('fetch', event => {
  const { request } = event
  if (request.method !== 'GET') return
  event.respondWith(
    caches.match(request).then(cached => {
      const fetchPromise = fetch(request).then(response => {
        const copy = response.clone()
        caches.open(CACHE).then(cache => cache.put(request, copy)).catch(() => {})
        return response
      }).catch(() => cached || new Response('Offline', { status: 503 }))
      return cached || fetchPromise
    })
  )
})