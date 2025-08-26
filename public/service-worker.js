// service-worker.js
// Versione manuale del Service Worker per App Cantieri

const CACHE_NAME = 'app-cantieri-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  // Aggiungi qui altri asset statici che vuoi precache (es. CSS, JS della build)
  // Nota: I file JS e CSS della build (es. /static/js/main.chunk.js)
  // saranno aggiunti automaticamente dal browser dopo la prima visita.
  // Per il precaching aggressivo, dovresti listare i nomi hashati qui,
  // ma questo richiede un processo di build più complesso.
  // Per ora, ci affidiamo alla cache del browser per i file hashati.
];

// Evento: Installazione del Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installazione. Pre-caching assets...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cache aperta, aggiungo URL.');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Forza l'attivazione del nuovo SW immediatamente
      .catch((error) => {
        console.error('[Service Worker] Errore durante il pre-caching:', error);
      })
  );
});

// Evento: Attivazione del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Attivazione. Pulizia vecchie cache...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Eliminazione vecchia cache:', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    }).then(() => self.clients.claim()) // Prende il controllo delle pagine immediatamente
  );
});

// Evento: Fetch (intercettazione delle richieste di rete)
self.addEventListener('fetch', (event) => {
  // Ignora le richieste non GET o le richieste a origini diverse (es. Firebase, backend)
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Se la risorsa è nella cache, restituiscila
        if (response) {
          console.log('[Service Worker] Servendo dalla cache:', event.request.url);
          return response;
        }

        // Altrimenti, recuperala dalla rete
        console.log('[Service Worker] Recuperando dalla rete:', event.request.url);
        return fetch(event.request)
          .then((networkResponse) => {
            // Se la richiesta è valida, aggiungila alla cache per usi futuri
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch((error) => {
            console.error('[Service Worker] Errore di fetch per:', event.request.url, error);
            // Qui potresti servire una pagina offline se la richiesta fallisce
            // return caches.match('/offline.html'); // Se hai una pagina offline
          });
      })
  );
});
