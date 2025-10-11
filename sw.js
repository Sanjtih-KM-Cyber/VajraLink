const CACHE_NAME = 'vajralink-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/operative.html',
  '/hq/index.html',
  '/manifest.json',
  '/index.css',

  '/index.jsx',
  '/App.jsx',
  '/operative_index.jsx',

  '/common/types.js',
  '/hq/api.js',
  '/hq/types.js',

  '/components/AIAgentMockup.jsx',
  '/components/AppLockScreen.jsx',
  '/components/AuthScreen.jsx',
  '/components/ChatScreen.jsx',
  '/components/CodeBlock.jsx',
  '/components/Dashboard.jsx',
  '/components/GroupInfoPanel.jsx',
  '/components/OperativeApp.jsx',
  '/components/RoleSelectionScreen.jsx',
  '/components/SearchOperativesModal.jsx',
  '/components/SectionCard.jsx',
  '/components/Sidebar.jsx',
  '/components/UserInfoPanel.jsx',
  '/components/VpnCheckScreen.jsx',

  '/hq/index.jsx',
  '/hq/App.jsx',
  '/hq/components/AuthScreen.jsx',
  '/hq/components/ConnectionRequestsView.jsx',
  '/hq/components/DashboardView.jsx',
  '/hq/components/HqLayout.jsx',
  '/hq/components/OperativesView.jsx',
  '/hq/components/Sidebar.jsx',
  '/hq/components/ThreatDetailPanel.jsx',
  '/hq/components/ThreatsView.jsx',
  
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/@babel/standalone@7.24.7/babel.min.js',
  'https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js',
  'https://storage.googleapis.com/aistudio-project-files/f1a5ba43-a67b-4835-961f-442b3112469d/icon-192.png',
  'https://storage.googleapis.com/aistudio-project-files/f1a5ba43-a67b-4835-961f-442b3112469d/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Use addAll with a catch to prevent install failure if one resource fails
        return cache.addAll(urlsToCache).catch(err => {
          console.error('Failed to cache one or more resources:', err);
        });
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
            if (!response || response.status !== 200) {
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
        ).catch(err => {
            console.log('Fetch failed; returning offline page instead.', err);
            // Optionally, return a fallback offline page
            // return caches.match('/offline.html');
        });
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
