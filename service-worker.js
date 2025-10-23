const SHELL_CACHE = 'gereni-shell-v1';
const DATA_CACHE = 'gereni-data-v1';
const FB_CACHE = 'gereni-fb-cache-v1';

const PRECACHE_URLS = [
  'index.html',
  'menu.html',
  'styles/main.css',
  'styles/print.css',
  'scripts/i18n.js',
  'scripts/theme.js',
  'scripts/headerControls.js',
  'scripts/loadMenu.js',
  'scripts/pdfLink.js',
  'scripts/swRegister.js',
  'data/menu.json',
  'assets/logo-gereni-bar-restaurant.png',
  'assets/photos/cocktails-600x441.png',
  'assets/photos/Flag_of_Costa_Rica.svg',
  'assets/qr/gereni-menu-qr.png',
  'assets/El_Rancho.jpg',
  'favicon.svg'
];

const DATA_PRECACHE_URLS = ['data/menu.json'];

const resolveUrl = (path) => new URL(path, self.location).toString();

const isSameOrigin = (request) => new URL(request.url).origin === self.location.origin;

self.addEventListener('install', (event) => {
  // Activate the service worker immediately so caching works on first load.
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      const shellCache = await caches.open(SHELL_CACHE);
      await shellCache.addAll(PRECACHE_URLS.map(resolveUrl));

      const dataCache = await caches.open(DATA_CACHE);
      await dataCache.addAll(DATA_PRECACHE_URLS.map(resolveUrl));
    })()
  );
});

self.addEventListener('activate', (event) => {
  // Remove old caches that do not match the current version.
  const currentCaches = [SHELL_CACHE, DATA_CACHE, FB_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('gereni-') && !currentCaches.includes(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

const isFacebookEmbedRequest = (request) => {
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

const cacheFirst = async (request) => {
  const cache = await caches.open(SHELL_CACHE);
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone());
  }
  return response;
};

const networkFirstData = async (request) => {
  const cache = await caches.open(DATA_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
};

const handleNavigation = async (request) => {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cache = await caches.open(SHELL_CACHE);
    const url = new URL(request.url);
    const fallbackPaths = [];
    if (url.pathname.endsWith('/menu.html')) {
      fallbackPaths.push('menu.html');
    }
    fallbackPaths.push('index.html');

    for (const path of fallbackPaths) {
      const cached = await cache.match(resolveUrl(path));
      if (cached) {
        return cached;
      }
    }
    throw error;
  }
};

const handleFacebookRequest = async (request, event) => {
  const cache = await caches.open(FB_CACHE);
  const cached = await cache.match(request);

  const networkFetch = fetch(request)
    .then((response) => {
      if (response && (response.ok || response.type === 'opaque')) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch((error) => {
      if (cached) {
        return cached;
      }
      throw error;
    });

  if (cached) {
    event.waitUntil(networkFetch.catch(() => undefined));
    return cached;
  }

  return networkFetch;
};

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') {
    return;
  }

  if (isFacebookEmbedRequest(request)) {
    event.respondWith(handleFacebookRequest(request, event));
    return;
  }

  if (!isSameOrigin(request)) {
    return;
  }

  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  if (url.pathname.endsWith('/data/menu.json')) {
    event.respondWith(networkFirstData(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});
