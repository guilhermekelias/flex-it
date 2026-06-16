const CACHE_NAME = 'flexit-static-v1';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

const PROTECTED_API_PATHS = [
  '/users',
  '/students',
  '/workouts',
  '/metrics',
  '/nutrition-plans',
  '/observations',
];

const isProtectedApiPath = (pathname) =>
  PROTECTED_API_PATHS.some(
    (apiPath) => pathname === apiPath || pathname.startsWith(`${apiPath}/`),
  );

const isFrontendStaticAsset = (pathname) =>
  pathname.startsWith('/assets/') ||
  pathname.startsWith('/icons/') ||
  pathname === '/manifest.json' ||
  pathname === '/favicon.ico';

const shouldIgnoreRequest = (request, url) =>
  request.method !== 'GET' ||
  url.origin !== self.location.origin ||
  request.headers.has('Authorization') ||
  url.pathname.startsWith('/api/') ||
  isProtectedApiPath(url.pathname);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (shouldIgnoreRequest(request, url)) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/')),
    );
    return;
  }

  if (!isFrontendStaticAsset(url.pathname)) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        if (!response || !response.ok || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
          return response;
        });
      });
    }),
  );
});
