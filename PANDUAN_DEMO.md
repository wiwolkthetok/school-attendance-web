# PANDUAN PRAKTIS SETTING JADWAL DEMO PRESENSI RFID
SMK Ma'arif 1 Padang Ratu

Dokumen ini berisi rumus cepat mengatur jadwal di menu Pengaturan Web (`/pengaturan`) agar Anda bisa mendemokan berbagai status kehadiran (Hadir, Terlambat, Pulang, dan Bolos) di hadapan guru atau penguji pada jam berapa pun.

---

## 📌 RUMUS UTAMA (Berdasarkan Jam Demo "T")

Misalkan jam tangan / jam HP Anda saat demo menunjukkan pukul **T** (contoh: 09:00 WIB).

### 1. SKENARIO HADIR TEPAT WAKTU (Hijau)
> Kunci: Jam demo (T) harus berada SEBELUM Bel Masuk.

* **Buka Gerbang**: T dikurangi 30 menit (T - 30 mnt)
* **Bel Masuk**: T ditambah 15 menit (T + 15 mnt)  --> *Belum telat*
* **Batas Toleransi (Tutup Pagi)**: T ditambah 45 menit (T + 45 mnt)
* **Buka Sesi Pulang**: T ditambah 2 jam (T + 2 jam)  --> *Wajib di atas jam demo*
* **Tutup Sesi Pulang**: 23:59

**Contoh Riil (Demo Jam 09:00 Pagi):**
- Buka Gerbang: 08:30
- Bel Masuk: 09:15
- Batas Toleransi: 09:45
- Buka Sesi Pulang: 11:00
- Tutup Sesi Pulang: 23:59
👉 *Hasil Scan jam 09:00:* **HADIR TEPAT WAKTU (Hijau)**

---

### 2. SKENARIO TERLAMBAT & POTONG POIN (Kuning)
> Kunci: Jam demo (T) harus berada SETELAH Bel Masuk, tapi SEBELUM Batas Toleransi.

* **Buka Gerbang**: T dikurangi 30 menit (T - 30 mnt)
* **Bel Masuk**: T dikurangi 10 menit (T - 10 mnt)  --> *Telat 10 menit!*
* **Batas Toleransi (Tutup Pagi)**: T ditambah 30 menit (T + 30 mnt)
* **Buka Sesi Pulang**: T ditambah 2 jam (T + 2 jam)
* **Tutup Sesi Pulang**: 23:59

**Contoh Riil (Demo Jam 09:00 Pagi):**
- Buka Gerbang: 08:30
- Bel Masuk: 08:50 (sudah lewat 10 menit)
- Batas Toleransi: 09:30
- Buka Sesi Pulang: 11:00
- Tutup Sesi Pulang: 23:59
👉 *Hasil Scan jam 09:00:* **TERLAMBAT 10 MENIT (Kuning, Poin -5)**

---

### 3. SKENARIO KEPULANGAN SISWA (Biru)
> Kunci: Jam demo (T) harus berada SETELAH Buka Sesi Pulang.

* **Buka Sesi Pulang**: T dikurangi 15 menit (T - 15 mnt)  --> *Gerbang pulang sudah buka*
* **Tutup Sesi Pulang**: T ditambah 2 jam (T + 2 jam) atau 23:59

**Contoh Riil (Demo Jam 09:00 Pagi):**
- Buka Sesi Pulang: 08:45
- Tutup Sesi Pulang: 23:59
👉 *Hasil Scan jam 09:00:* **PULANG (Biru)**

---

### 4. SKENARIO BOLOS & POTONG 20 POIN (Merah)
> Kunci: Siswa sudah hadir/telat di pagi hari, tetapi TIDAK absen pulang saat gerbang pulang sudah ditutup.

* **Syarat**: Siswa sudah ada riwayat tap masuk pagi (Hadir/Telat).
* **Cara Eksekusi**:
  1. Ubah **Tutup Sesi Pulang** menjadi SEBELUM jam demo (misal: jam demo 09:00, set Tutup Pulang = 08:50).
  2. Buka dashboard atau halaman Siswa-Guru, sistem otomatis mendeteksi siswa yang masuk pagi tapi belum pulang $\rightarrow$ status otomatis berubah jadi **BOLOS (-20 Poin)**.
  3. Atau klik tombol evaluasi bolos di sistem.

---

## ⚡ JADWAL RESMI SEKOLAH (STANDAR AWAL)
Jika demo telah selesai, klik tombol **"Reset ke Default"** di menu Pengaturan untuk mengembalikan jam operasional resmi SMK Ma'arif:

- Buka Gerbang: **06:15 WIB**
- Bel Masuk: **07:30 WIB**
- Batas Toleransi: **07:40 WIB**
- Buka Sesi Pulang: **13:30 WIB**
- Tutup Sesi Pulang: **15:00 WIB**
