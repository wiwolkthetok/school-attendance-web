import { defineMiddleware } from 'astro:middleware';
import { initCronWorker } from './utils/cronWorker';
import { initDatabase } from './utils/tursoClient';

// Inisialisasi background cron worker & koneksi database Turso lebih awal (warmup)
initCronWorker();
initDatabase().catch(() => {});

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // 1. Izinkan akses bebas ke API, aset statis / PWA, dan route internal login
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_astro') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/.well-known') ||
    pathname === '/sw.js' ||
    pathname === '/offline.html' ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/manifest.json' ||
    pathname === '/pwa-init.js' ||
    pathname === '/login'
  ) {
    return next();
  }

  // 2. Cek sesi autentikasi dari cookie
  const authSession = context.cookies.get('auth_session')?.value;
  if (!authSession) {
    // Jika membuka halaman root (/), tampilkan portal login langsung tanpa ubah URL (rewrite)
    if (pathname === '/') {
      return context.rewrite('/login');
    }
    // Jika membuka halaman protected lain tanpa login, lempar kembali ke /
    return context.redirect('/');
  }

  // 3. Jika role siswa membuka root (/), arahkan ke profil siswa
  if (pathname === '/' && authSession === 'siswa') {
    return context.redirect('/profil-siswa');
  }

  return next();
});
