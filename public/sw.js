// Servicio de caché: la página abre al instante y funciona sin internet (usa lo último que cargó).
const V = 'luzmila-v2'
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim()))
})
self.addEventListener('fetch', (e) => {
  const r = e.request
  if (r.method !== 'GET' || new URL(r.url).origin !== self.location.origin) return
  e.respondWith(caches.open(V).then(async (c) => {
    const hit = await c.match(r)
    const red = fetch(r).then((res) => { if (res.ok) c.put(r, res.clone()); return res }).catch(() => hit)
    return hit || red
  }))
})
