self.addEventListener('install', () => {
  // Activate the service worker immediately so caching works on first load.
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // Remove old caches that do not match the current version.
  const currentCaches = ['gereni-fb-cache-v1'];
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith('gereni-') && !currentCaches.includes(key))
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

const isFacebookEmbedRequest = request => {
  if (request.method !== 'GET') {
    return false;
  }

  const { origin, pathname } = new URL(request.url);

  if (origin === 'https://connect.facebook.net') {
    // Facebook SDK loader.
    return pathname.endsWith('/sdk.js');
  }

  if (origin === 'https://www.facebook.com') {
    // The page plugin iframe content.
    return pathname.startsWith('/plugins/page.php');
  }

  return false;
};

self.addEventListener('fetch', event => {
  if (!isFacebookEmbedRequest(event.request)) {
    return;
  }

  event.respondWith(
    (async () => {
      const cacheName = 'gereni-fb-cache-v1';
      const cache = await caches.open(cacheName);
      const cached = await cache.match(event.request);

      const networkFetch = fetch(event.request)
        .then(response => {
          if (response && (response.ok || response.type === 'opaque')) {
            cache.put(event.request, response.clone());
          }
          return response;
        })
        .catch(error => {
          if (cached) {
            return cached;
          }
          throw error;
        });

      if (cached) {
        // Return cached response immediately and refresh in the background.
        event.waitUntil(networkFetch.catch(() => undefined));
        return cached;
      }

      return networkFetch;
    })()
  );
});
