/* TráfegoTítulo — service worker.
   REGRA DE DEPLOY: bumpar CACHE a CADA deploy (tt-v2, tt-v3...) — sem isso o usuário
   fica preso na versão velha e qualquer correção vira fantasma. */
const CACHE = 'tt-v9';
const FONTES = 'tt-fontes-v1';
const NUCLEO = [
  './', 'index.html',
  'banco.js', 'taxonomia.js', 'flash.js', 'pratica.js', 'leituras.js',
  'leituras/_leitura.css', 'leituras/_leitura.js',
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
      .then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== FONTES).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Fontes do Google (Archivo/Inter): stale-while-revalidate em cache próprio,
  // para a identidade tipográfica sobreviver offline. Nunca some no bump do CACHE.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(FONTES).then(c =>
      c.match(req).then(hit => {
        const rede = fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => hit);
        return hit || rede;
      })));
    return;
  }

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
    // stale-while-revalidate: serve do cache na hora (rápido e offline) MAS sempre
    // revalida na rede e atualiza o cache.
    // Por que não cache-first puro: o bump do CACHE não basta. Se o install rodar
    // enquanto a borda do GitHub Pages ainda serve o arquivo velho, o precache nasce
    // ENVENENADO e o app fica preso nele até o próximo deploy — aconteceu com o
    // banco.js (273 questões precacheadas depois de publicar 504). Com SWR o
    // envenenamento se cura sozinho no carregamento seguinte.
    e.respondWith(
      caches.open(CACHE).then(c => c.match(req).then(hit => {
        const rede = fetch(req, { cache: 'no-cache' }).then(r => {
          if (r.ok) c.put(req, r.clone());
          return r;
        }).catch(() => hit);
        return hit || rede;
      }))
    );
  }
});
