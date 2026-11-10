/**
 * @file public/sw.js
 * @description PWA Service Worker untuk Smart Absen SMK Ma'arif Padang Ratu
 * Menjamin 100% kompatibilitas PWA tanpa memblokir koneksi jaringan / Vite dev server.
 */

const CACHE_NAME = 'smart-absen-v2';

// 1. Install Event: Langsung lewati masa tunggu agar update aktif seketika
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// 2. Activate Event: Hapus cache lama & klaim kontrol klien seketika
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Memenuhi kriteria instalasi PWA tanpa mencegat atau memperlambat request jaringan
self.addEventListener('fetch', (event) => {
  // Biarkan browser menangani seluruh lalu lintas secara native dan cepat
  return;
});

// 4. Push Notification Event: Menangkap notifikasi masuk saat aplikasi atau browser ditutup
self.addEventListener('push', (event) => {
  let data = {
    title: 'Smart Absen SMK Ma\'arif',
    body: 'Pemberitahuan presensi baru tercatat.',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    url: '/'
  };

  if (event.data) {
    try {
      data = Object.assign(data, event.data.json());
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192.png',
    badge: data.badge || '/icons/icon-192.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
    tag: 'smart-absen-notification',
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 5. Notification Click: Buka atau fokuskan aplikasi saat banner notifikasi diklik pengguna
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
