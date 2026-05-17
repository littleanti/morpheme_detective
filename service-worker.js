const CACHE_VERSION = 'morpheme-detective-v1';

const APP_SHELL_URLS = [
  '/',
  'index.html',
  'manifest.webmanifest',
  'src/css/tokens.css',
  'src/css/base.css',
  'src/css/screens.css',
  'src/css/stage.css',
  'src/css/magnifier.css',
  'src/css/word-blocks.css',
  'src/css/morph.css',
  'src/css/card-deck.css',
  'src/js/config.js',
  'src/js/state.js',
  'src/js/utils.js',
  'src/js/hangul.js',
  'src/js/tts.js',
  'src/js/audio.js',
  'src/js/pointer.js',
  'src/js/viewport.js',
  'src/js/magnifier.js',
  'src/js/word-block.js',
  'src/js/morph.js',
  'src/js/card-deck.js',
  'src/js/stage.js',
  'src/js/game.js',
  'src/js/progress.js',
  'src/js/mission.js',
  'src/js/collection.js',
  'src/js/main.js',
  'src/data/hanja.js',
  'src/data/vocab.js',
  'src/data/stages.js',
  'src/assets/stages/parking-lot.svg',
  'src/assets/stages/school-cafeteria.svg',
  'src/assets/stages/fire-station.svg',
  'src/assets/stages/water-spring.svg',
  'src/assets/hanja/車.json',
  'src/assets/hanja/水.json',
  'src/assets/hanja/火.json',
  'src/assets/hanja/木.json',
  'src/assets/hanja/山.json',
  'src/assets/hanja/日.json',
  'src/assets/hanja/月.json',
  'src/assets/hanja/人.json',
];

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    return new Response('Offline - resource not cached', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached || new Response('Offline', { status: 503 }));

  return cached || fetchPromise;
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then(cache => {
      return cache.addAll(APP_SHELL_URLS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(names => {
      return Promise.all(
        names
          .filter(name => name !== CACHE_VERSION)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const isLocal = url.origin === self.location.origin;
  const isFont = url.hostname.includes('googleapis.com') || url.hostname.includes('gstatic.com');
  const isAppShell = isLocal && (
    url.pathname === '/' ||
    url.pathname.endsWith('.html') ||
    url.pathname.includes('/src/css/') ||
    url.pathname.includes('/src/js/') ||
    url.pathname.includes('/src/data/') ||
    url.pathname.includes('/src/assets/') ||
    url.pathname.endsWith('manifest.webmanifest')
  );

  if (isAppShell) {
    e.respondWith(cacheFirst(e.request, CACHE_VERSION));
  } else if (isFont) {
    e.respondWith(staleWhileRevalidate(e.request, CACHE_VERSION));
  } else {
    e.respondWith(networkFirst(e.request, CACHE_VERSION));
  }
});
