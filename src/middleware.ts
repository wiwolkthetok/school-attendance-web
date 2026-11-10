import { defineMiddleware } from 'astro:middleware';
import { initCronWorker } from './utils/cronWorker';
import { initDatabase } from './utils/tursoClient';

// Inisialisasi background cron worker & koneksi database Turso lebih awal (warmup)
initCronWorker();
initDatabase().catch(() => {});

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // 1. Jika ada yang mengakses /login langsung, redirect ke / agar URL selalu bersih
  if (pathname === '/login') {
    return context.redirect('/');
  }

  // 2. Izinkan akses bebas ke API dan aset statis / PWA
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_astro') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/icons') ||
    pathname === '/sw.js' ||
    pathname === '/offline.html' ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/pwa-init.js'
  ) {
    return next();
  }

  // 3. Cek sesi autentikasi dari cookie
  const authSession = context.cookies.get('auth_session')?.value;
  if (!authSession) {
    // Jika membuka halaman root (/), tampilkan portal login langsung tanpa ubah URL (rewrite)
    if (pathname === '/') {
      return context.rewrite('/login');
    }
    // Jika membuka halaman lain tanpa login, lempar kembali ke /
    return context.redirect('/');
  }

  // 4. Jika role siswa membuka root (/), arahkan ke profil siswa
  if (pathname === '/' && authSession === 'siswa') {
    return context.redirect('/profil-siswa');
  }

  return next();
});
