---
trigger: always_on
glob:
description:
---

# Standar Pengalaman Pengguna & Estetika Premium

## 1. Prinsip Utama UX/UI (uxui-principles)

- **Alur Utama Absensi:** Antarmuka pencatatan kehadiran siswa wajib diselesaikan maksimal dalam 2 kali klik dari halaman beranda.
- **Umpan Balik Instan:** Setiap aksi krusial (seperti tombol "Hadir" atau "Izin") harus menunjukkan status loading atau perubahan warna instan untuk mencegah pengguna menekan tombol dua kali.
- **Pencegahan Eror:** Sediakan konfirmasi atau validasi otomatis (misalnya: dilarang mengirim data sebelum memilih nama siswa) untuk menghindari pengiriman form kosong.

## 2. Estetika Visual Kelas Atas (high-end-visual-design)

- **Kedalaman Komponen (Nested Enclosures):** Komponen kartu informasi siswa harus terlihat memiliki dimensi fisik mirip perangkat keras nyata:
  - _Outer Shell_: Gunakan pembungkus div dengan border halus (misal: `border border-black/5` atau `dark:border-white/10`) dan sudut melengkung lebar (`rounded-[2rem]`).
  - _Inner Core_: Wadah konten utama di dalam shell harus menggunakan lengkungan yang dihitung secara matematis lebih kecil (`rounded-[calc(2rem-0.375rem)]`) agar konsentris.
- **Tipografi & Spasi:** Jangan menumpuk teks secara padat. Gandakan ruang kosong (padding makro) pada kontainer dashboard agar elemen visual aplikasi absensi ini terkesan lega dan bersih.
- **Fisika Gerakan (Hover & Interaksi):** Dilarang memakai transisi animasi bawaan yang kaku. Gunakan fungsi cubic-bezier khusus Tailwind (seperti `ease-[cubic-bezier(0.32,0.72,0,1)]`) untuk mensimulasikan bobot fisik saat tombol disentuh di layar HP.
