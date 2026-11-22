/* NEXO PLAN — service worker: guarda la app para que abra sin internet y se actualice sola */
const CACHE = 'nexoplan-1.7-2fca4c98';
const FILES = [
  './css/app.css',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './index.html',
  './js/agenda.js',
  './js/app.js',
  './js/asistente.js',
  './js/boot.js',
  './js/contadores.js',
  './js/desktop.js',
  './js/ejercicio.js',
  './js/firebase-config.js',
  './js/horario.js',
  './js/mapa.js',
  './js/metas-agencia.js',
  './js/metas-app.js',
  './js/metas-creador.js',
  './js/metas-habitos.js',
  './js/metas-nexo.js',
  './js/metas-video.js',
  './js/sesiones.js',
  './js/sync.js',
  './js/voces.js',
  './manifest.webmanifest',
  './vendor/leaflet/LICENSE',
  './vendor/leaflet/leaflet.css',
  './vendor/leaflet/leaflet.js'
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== self.location.origin) return; // mapas y plan.json van por internet
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((r) => r || fetch(e.request)));
});
