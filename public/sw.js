// Self-unregister and clean up caches on localhost / development
if (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1') {
  self.addEventListener('install', () => self.skipWaiting());
  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .then(() => self.registration.unregister())
        .then(() => self.clients.claim())
    );
  });
}

const CACHE_NAME = 'aims-cache-v4';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.png',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-192.png',
  '/icon-maskable-512.png',
  '/apple-touch-icon.png',
];

// Install: Cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Cache addAll warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: Clean up older cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Network-first for fresh dynamic content, fallback to cache for offline static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Skip browser extension schemes, Next.js chunks, supabase api calls, analytics, and dev localhost
  const url = new URL(request.url);
  if (!url.protocol.startsWith('http')) return;
  if (url.pathname.startsWith('/_next/')) return;
  if (url.pathname.startsWith('/api/')) return;
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return;
  if (url.hostname.includes('supabase.co')) return;
  if (url.hostname.includes('cloudinary.com')) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // If response is valid, clone and update cache for static assets
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            // Only cache images, CSS, JS, fonts
            if (
              url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|woff2|css|js)$/) ||
              STATIC_ASSETS.includes(url.pathname)
            ) {
              cache.put(request, responseToCache);
            }
          });
        }
        return response;
      })
      .catch(async () => {
        // Fallback to cache if offline
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // If HTML request fails, return cached home page
        if (request.headers.get('accept')?.includes('text/html')) {
          const homeResponse = await caches.match('/');
          if (homeResponse) {
            return homeResponse;
          }
        }
        // Always return a valid Response to satisfy event.respondWith
        return new Response('Network request failed or offline', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain' }),
        });
      })
  );
});
