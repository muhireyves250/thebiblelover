// This service worker previously cache-first'd the app shell, which meant
// every redeploy left returning visitors stuck on a stale index.html
// pointing at deleted, content-hashed asset files (404s on every JS/CSS
// chunk). The app no longer registers a service worker at all — this file
// now exists only to clean up that old registration for anyone who still
// has it installed, then get out of the way permanently.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => client.navigate(client.url));
    })()
  );
});
