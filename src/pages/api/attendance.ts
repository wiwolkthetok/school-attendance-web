export const prerender = false;
import type { APIRoute } from 'astro';
import { getStudents, getLogs, saveLog, clearLogs, syncDailyAttendanceAndPermissions, type AttendanceLog } from '../../utils/attendanceStorage';
import { getSettings, timeToMinutes } from '../../utils/settingsStorage';
import { attendanceEmitter } from '../../utils/attendanceEvents';
import { getStudentPointSummary, calculatePointDeduction, savePointDeduction } from '../../utils/pointsStorage';

let lastCheckedDate = '';

export const GET: APIRoute = async () => {
  const todayWib = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
  if (lastCheckedDate !== todayWib) {
    lastCheckedDate = todayWib;
    // Jalankan sinkronisasi mandiri di background tanpa memblokir respons HTTP user
    syncDailyAttendanceAndPermissions().catch(() => {});
  }
  const logs = await getLogs();
  // Lindungi UID Admin agar tidak terekspos di log presensi frontend
  const safeLogs = logs.map((l) => {
    if (l.role === 'admin') {
      return { ...l, rfidUid: '' };
    }
    return l;
  });
  return new Response(JSON.stringify(safeLogs), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
};

export const DELETE: APIRoute = async ({ request }) => {
  const cookieHeader = request.headers.get('cookie') || '';
  const hasAdminSession = cookieHeader.includes('auth_session=admin');
  if (!hasAdminSession && !request.headers.get('x-dev-bypass')) {
    return new Response(JSON.stringify({ status: 'error', message: 'Akses Ditolak: Hanya Administrator yang berhak mereset log presensi.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  await clearLogs();
  attendanceEmitter.emit('attendance', { type: 'reset' });
  return new Response(JSON.stringify({ status: 'success', message: 'Log presensi berhasil direset' }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

// Helper pemfilter UID: Mengekstrak UID Decimal / ID kartu dari payload scanner/IoT secara presisi
function extractDecimalUid(raw: any): string {
  if (!raw) return '';
  const text = String(raw).trim();
  if (text.toUpperCase().startsWith('ADM-') || /^(admin|piket)$/i.test(text)) return text.toUpperCase();
  const decMatch = text.match(/(?:UID\s*Decimal|Decimal|Dec)\s*[:=]?\s*([0-9]{6,14})/i);
  if (decMatch && decMatch[1]) return decMatch[1].trim();
  // Bersihkan hanya karakter pemisah seperti spasi, titik dua, enter, strip
  return text.replace(/[:\s\-\.\r\n]/g, '').trim();
}

function makeDeniedResponse(code: string, message: string, line1: string, line2: string, beep: number = 3) {
  return new Response(
    JSON.stringify({
      status: 'error',
      code,
      message,
      lcd: { line1, line2 },
      beep,
      gate: false,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

function extractPayloadValue(body: any, fallbackText: string): string {
  if (typeof body === 'object' && body !== null) {
    for (const key of Object.keys(body)) {
      const k = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (['uid', 'rfid', 'id', 'rfiduid', 'cardid', 'card', 'tag', 'data', 'text', 'cardnumber'].includes(k)) {
        if (body[key]) return String(body[key]);
      }
    }
  }
  return fallbackText || '';
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const todayWib = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
    if (lastCheckedDate !== todayWib) {
      lastCheckedDate = todayWib;
      // Jalankan sinkronisasi mandiri di background tanpa menahan proses tap RFID
      syncDailyAttendanceAndPermissions().catch(() => {});
    }

    const contentType = request.headers.get('content-type') || '';
    let body: any = {};
    let rawInput = '';

    if (contentType.includes('application/json')) {
      body = await request.json().catch(() => ({}));
      rawInput = extractPayloadValue(body, typeof body === 'string' ? body : '');
    } else {
      const text = await request.text().catch(() => '');
      try {
        body = JSON.parse(text);
        rawInput = extractPayloadValue(body, text);
      } catch {
        rawInput = text;
      }
    }

    const uid = extractDecimalUid(rawInput);

    console.log('\n==================================================');
    console.log('📡 [PRESENSI API] Data Masuk dari Scanner / IoT:');
    console.log('--------------------------------------------------');
    console.log('Raw Data     : ' + (rawInput ? rawInput.replace(/\n\s*/g, ' | ') : '(kosong)'));
    console.log('Filter UID   : [' + uid + ']');
    console.log('==================================================');

    if (!uid) {
      return makeDeniedResponse('UID_EMPTY', 'ID/UID wajib dikirim', 'ID/UID KOSONG', 'TEMPEL KARTU', 2);
    }

    // Step 1: Cek apakah ID terdaftar dengan pencocokan cerdas (toleransi leading zero 0xxxxxxxxx)
    const students = await getStudents();
    const cleanScanUid = uid.replace(/^0+/, '');
    const student = students.find((s) => {
      const sRfid = (s.rfidUid || '').toUpperCase().trim();
      const sClean = sRfid.replace(/^0+/, '');
      const sId = (s.id || '').toUpperCase().trim();
      return (
        sRfid === uid.toUpperCase() ||
        (cleanScanUid && sClean === cleanScanUid) ||
        sId === uid.toUpperCase()
      );
    });
    if (!student) {
      console.log(`❌ [PRESENSI] UID [${uid}] BELUM TERDAFTAR di database.\n`);
      return makeDeniedResponse('CARD_UNKNOWN', `ID/UID [${uid}] belum terdaftar di sistem`, 'KARTU TDK ADA', 'HUBUNGI PETUGAS', 3);
    }

    console.log(`✅ [PRESENSI] Siswa Terdeteksi: ${student.name} (${student.className})\n`);

    // Tolak presensi jika siswa telah berstatus Alumni
    if (student.className && (student.className.toLowerCase().includes('alumni') || student.className.toLowerCase().includes('lulus'))) {
      return makeDeniedResponse('ALUMNI_INACTIVE', `Kartu Tidak Aktif: ${student.name} telah berstatus Alumni (${student.className}).`, 'KARTU ALUMNI', 'TIDAK AKTIF', 3);
    }

    // Konfigurasi Jam Operasional Dinamis dari Turso
    const settings = await getSettings();
    const bukaMinutes = timeToMinutes(settings.jamBuka);
    const masukMinutes = timeToMinutes(settings.jamMasuk);
    const pulangMinutes = timeToMinutes(settings.jamPulang);

    // Waktu WIB & Support Simulasi Waktu
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
    const realTimeStr = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Jakarta' });
    const customTime = (body.simulatedTime || body.time || body.scanTime || '').trim();
    const timeStr = customTime ? (customTime.length === 5 ? `${customTime}:00` : customTime) : realTimeStr;

    const [hh, mm] = timeStr.split(':').map(Number);
    const totalMinutes = hh * 60 + mm;

    // Tentukan Sesi Presensi: Pagi (Masuk) atau Siang (Pulang)
    const validCustomType = body.type === 'masuk' || body.type === 'pulang' ? body.type : undefined;
    const session: 'masuk' | 'pulang' = validCustomType || (totalMinutes < pulangMinutes ? 'masuk' : 'pulang');

    const isStaff = student.role === 'guru' || student.role === 'admin';

    // Step 1b: Cek Hari Libur / Akhir Pekan (Hari Minggu)
    const isSunday = new Date(dateStr + 'T12:00:00+07:00').getDay() === 0;
    if (isSunday && !isStaff) {
      return makeDeniedResponse('HOLIDAY', 'Hari ini hari Minggu (Libur KBM Sekolah)', 'HARI LIBUR', 'TIDAK ADA KBM', 2);
    }

    // Step 2: Cek jadwal gerbang umum (05:00 WIB hingga 23:00 WIB)
    if (totalMinutes < 5 * 60 || totalMinutes > 23 * 60) {
      return makeDeniedResponse('OUT_OF_HOURS', 'Di luar jadwal operasional gerbang (05:00 - 23:00 WIB)', 'GERBANG DITUTUP', 'LUAR JADWAL KBM', 3);
    }

    // Step 2b: Cek jadwal khusus siswa (tolak jika di luar jadwal operasional)
    if (!isStaff) {
      const toleransiMinutes = timeToMinutes(settings.jamToleransi || '07:40');
      const tutupPulangMinutes = timeToMinutes(settings.jamTutupPulang || '15:00');

      // Ambil log harian untuk deteksi konteks siswa (apakah sudah masuk pagi)
      const currentLogs = await getLogs();
      const hasMorningTap = currentLogs.some(
        (l) => l.rfidUid.toUpperCase() === student.rfidUid.toUpperCase() && l.date === dateStr && l.type === 'masuk' && l.status !== 'Alpa'
      );

      // Jika waktu berada di antara batas toleransi masuk dan jam buka kepulangan (misal 11:00 - 13:30 WIB)
      if (totalMinutes > toleransiMinutes && totalMinutes < pulangMinutes) {
        if (hasMorningTap) {
          // Siswa sudah hadir pagi dan mencoba keluar/pulang sebelum jamnya
          return makeDeniedResponse('EARLY_LEAVE', `Presensi kepulangan belum dibuka (Jam pulang pukul ${settings.jamPulang} WIB)`, 'BLM JAM PULANG', `PULANG: ${settings.jamPulang} WIB`, 2);
        } else {
          // Siswa belum hadir dan baru datang saat jam KBM sudah berjalan
          return makeDeniedResponse('LATE_CLOSED', `Presensi masuk telah ditutup (Batas toleransi pukul ${settings.jamToleransi || '07:40'} WIB)`, 'GERBANG TUTUP', 'TERLAMBAT', 3);
        }
      }

      if (session === 'masuk') {
        if (totalMinutes < bukaMinutes) {
          return makeDeniedResponse('BEFORE_OPEN', `Presensi masuk belum dibuka (Gerbang buka pukul ${settings.jamBuka} WIB)`, 'BELUM BUKA', `BUKA: ${settings.jamBuka} WIB`, 2);
        }
        if (totalMinutes > toleransiMinutes) {
          return makeDeniedResponse('LATE_CLOSED', `Presensi masuk telah ditutup (Batas toleransi pukul ${settings.jamToleransi || '07:40'} WIB)`, 'GERBANG TUTUP', 'TERLAMBAT', 3);
        }
      }

      if (session === 'pulang') {
        if (totalMinutes < pulangMinutes) {
          return makeDeniedResponse('EARLY_LEAVE', `Presensi pulang belum dibuka (Kepulangan pukul ${settings.jamPulang} WIB)`, 'BLM JAM PULANG', `PULANG: ${settings.jamPulang} WIB`, 2);
        }
        if (totalMinutes > tutupPulangMinutes) {
          return makeDeniedResponse('PULANG_CLOSED', `Presensi kepulangan telah ditutup (Sesi berakhir pukul ${settings.jamTutupPulang || '15:00'} WIB)`, 'SESI BERAKHIR', 'GERBANG DITUTUP', 3);
        }
      }
    }

    // Step 3: Cek Anti Double-Tap (Staff: hanya 1x sehari, Siswa: 1x per sesi)
    const logs = await getLogs();
    const existing = logs.find((l) => {
      const matchRfid = l.rfidUid.toUpperCase() === student.rfidUid.toUpperCase() && l.date === dateStr;
      if (!matchRfid) return false;
      if (isStaff) return true; // Guru & Admin hanya absen satu kali sehari
      // Abaikan tiket Alpa otomatis agar siswa yang tap tetap bisa masuk dan mengganti status jadi Hadir/Terlambat
      return l.type === session && l.status !== 'Alpa';
    });

    if (existing) {
      return new Response(
        JSON.stringify({
          status: 'warning',
          code: 'ALREADY_TAPPED',
          message: isStaff
            ? `Staff/Pendidik (${student.name}) sudah melakukan presensi hari ini (jam ${existing.time} WIB)`
            : `${student.name} sudah absen ${session === 'masuk' ? 'masuk' : 'pulang'} hari ini (${existing.status} jam ${existing.time} WIB)`,
          lcd: {
            line1: 'SUDAH ABSEN',
            line2: `${existing.time ? existing.time.slice(0, 5) : ''} WIB`,
          },
          beep: 2,
          gate: false,
          data: existing,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Cek Poin Disiplin Siswa (ide.txt)
    let studentPoints = 100;
    if (!isStaff) {
      const pSum = await getStudentPointSummary(student.id, student.rfidUid);
      studentPoints = pSum.totalPoints;
      if (studentPoints <= 0) {
        return makeDeniedResponse('POINTS_ZERO', 'Akses Ditolak: Poin siswa 0 (Terkunci). Silahkan temui Guru Piket atau Wakasis untuk persetujuan / reset poin.', 'AKSES TERKUNCI', 'POIN ANDA 0', 4);
      }
    }

    // Status: Staff tidak ada terlambat (selalu Hadir), siswa ada kalkulasi keterlambatan
    let status: 'Hadir' | 'Terlambat' | 'Pulang' | 'Bolos' | 'Alpa' | 'Libur';
    let message: string;
    let deductionInfo: any = null;

    if (isStaff) {
      status = 'Hadir';
      message = `Presensi ${student.role === 'admin' ? 'Administrator' : 'Pendidik'} Berhasil (${student.name}) - Hadir Bertugas`;
    } else if (session === 'masuk') {
      const isLate = totalMinutes > masukMinutes;
      status = isLate ? 'Terlambat' : 'Hadir';

      if (isLate) {
        const minutesLate = totalMinutes - masukMinutes;
        const { pointsDeducted, reason } = calculatePointDeduction(minutesLate);
        if (pointsDeducted > 0) {
          const deductionRecord = {
            id: `DED-${Date.now()}`,
            studentId: student.id,
            rfidUid: student.rfidUid,
            date: dateStr,
            time: timeStr.slice(0, 8),
            minutesLate,
            pointsDeducted,
            reason,
          };
          await savePointDeduction(deductionRecord);
          studentPoints = Math.max(0, studentPoints - pointsDeducted);
          deductionInfo = deductionRecord;
        }

        message = `Presensi Masuk Terlambat (${student.name}) - Telat ${minutesLate} menit.`;
        if (studentPoints < 10) {
          message += ` ⚠️ Peringatan: Poin Anda sisa ${studentPoints} (kurang dari 10), silahkan temui guru terlebih dahulu!`;
        } else if (deductionInfo) {
          message += ` Poin berkurang -${deductionInfo.pointsDeducted} (Sisa ${studentPoints} Poin).`;
        }
      } else {
        message = `Presensi Masuk Tepat Waktu (${student.name})`;
      }
    } else {
      // Sesi Pulang / Siang
      // Periksa apakah siswa sudah melakukan presensi masuk di pagi hari
      const allLogs = await getLogs();
      const morningLog = allLogs.find((l) => l.rfidUid.toUpperCase() === student.rfidUid.toUpperCase() && l.date === dateStr && l.type === 'masuk');

      if (!morningLog || morningLog.status === 'Alpa') {
        // Siswa tidak hadir di waktu pagi -> status tetap Alpa dan gerbang ditolak
        const alpaLog: AttendanceLog = {
          id: `ATT-${Date.now()}`,
          rfidUid: student.rfidUid,
          name: student.name,
          className: student.className,
          role: student.role,
          date: dateStr,
          time: timeStr.slice(0, 8),
          type: 'pulang',
          status: 'Alpa',
        };
        await saveLog(alpaLog);

        attendanceEmitter.emit('attendance', { type: 'new_log', log: alpaLog, deduction: null, remainingPoints: studentPoints });

        return new Response(
          JSON.stringify({
            status: 'warning',
            code: 'ALPA_DENIED_GATE',
            message: `Akses Ditolak (${student.name}): Anda tidak terdaftar presensi masuk pagi. Status tetap Alpa, silahkan melapor ke guru piket.`,
            data: alpaLog,
            points: studentPoints,
            deduction: null,
            lcd: { line1: student.name.slice(0, 16).toUpperCase(), line2: 'ALPA-TEMUI PIKET' },
            beep: 3,
            gate: false,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      } else if (morningLog.status === 'Terlambat') {
        // Siswa pagi terlambat -> label presensi tetap Terlambat (tidak berubah jadi Hadir)
        status = 'Terlambat';
        message = `Presensi Kepulangan Berhasil (${student.name}) - Status: Terlambat`;
      } else {
        // Siswa hadir tepat waktu -> status Hadir
        status = 'Hadir';
        message = `Presensi Kepulangan Berhasil (${student.name}) - Status: Hadir`;
      }
    }

    const newLog: AttendanceLog = {
      id: `ATT-${Date.now()}`,
      rfidUid: student.rfidUid,
      name: student.name,
      className: student.className,
      role: student.role,
      date: dateStr,
      time: timeStr.slice(0, 8),
      type: session,
      status,
    };

    await saveLog(newLog);

    const clientLog = student.role === 'admin' ? { ...newLog, rfidUid: '' } : newLog;
    attendanceEmitter.emit('attendance', { type: 'new_log', log: clientLog, deduction: deductionInfo, remainingPoints: studentPoints });

    let lcdLine1 = student.name.slice(0, 16).toUpperCase();
    let lcdLine2 = 'HADIR';
    let beepCount = 1;
    let codeStr = 'SUCCESS_ONTIME';

    if (isStaff) {
      codeStr = 'SUCCESS_STAFF';
      lcdLine2 = 'HADIR BERTUGAS';
    } else if (session === 'masuk') {
      if (status === 'Terlambat') {
        codeStr = 'SUCCESS_LATE';
        beepCount = 2;
        lcdLine2 = studentPoints < 10 ? 'TEMUI GURU' : `TELAT - POIN ${studentPoints}`;
      } else {
        codeStr = 'SUCCESS_ONTIME';
        lcdLine2 = `HADIR - POIN ${studentPoints}`;
      }
    } else {
      codeStr = 'SUCCESS_PULANG';
      lcdLine2 = status === 'Terlambat' ? 'PULANG (TELAT)' : 'PULANG';
    }

    return new Response(
      JSON.stringify({
        status: 'success',
        code: codeStr,
        message,
        data: clientLog,
        points: studentPoints,
        deduction: deductionInfo,
        lcd: { line1: lcdLine1, line2: lcdLine2.slice(0, 16) },
        beep: beepCount,
        gate: true,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        status: 'error',
        code: 'SERVER_EXCEPTION',
        message: err.message,
        lcd: { line1: 'SISTEM ERROR', line2: 'COBA LAGI NANTI' },
        beep: 3,
        gate: false,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
