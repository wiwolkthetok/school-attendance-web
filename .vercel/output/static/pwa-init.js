/**
 * @file public/pwa-init.js
 * @description Inisialisasi PWA Client-side
 * Mendaftarkan Service Worker & menangani instalasi native di Linux, Windows, macOS, Android, & iOS.
 */

(function () {
  'use strict';

  // 1. Registrasi Service Worker & Pembaruan Otomatis
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker
        .register('/sw.js')
        .then(function (reg) {
          reg.update().catch(function () {});
        })
        .catch(function (err) {
          console.warn('Registrasi PWA Service Worker gagal:', err);
        });
    });
  }

  // 2. Tangani Prompt Instalasi Standalone (Android, Windows, Linux, macOS Chrome/Edge)
  var deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    window.dispatchEvent(new CustomEvent('pwa-installable'));

    // Tampilkan tombol instalasi jika elemen tersedia di halaman
    var installBtn = document.getElementById('btn-pwa-install');
    if (installBtn) {
      installBtn.classList.remove('hidden');
    }
    var loginPwa = document.getElementById('login-pwa-container');
    if (loginPwa) {
      loginPwa.classList.remove('hidden');
    }
    var navInstall = document.getElementById('navbar-pwa-container');
    if (navInstall) {
      navInstall.classList.remove('hidden');
    }
  });

  // Fungsi global untuk memicu dialog instalasi PWA
  window.installPwa = function () {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function (choiceResult) {
        if (choiceResult.outcome === 'accepted') {
          console.log('Pengguna menyetujui instalasi PWA');
        }
        deferredPrompt = null;
        var installBtn = document.getElementById('btn-pwa-install');
        if (installBtn) installBtn.classList.add('hidden');
        var loginPwa = document.getElementById('login-pwa-container');
        if (loginPwa) loginPwa.classList.add('hidden');
        var navInstall = document.getElementById('navbar-pwa-container');
        if (navInstall) navInstall.classList.add('hidden');
      });
    } else {
      // Deteksi iOS Safari (Instalasi manual Add to Home Screen)
      var isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIos) {
        alert('Untuk memasang di iPhone/iPad:\n1. Ketuk tombol Share (ikon kotak tanda panah ke atas di Safari).\n2. Pilih "Add to Home Screen" (Tambahkan ke Layar Utama).');
      } else {
        alert('Aplikasi sudah terpasang atau buka menu titik tiga browser lalu pilih "Install Aplikasi".');
      }
    }
  };

  // 3. Deteksi apakah aplikasi sedang berjalan dalam mode Standalone App
  var isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  window.isPwaStandalone = isStandalone;

  window.addEventListener('appinstalled', function () {
    console.log('Smart Absen PWA berhasil diinstal.');
    deferredPrompt = null;
    var installBtn = document.getElementById('btn-pwa-install');
    if (installBtn) installBtn.classList.add('hidden');
    var loginPwa = document.getElementById('login-pwa-container');
    if (loginPwa) loginPwa.classList.add('hidden');
    var navInstall = document.getElementById('navbar-pwa-container');
    if (navInstall) navInstall.classList.add('hidden');
  });
})();
