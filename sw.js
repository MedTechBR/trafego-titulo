/* TráfegoTítulo — service worker.
   REGRA DE DEPLOY: bumpar CACHE a CADA deploy (tt-v2, tt-v3...) — sem isso o usuário
   fica preso na versão velha e qualquer correção vira fantasma. */
const CACHE = 'tt-v2';
const NUCLEO = [
  './', 'index.html',
  'banco.js', 'taxonomia.js', 'flash.js', 'pratica.js',
  'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    // cache:'reload' força buscar da origem — sem isso o precache pode herdar
    // versão velha do cache HTTP/borda e congelar o app (aconteceu no RadioTítulo)
    .then(c => c.addAll(NUCLEO.map(u => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  const ehHTML = req.mode === 'navigate' || req.destination === 'document' ||
                 url.pathname.endsWith('.html') || url.pathname.endsWith('/');
  if (ehHTML) {
    // network-first: HTML sempre tenta a rede; cache é só o paraquedas offline
    e.respondWith(
      fetch(req).then(r => {
        const cp = r.clone();
        caches.open(CACHE).then(c => c.put(req, cp));
        return r;
      }).catch(() => caches.match(req).then(r => r || caches.match('index.html')))
    );
  } else {
    // cache-first: estáticos versionados pelo bump do CACHE
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req, { cache: 'no-cache' }).then(r => {
        // no-cache: revalida na origem — o cache HTTP do navegador já nos serviu
        // estático velho num miss (rt-v5) e congelou o app
        if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
        return r;
      }))
    );
  }
});
