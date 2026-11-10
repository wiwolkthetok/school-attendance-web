/**
 * @file public/pwa-init.js
 * @description Inisialisasi PWA Client-side
 * Mendaftarkan Service Worker & menangani instalasi native di Android, iOS, Windows, macOS, & Linux.
 */

(function () {
  'use strict';

  var deferredPrompt = null;
  var isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  window.isPwaStandalone = isStandalone;

  // 1. Registrasi Service Worker & Pembaruan Otomatis
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker
        .register('/sw.js')
        .then(function (reg) {
          reg.update().catch(function () {});
        })
        .catch(function (err) {
          console.warn('PWA Service Worker notice:', err);
        });
    });
  }

  // 2. Fungsi untuk menampilkan tombol instalasi jika belum standalone
  function revealInstallButtons() {
    if (isStandalone) return;
    var installBtn = document.getElementById('btn-pwa-install');
    if (installBtn) installBtn.classList.remove('hidden');
    var loginPwa = document.getElementById('login-pwa-container');
    if (loginPwa) loginPwa.classList.remove('hidden');
    var navInstall = document.getElementById('navbar-pwa-container');
    if (navInstall) navInstall.classList.remove('hidden');
  }

  // Pastikan tombol muncul di non-standalone browsers
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', revealInstallButtons);
  } else {
    revealInstallButtons();
  }

  // 3. Tangani Prompt Instalasi Native (Android Chrome, Edge, Desktop Chrome)
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    window.dispatchEvent(new CustomEvent('pwa-installable'));
    revealInstallButtons();
  });

  // 4. Modal Panduan Instalasi Pintar (Android, iOS, Desktop)
  function showInstallGuideModal() {
    var existingModal = document.getElementById('pwa-guide-modal');
    if (existingModal) {
      existingModal.classList.remove('hidden');
      return;
    }

    var isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    var guideHtml = '';
    if (isIos) {
      guideHtml = `
        <div class="space-y-3 text-left">
          <div class="flex items-start gap-3 p-3 rounded-2xl bg-blue-50 border border-blue-200/60">
            <span class="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
            <p class="text-xs text-slate-700 leading-relaxed">
              Ketuk tombol <strong>Bagikan (Share)</strong> (ikon kotak dengan panah ke atas) di bilah bawah Safari.
            </p>
          </div>
          <div class="flex items-start gap-3 p-3 rounded-2xl bg-blue-50 border border-blue-200/60">
            <span class="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
            <p class="text-xs text-slate-700 leading-relaxed">
              Gulir ke bawah dan pilih <strong>"Tambahkan ke Layar Utama"</strong> (<em>Add to Home Screen</em>).
            </p>
          </div>
          <div class="flex items-start gap-3 p-3 rounded-2xl bg-blue-50 border border-blue-200/60">
            <span class="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
            <p class="text-xs text-slate-700 leading-relaxed">
              Ketuk <strong>"Tambah"</strong> di pojok kanan atas. Ikon Smart Absen akan langsung muncul di homescreen HP Anda.
            </p>
          </div>
        </div>
      `;
    } else {
      guideHtml = `
        <div class="space-y-3 text-left">
          <div class="flex items-start gap-3 p-3 rounded-2xl bg-blue-50 border border-blue-200/60">
            <span class="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
            <p class="text-xs text-slate-700 leading-relaxed">
              Ketuk ikon <strong>titik tiga (⋮)</strong> di pojok kanan atas browser (Chrome / browser HP Anda).
            </p>
          </div>
          <div class="flex items-start gap-3 p-3 rounded-2xl bg-blue-50 border border-blue-200/60">
            <span class="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
            <p class="text-xs text-slate-700 leading-relaxed">
              Pilih menu <strong>"Instal aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong> (<em>Add to Home screen</em>).
            </p>
          </div>
          <div class="flex items-start gap-3 p-3 rounded-2xl bg-blue-50 border border-blue-200/60">
            <span class="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
            <p class="text-xs text-slate-700 leading-relaxed">
              Ketuk <strong>"Instal"</strong>. Aplikasi Smart Absen akan otomatis terpasang di homescreen HP Anda.
            </p>
          </div>
        </div>
      `;
    }

    var modalWrapper = document.createElement('div');
    modalWrapper.id = 'pwa-guide-modal';
    modalWrapper.className = 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200';
    modalWrapper.innerHTML = `
      <div class="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-100 text-center space-y-4 relative">
        <div class="w-12 h-12 rounded-2xl bg-blue-600 text-white mx-auto flex items-center justify-center shadow-md shadow-blue-500/25">
          <span class="material-symbols-outlined text-2xl">install_mobile</span>
        </div>
        <div>
          <h3 class="text-base font-black text-slate-900">Pasang ke Layar Utama HP</h3>
          <p class="text-[11px] text-slate-500 mt-0.5">Ikuti langkah mudah berikut agar aplikasi muncul di homescreen:</p>
        </div>
        ${guideHtml}
        <button
          type="button"
          id="btn-close-pwa-guide"
          class="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer active:scale-95"
        >
          Saya Mengerti
        </button>
      </div>
    `;

    document.body.appendChild(modalWrapper);

    document.getElementById('btn-close-pwa-guide')?.addEventListener('click', function () {
      modalWrapper.classList.add('hidden');
    });

    modalWrapper.addEventListener('click', function (e) {
      if (e.target === modalWrapper) {
        modalWrapper.classList.add('hidden');
      }
    });
  }

  // 5. Fungsi Global Pemicu Instalasi PWA
  window.installPwa = function () {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function (choiceResult) {
        if (choiceResult.outcome === 'accepted') {
          console.log('Pengguna menyetujui instalasi PWA');
        } else {
          showInstallGuideModal();
        }
        deferredPrompt = null;
      }).catch(function () {
        showInstallGuideModal();
      });
    } else {
      showInstallGuideModal();
    }
  };

  // 6. Tangani event saat aplikasi sukses terpasang
  window.addEventListener('appinstalled', function () {
    console.log('Smart Absen PWA berhasil diinstal.');
    deferredPrompt = null;
    var modal = document.getElementById('pwa-guide-modal');
    if (modal) modal.classList.add('hidden');
    var installBtn = document.getElementById('btn-pwa-install');
    if (installBtn) installBtn.classList.add('hidden');
    var loginPwa = document.getElementById('login-pwa-container');
    if (loginPwa) loginPwa.classList.add('hidden');
    var navInstall = document.getElementById('navbar-pwa-container');
    if (navInstall) navInstall.classList.add('hidden');
  });
})();
