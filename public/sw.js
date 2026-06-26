const CACHE = 'doisirmaos-v1'

self.addEventListener('install', e => {
  e.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return

  const url = new URL(e.request.url)

  // Network-first para navegação HTML
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          if (r && r.status === 200) {
            const clone = r.clone()
            caches.open(CACHE).then(c => c.put(e.request, clone))
          }
          return r
        })
        .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
    )
    return
  }

  // Cache-first para assets (JS, CSS, imagens, fontes)
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached
      return fetch(e.request).then(r => {
        if (r && r.status === 200 && r.type !== 'opaque') {
          const clone = r.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone))
        }
        return r
      }).catch(() => cached || new Response('Offline', { status: 503 }))
    })
  )
})
