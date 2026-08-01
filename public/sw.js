const CACHE_NAME = 'pwa-cache-v2'

self.addEventListener('install', (event) => {
	self.skipWaiting()
})

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames.map((cache) => {
						if (cache !== CACHE_NAME) {
							console.log('Clearing old cache:', cache)
							return caches.delete(cache)
						}
					}),
				)
			})
			.then(() => self.clients.claim()),
	)
})

self.addEventListener('fetch', (event) => {
	if (
		event.request.method !== 'GET' ||
		!event.request.url.startsWith(self.location.origin)
	) {
		return
	}

	event.respondWith(
		fetch(event.request)
			.then((networkResponse) => {
				if (networkResponse.status === 200) {
					const responseToCache = networkResponse.clone()
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(event.request, responseToCache)
					})
				}
				return networkResponse
			})
			.catch(() => {
				return caches.match(event.request)
			}),
	)
})
