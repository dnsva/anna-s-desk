const CACHE = 'annas-desk-v4';
const BASE = '/anna-s-desk';
const PRECACHE = [
  BASE + '/', BASE + '/index.html', BASE + '/support.js',
  BASE + '/manifest.json', BASE + '/icon-192.png', BASE + '/icon-512.png',
  BASE + '/sections/checklist.js', BASE + '/sections/schedule.js',
  BASE + '/sections/dates.js',     BASE + '/sections/recipes.js',
  BASE + '/sections/workout.js',   BASE + '/sections/habits.js',
  BASE + '/sections/photos.js',    BASE + '/sections/notes.js',
  BASE + '/sections/trash.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // Network-first for Supabase and CDN resources (need fresh data / scripts)
  if (url.includes('supabase.co') || url.includes('cdn.jsdelivr') || url.includes('unpkg.com') || url.includes('fonts.')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  // Cache-first for the app shell
  e.respondWith(
    caches.match(e.request).then(hit => {
      if (hit) return hit;
      return fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      });
    })
  );
});
