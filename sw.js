const CACHE_NAME = 'vajralink-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/operative.html',
  '/index.tsx',
  '/App.tsx',
  '/components/OperativeApp.tsx',
  '/components/AuthScreen.tsx',
  '/components/VpnCheckScreen.tsx',
  '/components/Dashboard.tsx',
  '/components/Sidebar.tsx',
  '/components/ChatScreen.tsx',
  '/components/AppLockScreen.tsx',
  'https://cdn.tailwindcss.com',
  'https://storage.googleapis.com/aistudio-project-files/f1a5ba43-a67b-4835-961f-442b3112469d/icon-192.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // Don't cache API requests
  if (requestUrl.pathname.startsWith('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
