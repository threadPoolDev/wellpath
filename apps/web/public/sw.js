// Service worker — implemented in feat/desktop-notifications (PR #13)
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))
