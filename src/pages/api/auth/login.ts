export const prerender = false;
import type { APIRoute } from 'astro';
import { getStudents } from '../../../utils/attendanceStorage';

// Helper pemfilter UID: Mengekstrak UID / ID kartu dari input tanpa memotong panjang digit
function extractDecimalUid(raw: any): string {
  if (!raw) return '';
  const text = String(raw).trim();
  if (/^(admin|administrator|piket)$/i.test(text)) return text.toUpperCase();
  const decMatch = text.match(/(?:UID\s*Decimal|Decimal|Dec)\s*[:=]?\s*([0-9]{6,14})/i);
  if (decMatch && decMatch[1]) return decMatch[1].trim();
  return text.trim();
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const rawName = (body.name || body.username || '').trim();
    const rawRfid = extractDecimalUid(body.rfidUid || body.rfid || body.refid || '');

    // 1. Cek Kata Kunci Admin (Bypass dev/admin)
    const isAdminKeyword = (val: string) => /^(admin|administrator|piket)$/i.test(val.trim());
    if (isAdminKeyword(rawName) || isAdminKeyword(rawRfid)) {
      const students = await getStudents();
      const adminCivitas = students.find((s) => s.role === 'admin') || {
        id: 'ADM-001',
        name: 'Administrator Sekolah',
        role: 'admin',
        className: 'Administrator Sekolah',
        category: 'admin',
      };
      return new Response(
        JSON.stringify({
          status: 'success',
          message: `Verifikasi Berhasil! Selamat datang, ${adminCivitas.name} (Administrator Sekolah).`,
          civitas: adminCivitas,
          role: 'admin',
          roleLabel: 'Administrator Sekolah (Kepsek/Waka)',
          canAccessDashboard: true,
          redirectUrl: '/',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': `auth_session=admin; Path=/; SameSite=Lax; Max-Age=86400`,
          },
        }
      );
    }

    // 2. Validasi Wajib: Kedua field (Nama Lengkap & ID RFID/NIP) wajib diisi
    console.log('\n==================================================');
    console.log('🔐 [LOGIN API] Percobaan Masuk Portal:');
    console.log('--------------------------------------------------');
    console.log('Nama Input   : ' + (rawName || '(kosong)'));
    console.log('RFID Input   : ' + (body.rfidUid || '(kosong)'));
    console.log('Filter UID   : [' + rawRfid + ']');
    console.log('==================================================');

    if (!rawName || !rawRfid) {
      console.log('❌ [LOGIN] Ditolak: Salah satu atau kedua field kosong.\n');
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Nama Lengkap dan ID Kartu RFID / NIP wajib diisi.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const students = await getStudents();

    // Helper pencocokan data: MURNI HANYA KARTU RFID (Strict RFID Only)
    const cleanStr = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    const matchRfid = (s: any, input: string) => {
      if (!input || !s.rfidUid) return false;
      const rawInput = input.trim().toUpperCase();
      const cleanInput = rawInput.replace(/^0+/, '');
      const digitsInput = rawInput.replace(/[^0-9]/g, '');

      const sRfid = s.rfidUid.trim().toUpperCase();
      const sRfidClean = sRfid.replace(/^0+/, '');
      const sRfidDigits = sRfid.replace(/[^0-9]/g, '');

      // Wajib mencocokkan nomor chip RFID (mendukung 9 digit, 10 digit, dan leading zero)
      return (
        sRfid === rawInput ||
        (cleanInput && sRfidClean === cleanInput) ||
        (digitsInput && sRfidDigits === digitsInput)
      );
    };

    const matchName = (s: any, input: string) => {
      if (!input) return false;
      const cInput = cleanStr(input);
      if (s.name) {
        const cName = cleanStr(s.name);
        if (cName === cInput) return true;
        if (cInput.length >= 3 && (cName.includes(cInput) || cInput.includes(cName))) return true;
      }
      return false;
    };

    // Cari civitas yang mencocokkan Nama dan ID Kartu RFID murni
    const found = students.find((s) => matchRfid(s, rawRfid) && matchName(s, rawName));

    if (!found) {
      console.log(`❌ [LOGIN] Gagal: Data tidak cocok atau belum terdaftar.\n`);
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Data tidak sesuai atau belum terdaftar. Pastikan Nama Lengkap dan ID Kartu RFID sudah benar.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ [LOGIN] Berhasil: ${found.name} (${found.role})\n`);

    // Filter Hak Akses Dashboard Admin: HANYA admin, kepsek, dan waka yang diizinkan!
    const isWaka = found.tag === 'waka' || (found.className && (found.className.toLowerCase().includes('waka') || found.className.toLowerCase().includes('wakil')));
    const isKepsek = !isWaka && (found.tag === 'kepsek' || (found.className && found.className.toLowerCase().includes('kepala sekolah')));
    const isAdmin = found.role === 'admin';
    const canAccessDashboard = isAdmin || isKepsek || isWaka;

    const isAlumni = (found.className && (found.className.toLowerCase().includes('alumni') || found.className.toLowerCase().includes('lulus'))) || found.category === 'alumni';
    const roleLabel = isKepsek
      ? 'Kepala Sekolah'
      : (isWaka
        ? 'Waka Kesiswaan'
        : (isAdmin
          ? 'Administrator Sekolah'
          : (found.role === 'guru' ? 'Dewan Guru' : (isAlumni ? 'Alumni Sekolah' : 'Peserta Didik (Siswa)'))));

    // Arah Pengalihan (Redirect) Berdasarkan Peran & Tag Civitas:
    // 1. Waka Kesiswaan, Kepala Sekolah, & Administrator Sekolah -> Halaman Dashboard Utama (/)
    // 2. Dewan Guru (Reguler) -> Jadwal & Agenda KBM (/jadwal)
    // 3. Siswa / Peserta Didik -> Kartu & Profil Digital Siswa (/profil-siswa)
    const redirectUrl = canAccessDashboard
      ? '/'
      : (found.role === 'guru' ? '/jadwal' : `/profil-siswa?id=${found.id}&auth=true`);

    return new Response(
      JSON.stringify({
        status: 'success',
        message: `Verifikasi Berhasil! Selamat datang, ${found.name} (${roleLabel}).`,
        civitas: found,
        role: found.role,
        roleLabel,
        canAccessDashboard,
        redirectUrl,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': `auth_session=${canAccessDashboard ? 'admin' : (found.role === 'guru' ? 'guru' : 'siswa')}; Path=/; SameSite=Lax; Max-Age=86400`,
        },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ status: 'error', message: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
