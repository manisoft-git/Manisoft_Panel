// Service Worker: Offline Caching & Instant Boot
const CACHE_NAME = 'manisoft-v100';
const ASSETS = [
  '/',
  '/public/style.css',
  '/public/app.js',
  '/public/sound.js',
  '/public/radial.js',
  '/public/worker.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('/api/')) return;
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request).catch(() => caches.match('/')))
  );
});
