// Offline support: keeps a copy of the game on the device after the first online launch.
// Pages load network-first (players get updates when online), everything falls back to the cache offline.
const CACHE = 'sv-arcade-v16';
const CORE = [
  './', './index.html', './manifest.webmanifest', './privacy.html', './terms.html',
  './mahjong/', './mahjong/index.html', './mahjong/holder.js', './holder.js', './neon.js', './neon-games.css', './arcade-art/sp_bull.webp', './arcade-art/sp_bear.webp', './passport.js', './shop.js', './pay.bundle.js', './wallet.bundle.js', './battlegrounds/', './battlegrounds/index.html', './poker/', './poker/index.html', './rug/', './rug/index.html',
  './arcade-art/tile_bull.webp', './arcade-art/tile_bear.webp', './arcade-art/tile_whale.webp', './arcade-art/tile_maxi.webp', './arcade-art/tile_rugpuller.webp', './arcade-art/tile_paperhands.webp', './arcade-art/tile_crab.webp', './arcade-art/tile_degen.webp', './arcade-art/tile_diamond.webp', './arcade-art/tile_fudster.webp', './arcade-art/tile_nocoiner.webp', './arcade-art/tile_shiller.webp', './arcade-art/tile_shrimp.webp',
  './icons/icon-192.png', './icons/icon-512.png',
  './fonts/bungee-latin-400-normal.woff2',
  './fonts/commissioner-latin-400-normal.woff2',
  './fonts/commissioner-latin-600-normal.woff2',
  './fonts/commissioner-latin-800-normal.woff2'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const isPage = req.mode === 'navigate' || req.destination === 'document';
  if (isPage) {
    e.respondWith(fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  })));
});
