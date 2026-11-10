import { turso, initDatabase } from './tursoClient';
import { getSchedulerState, saveSchedulerState } from './settingsStorage';
import fs from 'node:fs';
import path from 'node:path';

const studentsPath = path.resolve('src/data/students.json');
const logsPath = path.resolve('src/data/attendanceLogs.json');

export interface Student {
  id: string;
  rfidUid: string;
  name: string;
  className: string;
  role: 'siswa' | 'guru' | 'admin';
  category?: string;
  identifier?: string;
  address?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  tag?: string;
}

export interface AttendanceLog {
  id: string;
  rfidUid: string;
  name: string;
  className: string;
  role: 'siswa' | 'guru' | 'admin';
  date: string;
  time: string;
  type: 'masuk' | 'pulang';
  status: 'Hadir' | 'Terlambat' | 'Pulang' | 'Bolos' | 'Alpa' | 'Libur' | 'Izin' | 'Dispensasi' | 'Sakit';
}

const historyPath = path.resolve('src/data/attendanceHistory.json');

import { savePointDeduction } from './pointsStorage';
import { attendanceEmitter } from './attendanceEvents';
import { getPermissions, archiveExpiredPermissions, updatePermissionStatus } from './permissionStorage';

let cachedStudents: Student[] | null = null;
let cachedStudentsTime = 0;
const STUDENTS_CACHE_TTL = 60 * 1000;

let cachedLogs: AttendanceLog[] | null = null;
let cachedLogsTime = 0;
const LOGS_CACHE_TTL = 10 * 1000;

export function invalidateStudentsCache(): void {
  cachedStudents = null;
  cachedStudentsTime = 0;
}

export function invalidateLogsCache(): void {
  cachedLogs = null;
  cachedLogsTime = 0;
}

// Invalidate cache secara otomatis saat ada event presensi atau update siswa
attendanceEmitter.on('attendance', (evt: any) => {
  invalidateLogsCache();
  if (evt?.type === 'students_updated') {
    invalidateStudentsCache();
  }
});

export async function getStudents(forceRefresh = false): Promise<Student[]> {
  if (!forceRefresh && cachedStudents && Date.now() - cachedStudentsTime < STUDENTS_CACHE_TTL) {
    return cachedStudents;
  }

  await initDatabase();
  try {
    const res = await turso.execute('SELECT * FROM students ORDER BY role DESC, name ASC;');
    const result: Student[] = res.rows.map((r: any) => ({
      id: String(r.id),
      rfidUid: String(r.rfid_uid),
      name: String(r.name),
      identifier: String(r.identifier || ''),
      role: r.role as 'siswa' | 'guru' | 'admin',
      category: String(r.category || (r.role === 'admin' ? 'admin' : (r.role === 'guru' ? 'guru' : 'rpl'))),
      className: String(r.class_name),
      address: String(r.address || 'Padang Ratu, Lampung'),
      email: String(r.email || (r.name ? `${r.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@smkmaarif.sch.id` : '')),
      phone: String(r.phone || (r.role === 'admin' ? '+62 812-3456-7890' : (r.role === 'guru' ? '+62 813-6901-4432' : '+62 821-7788-9900'))),
      birthDate: String(r.birth_date || (r.role === 'admin' ? '10 Januari 1980' : (r.role === 'guru' ? '15 Maret 1984' : '12 Mei 2007'))),
      gender: String(r.gender || 'L'),
      tag: String(r.tag || ''),
    }));
    cachedStudents = result;
    cachedStudentsTime = Date.now();
    return result;
  } catch (err) {
    console.error('Turso getStudents error, fallback ke local JSON:', err);
    try {
      if (fs.existsSync(studentsPath)) {
        const raw = JSON.parse(fs.readFileSync(studentsPath, 'utf-8'));
        cachedStudents = raw;
        cachedStudentsTime = Date.now();
        return raw;
      }
      return [];
    } catch {
      return [];
    }
  }
}

export async function saveStudent(studentData: Partial<Student>): Promise<Student> {
  await initDatabase();
  const prefix = studentData.role === 'admin' ? 'ADM' : (studentData.role === 'guru' ? 'GUR' : 'STD');
  const id = studentData.id || `${prefix}-${Date.now().toString().slice(-4)}`;
  const rfidUid = (studentData.rfidUid || '').toUpperCase().trim();
  const name = studentData.name || 'Nama Civitas';
  const identifier = studentData.identifier || '0000000000';
  const role = (studentData.role || 'siswa') as 'siswa' | 'guru' | 'admin';
  const category = studentData.category || (role === 'admin' ? 'admin' : (role === 'guru' ? 'guru' : 'rpl'));
  const className = studentData.className || (role === 'admin' ? 'Administrator Sekolah' : (role === 'guru' ? 'Dewan Guru' : 'X RPL'));
  const address = studentData.address || 'Padang Ratu, Lampung';
  const email = studentData.email || '';
  const phone = studentData.phone || '';
  const birthDate = studentData.birthDate || '';
  const gender = studentData.gender || 'L';
  const tag = studentData.tag || '';

  await turso.execute({
    sql: `
      INSERT INTO students (id, rfid_uid, name, identifier, role, category, class_name, address, email, phone, birth_date, gender, tag)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        rfid_uid = excluded.rfid_uid,
        name = excluded.name,
        identifier = excluded.identifier,
        role = excluded.role,
        category = excluded.category,
        class_name = excluded.class_name,
        address = excluded.address,
        email = excluded.email,
        phone = excluded.phone,
        birth_date = excluded.birth_date,
        gender = excluded.gender,
        tag = excluded.tag;
    `,
    args: [id, rfidUid, name, identifier, role, category, className, address, email, phone, birthDate, gender, tag],
  });

  invalidateStudentsCache();

  const studentObj: Student = {
    id,
    rfidUid,
    name,
    identifier,
    role,
    category,
    className,
    address,
    email,
    phone,
    birthDate,
    gender,
    tag,
  };

  return studentObj;
}

export async function deleteStudent(id: string): Promise<boolean> {
  await initDatabase();
  try {
    const res = await turso.execute({
      sql: 'DELETE FROM students WHERE id = ?;',
      args: [id],
    });
    invalidateStudentsCache();
    return res.rowsAffected > 0;
  } catch (err) {
    console.error('Turso deleteStudent error:', err);
    return false;
  }
}

export async function getLogs(forceRefresh = false): Promise<AttendanceLog[]> {
  if (!forceRefresh && cachedLogs && Date.now() - cachedLogsTime < LOGS_CACHE_TTL) {
    return cachedLogs;
  }

  await initDatabase();
  try {
    const res = await turso.execute('SELECT * FROM attendance_logs ORDER BY date DESC, time DESC;');
    const result: AttendanceLog[] = res.rows.map((r: any) => ({
      id: String(r.id),
      rfidUid: String(r.rfid_uid),
      name: String(r.name),
      className: String(r.class_name),
      role: r.role as 'siswa' | 'guru',
      date: String(r.date),
      time: String(r.time),
      type: r.type as 'masuk' | 'pulang',
      status: r.status as 'Hadir' | 'Terlambat' | 'Pulang' | 'Bolos',
    }));
    cachedLogs = result;
    cachedLogsTime = Date.now();
    return result;
  } catch (err) {
    console.error('Turso getLogs error, fallback ke local JSON:', err);
    try {
      if (fs.existsSync(logsPath)) {
        const raw = JSON.parse(fs.readFileSync(logsPath, 'utf-8'));
        cachedLogs = raw;
        cachedLogsTime = Date.now();
        return raw;
      }
      return [];
    } catch {
      return [];
    }
  }
}

export async function saveLog(log: AttendanceLog): Promise<void> {
  await initDatabase();
  try {
    await turso.execute({
      sql: `INSERT OR REPLACE INTO attendance_logs (id, rfid_uid, name, class_name, role, date, time, type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      args: [log.id, log.rfidUid, log.name, log.className, log.role, log.date, log.time, log.type, log.status],
    });
    invalidateLogsCache();
  } catch (err) {
    console.error('Turso saveLog error:', err);
  }
}

export async function clearLogs(): Promise<void> {
  await initDatabase();
  try {
    await turso.execute('DELETE FROM attendance_logs;');
    invalidateLogsCache();
  } catch (err) {
    console.error('Turso clearLogs error:', err);
  }
}

/**
 * Evaluasi Otomatis Alpa Saat Jadwal Masuk Ditutup / Masuk Jadwal Siang (13:30 WIB):
 * 1. Mengecek seluruh siswa aktif (role: 'siswa', non-alumni).
 * 2. Mengecek siapa yang sudah absen masuk pagi dan siapa yang memiliki surat izin disetujui.
 * 3. Siswa yang TIDAK ada absen masuk pagi dan TIDAK ada surat izin langsung dicatat sebagai 'Alpa' di attendance_logs.
 */
export async function checkAndApplyAlpa(targetDate?: string): Promise<{
  date: string;
  evaluatedCount: number;
  alpaCount: number;
  alpaStudents: Array<{
    id: string;
    studentId: string;
    rfidUid: string;
    name: string;
    className: string;
  }>;
}> {
  await initDatabase();
  const dateStr = targetDate || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
  const isSunday = new Date(dateStr + 'T12:00:00+07:00').getDay() === 0;
  if (isSunday) {
    return { date: dateStr, evaluatedCount: 0, alpaCount: 0, alpaStudents: [] };
  }

  const students = await getStudents();
  const allLogs = await getLogs();
  const dateLogs = allLogs.filter((l) => l.date === dateStr);

  const morningUids = new Set<string>();
  const alreadyAlpaUids = new Set<string>();
  dateLogs.forEach((l) => {
    if (l.role === 'siswa') {
      const u = l.rfidUid.toUpperCase();
      if (l.type === 'masuk') {
        if (l.status === 'Alpa') alreadyAlpaUids.add(u);
        else morningUids.add(u);
      }
    }
  });

  const permissions = await getPermissions(true);
  const approvedPermStudentIds = new Set<string>();
  permissions.forEach((p) => {
    if (p.status === 'Disetujui' && dateStr >= p.startDate && dateStr <= (p.endDate || p.startDate)) {
      if (p.studentId) approvedPermStudentIds.add(p.studentId.toUpperCase());
      const sMatch = students.find((s) => s.id === p.studentId || (p.name && s.name.toLowerCase() === p.name.toLowerCase()));
      if (sMatch) {
        approvedPermStudentIds.add(sMatch.rfidUid.toUpperCase());
        approvedPermStudentIds.add(sMatch.id.toUpperCase());
      }
    }
  });

  const alpaStudents: Array<{
    id: string;
    studentId: string;
    rfidUid: string;
    name: string;
    className: string;
  }> = [];

  for (const student of students) {
    if (student.role !== 'siswa') continue;
    if (student.className && (student.className.toLowerCase().includes('alumni') || student.className.toLowerCase().includes('lulus'))) continue;

    const u = (student.rfidUid || '').toUpperCase();
    const sId = (student.id || '').toUpperCase();

    if (morningUids.has(u) || approvedPermStudentIds.has(sId) || approvedPermStudentIds.has(u) || alreadyAlpaUids.has(u)) {
      continue;
    }

    const alpaLog: AttendanceLog = {
      id: `ATT-ALPA-${student.id}-${dateStr}`,
      rfidUid: student.rfidUid,
      name: student.name,
      className: student.className,
      role: 'siswa',
      date: dateStr,
      time: '07:40:00',
      type: 'masuk',
      status: 'Alpa',
    };

    await saveLog(alpaLog);
    alpaStudents.push({
      id: alpaLog.id,
      studentId: student.id,
      rfidUid: student.rfidUid,
      name: student.name,
      className: student.className,
    });
  }

  if (alpaStudents.length > 0) {
    attendanceEmitter.emit('attendance', {
      type: 'alpa_applied',
      date: dateStr,
      count: alpaStudents.length,
    });
  }

  return {
    date: dateStr,
    evaluatedCount: students.length,
    alpaCount: alpaStudents.length,
    alpaStudents,
  };
}

/**
 * Deteksi Siswa Bolos (ide.txt):
 * Siswa yang absen pagi (masuk) tetapi tidak absen siang (pulang)
 * dikategorikan 'Bolos' dan dipotong 10 poin secara otomatis.
 */
export async function checkAndApplyBolos(targetDate?: string, targetStudentId?: string): Promise<{
  date: string;
  evaluatedCount: number;
  bolosCount: number;
  penalizedStudents: Array<{
    id: string;
    studentId: string;
    rfidUid: string;
    name: string;
    className: string;
    pointsDeducted: number;
  }>;
}> {
  await initDatabase();
  const dateStr = targetDate || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
  const timeStr = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Jakarta' });

  const allLogs = await getLogs();
  const dateLogs = allLogs.filter((l) => l.date === dateStr);
  const students = await getStudents();

  // Pengaman Hari Libur: Pada hari Minggu, evaluasi massal bolos ditiadakan
  const isSunday = new Date(dateStr + 'T12:00:00+07:00').getDay() === 0;
  if (isSunday && !targetStudentId) {
    return {
      date: dateStr,
      evaluatedCount: 0,
      bolosCount: 0,
      penalizedStudents: [],
    };
  }

  // Jika targetStudentId spesifik diberikan (Tindak lanjut siswa bolos tertangkap basah)
  if (targetStudentId) {
    const target = students.find(
      (s) => s.id === targetStudentId || s.rfidUid.toUpperCase() === targetStudentId.toUpperCase()
    );
    if (target && target.role === 'siswa') {
      const bolosLog: AttendanceLog = {
        id: `ATT-BOLOS-${Date.now()}-${target.id}`,
        rfidUid: target.rfidUid,
        name: target.name,
        className: target.className,
        role: 'siswa',
        date: dateStr,
        time: timeStr.slice(0, 8),
        type: 'pulang',
        status: 'Bolos',
      };
      await saveLog(bolosLog);

      const deductionRecord = {
        id: `DED-BOLOS-${Date.now()}-${target.id}`,
        studentId: target.id,
        rfidUid: target.rfidUid,
        date: dateStr,
        time: timeStr.slice(0, 8),
        minutesLate: 0,
        pointsDeducted: 10,
        reason: 'Bolos: Tertangkap basah meninggalkan lingkungan sekolah / jam pelajaran tanpa izin',
      };
      await savePointDeduction(deductionRecord);

      attendanceEmitter.emit('attendance', {
        type: 'bolos_penalized',
        log: bolosLog,
        deduction: deductionRecord,
      });

      return {
        date: dateStr,
        evaluatedCount: 1,
        bolosCount: 1,
        penalizedStudents: [
          {
            id: bolosLog.id,
            studentId: target.id,
            rfidUid: target.rfidUid,
            name: target.name,
            className: target.className,
            pointsDeducted: 10,
          },
        ],
      };
    }
  }

  // Kelompokkan siswa berdasarkan sesi hari ini
  const studentMap = new Map<string, Student>();
  students.forEach((s) => {
    if (s.role === 'siswa') {
      studentMap.set(s.rfidUid.toUpperCase(), s);
      studentMap.set(s.id.toUpperCase(), s);
    }
  });

  const morningUids = new Set<string>();
  const afternoonUids = new Set<string>();
  const alreadyBolosUids = new Set<string>();

  dateLogs.forEach((l) => {
    if (l.role === 'siswa') {
      const u = l.rfidUid.toUpperCase();
      if (l.type === 'masuk') morningUids.add(u);
      if (l.type === 'pulang') {
        afternoonUids.add(u);
        if (l.status === 'Bolos') alreadyBolosUids.add(u);
      }
    }
  });

  const permissions = await getPermissions(true);
  const approvedPermUids = new Set<string>();
  permissions.forEach((p) => {
    if (p.status === 'Disetujui' && dateStr >= p.startDate && dateStr <= (p.endDate || p.startDate)) {
      if (p.studentId) approvedPermUids.add(p.studentId.toUpperCase());
      const sMatch = students.find((s) => s.id === p.studentId || (p.name && s.name.toLowerCase() === p.name.toLowerCase()));
      if (sMatch) {
        approvedPermUids.add(sMatch.rfidUid.toUpperCase());
        approvedPermUids.add(sMatch.id.toUpperCase());
      }
    }
  });

  const penalizedStudents: Array<{
    id: string;
    studentId: string;
    rfidUid: string;
    name: string;
    className: string;
    pointsDeducted: number;
  }> = [];

  for (const uid of morningUids) {
    if (approvedPermUids.has(uid)) continue;
    // Siswa hadir pagi tapi TIDAK ada log pulang dan belum dicatat bolos hari ini
    if (!afternoonUids.has(uid) && !alreadyBolosUids.has(uid)) {
      const student = studentMap.get(uid);
      if (student) {
        // 1. Simpan log presensi kepulangan dengan status 'Bolos'
        const bolosLog: AttendanceLog = {
          id: `ATT-BOLOS-${Date.now()}-${student.id}`,
          rfidUid: student.rfidUid,
          name: student.name,
          className: student.className,
          role: 'siswa',
          date: dateStr,
          time: timeStr.slice(0, 8),
          type: 'pulang',
          status: 'Bolos',
        };
        await saveLog(bolosLog);

        // 2. Potong 10 Poin otomatis sesuai aturan ide.txt
        const deductionRecord = {
          id: `DED-BOLOS-${Date.now()}-${student.id}`,
          studentId: student.id,
          rfidUid: student.rfidUid,
          date: dateStr,
          time: timeStr.slice(0, 8),
          minutesLate: 0,
          pointsDeducted: 10,
          reason: 'Bolos: Tercatat presensi masuk pagi tetapi tidak melakukan presensi kepulangan (pulang)',
        };
        await savePointDeduction(deductionRecord);

        // 3. Emit event realtime
        attendanceEmitter.emit('attendance', {
          type: 'bolos_penalized',
          log: bolosLog,
          deduction: deductionRecord,
        });

        penalizedStudents.push({
          id: bolosLog.id,
          studentId: student.id,
          rfidUid: student.rfidUid,
          name: student.name,
          className: student.className,
          pointsDeducted: 10,
        });
      }
    }
  }

  return {
    date: dateStr,
    evaluatedCount: morningUids.size,
    bolosCount: penalizedStudents.length,
    penalizedStudents,
  };
}

/**
 * Arsip Otomatis Jam 23:00 WIB & Reset Harian (ide.txt):
 * 1. Mengeksekusi penalti bolos (-10 poin) bagi yang belum absen pulang.
 * 2. Memindahkan log hari berjalan ke tabel arsip historis permanen (attendance_history).
 * 3. Mengosongkan attendance_logs aktif sehingga status esok hari kembali 'Belum Absen'.
 */
export async function archiveAndResetDailyLogs(targetDate?: string): Promise<{
  status: string;
  message: string;
  archivedDate: string;
  archivedCount: number;
  bolosCount: number;
  permissionsCount: number;
}> {
  await initDatabase();
  const dateStr = targetDate || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

  // Step 1: Eksekusi evaluasi bolos terlebih dahulu
  const bolosResult = await checkAndApplyBolos(dateStr);

    // Step 2: Ambil seluruh log presensi hari ini
  const allLogs = await getLogs();
  const logsToArchive = allLogs.filter((l) => l.date === dateStr);

  if (logsToArchive.length > 0) {
    // Step 3: Salin log tap kartu ke tabel arsip permanen (attendance_history)
    for (const log of logsToArchive) {
      try {
        await turso.execute({
          sql: `
            INSERT OR REPLACE INTO attendance_history (id, rfid_uid, name, class_name, role, date, time, type, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
          `,
          args: [log.id, log.rfidUid, log.name, log.className, log.role, log.date, log.time, log.type, log.status],
        });
      } catch (err) {
        console.error('Gagal arsip log ke attendance_history:', err);
      }
    }

    // Step 4: Bersihkan log hari ini dari attendance_logs aktif
    try {
      await turso.execute({
        sql: 'DELETE FROM attendance_logs WHERE date = ?;',
        args: [dateStr],
      });
    } catch (err) {
      console.error('Gagal hapus attendance_logs setelah arsip:', err);
    }
  }

  // Step 5: ARSIP PERIZINAN HARI INI KE REKAP PRESENSI & PERBARUI SIKLUS HIDUP IZIN
  let permArchivedCount = 0;
  try {
    const allPerms = await getPermissions();
    const allStudents = await getStudents();
    const activePermsForDate = allPerms.filter(
      (p) => p.status === 'Disetujui' && dateStr >= p.startDate && dateStr <= (p.endDate || p.startDate)
    );

    for (const perm of activePermsForDate) {
      const std = allStudents.find((s) => s.id === perm.studentId || (s.name && perm.name && s.name.toLowerCase() === perm.name.toLowerCase()));
      const permLogId = `ATT-IZIN-${perm.id}-${dateStr}`;

      try {
        await turso.execute({
          sql: `
            INSERT OR REPLACE INTO attendance_history (id, rfid_uid, name, class_name, role, date, time, type, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
          `,
          args: [
            permLogId,
            std?.rfidUid || perm.studentId,
            perm.name,
            perm.className,
            std?.role || 'siswa',
            dateStr,
            '07:00:00',
            'masuk',
            'Izin',
          ],
        });
        permArchivedCount++;
      } catch (err) {
        console.error('Gagal arsip catatan izin ke attendance_history:', err);
      }

      // Jika tanggal izin berakhir pada dateStr atau sebelumnya, tandai izin 'Selesai'
      if ((perm.endDate || perm.startDate) <= dateStr) {
        await updatePermissionStatus(perm.id, 'Selesai');
      }
    }
  } catch (err) {
    console.error('Gagal memproses arsip izin harian:', err);
  }

  // Step 6: ARSIP REKAMAN ALPA SISWA (Bagi siswa yang tidak presensi pagi dan tidak berizin pada hari sekolah)
  const isSundayDate = new Date(dateStr + 'T12:00:00+07:00').getDay() === 0;
  let alpaArchivedCount = 0;
  if (!isSundayDate) {
    try {
      const allStudents = await getStudents();
      const allPerms = await getPermissions();
      const activePermStudentIds = new Set(
        allPerms
          .filter((p) => p.status === 'Disetujui' && dateStr >= p.startDate && dateStr <= (p.endDate || p.startDate))
          .map((p) => p.studentId)
      );

      const morningTapUids = new Set(
        logsToArchive.filter((l) => l.role === 'siswa' && l.type === 'masuk').map((l) => l.rfidUid.toUpperCase())
      );

      for (const student of allStudents) {
        if (student.role !== 'siswa') continue;
        if (student.className && (student.className.toLowerCase().includes('alumni') || student.className.toLowerCase().includes('lulus'))) continue;
        const u = (student.rfidUid || '').toUpperCase();
        const hasTappedMorning = morningTapUids.has(u);
        const hasApprovedPermit = activePermStudentIds.has(student.id);

        if (!hasTappedMorning && !hasApprovedPermit) {
          const alpaLogId = `ATT-ALPA-${student.id}-${dateStr}`;
          try {
            await turso.execute({
              sql: `
                INSERT OR REPLACE INTO attendance_history (id, rfid_uid, name, class_name, role, date, time, type, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
              `,
              args: [
                alpaLogId,
                student.rfidUid,
                student.name,
                student.className,
                'siswa',
                dateStr,
                '07:15:00',
                'masuk',
                'Alpa',
              ],
            });
            alpaArchivedCount++;
          } catch (err) {
            console.error('Gagal arsip catatan alpa ke attendance_history:', err);
          }
        }
      }
    } catch (err) {
      console.error('Gagal memproses arsip alpa harian:', err);
    }
  }

  // Broadcast event reset/arsip
  attendanceEmitter.emit('attendance', { type: 'daily_archived', date: dateStr, count: logsToArchive.length, permissionsCount: permArchivedCount, alpaCount: alpaArchivedCount });

  return {
    status: 'success',
    message: `Presensi tanggal ${dateStr} berhasil diarsip ke tabel permanen (${logsToArchive.length} log presensi, ${permArchivedCount} izin, ${alpaArchivedCount} alpa).`,
    archivedDate: dateStr,
    archivedCount: logsToArchive.length,
    bolosCount: bolosResult.bolosCount,
    permissionsCount: permArchivedCount,
  };
}

declare global {
  var __dailyResetTimer: any;
  var __lastArchivedDate: string | undefined;
}

/**
 * FUNGSI UTAMA PEMINDAIAN MANDIRI (SELF-HEALING SCANNER & AUTO-CATCHUP):
 * 1. Langsung memindai saat server dibuat / diaktifkan (Startup Scan).
 * 2. Mengarsip seluruh log tanggal lampau (date < todayStr) yang tertinggal saat server mati.
 * 3. Mengarsip perizinan yang masa berlakunya sudah habis (endDate < todayStr) ke status 'Selesai'.
 * 4. Mencatat rekaman presensi 'Izin' resmi di attendance_history untuk setiap izin lampau.
 * 5. Menjalankan reset jam 23:00 jika waktu sudah mencapai/melewati 23:00 WIB.
 */
export async function syncDailyAttendanceAndPermissions(forcedDate?: string): Promise<{
  status: string;
  today: string;
  staleDatesProcessed: string[];
  permissionsArchivedCount: number;
  message: string;
}> {
  await initDatabase();
  const now = new Date();
  const todayWib = forcedDate || now.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
  const hour = parseInt(new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', hour12: false }).format(now), 10);

  const staleDatesProcessed: string[] = [];

  // A. Deteksi log tanggal lampau (date < todayWib) di attendance_logs
  const allLogs = await getLogs();
  const staleDates = Array.from(new Set(allLogs.filter((l) => l.date < todayWib).map((l) => l.date))).sort();

  for (const sDate of staleDates) {
    console.log(`[SELF-HEALING SCAN] Mengarsip log presensi tanggal lampau (${sDate})...`);
    await archiveAndResetDailyLogs(sDate);
    staleDatesProcessed.push(sDate);
  }

  // B. Deteksi dan arsip izin yang masa berlakunya sudah lampau (endDate < todayWib)
  const permArchiveResult = await archiveExpiredPermissions(todayWib);
  const allStudents = await getStudents();
  const permBatchStatements: any[] = [];

  for (const expPerm of permArchiveResult.expiredPerms) {
    const std = allStudents.find((s) => s.id === expPerm.studentId || (s.name && expPerm.name && s.name.toLowerCase() === expPerm.name.toLowerCase()));
    const dStart = new Date(expPerm.startDate);
    const dEnd = new Date(expPerm.endDate || expPerm.startDate);

    for (let d = new Date(dStart); d <= dEnd; d.setDate(d.getDate() + 1)) {
      const curDateStr = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
      if (curDateStr < todayWib) {
        const permLogId = `ATT-IZIN-${expPerm.id}-${curDateStr}`;
        permBatchStatements.push({
          sql: `INSERT OR REPLACE INTO attendance_history (id, rfid_uid, name, class_name, role, date, time, type, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          args: [
            permLogId,
            std?.rfidUid || expPerm.studentId,
            expPerm.name,
            expPerm.className,
            std?.role || 'siswa',
            curDateStr,
            '07:00:00',
            'masuk',
            'Izin',
          ],
        });
      }
    }
  }

  if (permBatchStatements.length > 0) {
    try {
      await turso.batch(permBatchStatements, 'write');
    } catch (e) {
      console.error('[SYNC PERMISSIONS BATCH ERROR]:', e);
    }
  }

  // C. Evaluasi Alpa jika waktu sudah >= 13:30 WIB dan belum dieksekusi hari ini
  const minute = parseInt(new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', minute: '2-digit' }).format(now), 10);
  const curMinutes = hour * 60 + minute;
  const schedulerState = getSchedulerState();

  if (curMinutes >= 13 * 60 + 30 && schedulerState.lastAlpaDate !== todayWib) {
    console.log(`[SELF-HEALING 13:30 WIB] Menjalankan penetapan Alpa otomatis untuk ${todayWib}...`);
    const alpaRes = await checkAndApplyAlpa(todayWib);
    saveSchedulerState({
      lastAlpaDate: todayWib,
      lastStatusMessage: `Sukses Evaluasi Alpa: ${alpaRes.alpaCount} siswa dicatat Alpa.`,
    });
  }

  // D. Evaluasi Bolos jika waktu sudah >= 15:00 WIB dan belum dieksekusi hari ini
  if (curMinutes >= 15 * 60 && schedulerState.lastBolosDate !== todayWib) {
    console.log(`[SELF-HEALING 15:00 WIB] Menjalankan evaluasi Bolos kepulangan untuk ${todayWib}...`);
    const bolosRes = await checkAndApplyBolos(todayWib);
    saveSchedulerState({
      lastBolosDate: todayWib,
      lastStatusMessage: `Sukses Evaluasi Bolos: ${bolosRes.bolosCount} siswa bolos dipotong 10 poin.`,
    });
  }

  // E. Eksekusi reset 23:00 jika waktu sudah >= 23:00 WIB dan belum dieksekusi hari ini
  if (hour >= 23 && globalThis.__lastArchivedDate !== todayWib) {
    globalThis.__lastArchivedDate = todayWib;
    console.log(`[AUTO-RESET 23:00 WIB] Menjalankan arsip otomatis & reset harian untuk tanggal ${todayWib}...`);
    await archiveAndResetDailyLogs(todayWib);
    staleDatesProcessed.push(todayWib);
  }

  return {
    status: 'success',
    today: todayWib,
    staleDatesProcessed,
    permissionsArchivedCount: permArchiveResult.archivedCount,
    message: `Pemindaian instan selesai: ${staleDatesProcessed.length} tanggal lampau direset, ${permArchiveResult.archivedCount} izin kedaluwarsa diarsipkan.`,
  };
}

/**
 * Kompatibilitas Scheduler: Manajemen timer terpadu sekarang ditangani oleh cronWorker.ts
 */
export function startDailyAutoResetScheduler() {
  // Timer sekarang ditangani secara efisien oleh cronWorker mandiri berbasis target time
}

/**
 * Mengambil Riwayat Presensi Historis untuk Filter Laporan (Hari Ini / Minggu Lalu / Bulan Lalu / Tahun Lalu)
 */
export async function getAttendanceHistory(options?: {
  filter?: 'today' | 'week' | 'month' | 'year' | 'all';
  studentId?: string;
  rfidUid?: string;
}): Promise<AttendanceLog[]> {
  await initDatabase();
  const filter = options?.filter || 'all';
  const now = new Date();
  const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

  // Tentukan batas tanggal
  let minDate = '';
  if (filter === 'today') {
    minDate = todayStr;
  } else if (filter === 'week') {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    minDate = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
  } else if (filter === 'month') {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    minDate = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
  } else if (filter === 'year') {
    const d = new Date(now);
    d.setDate(d.getDate() - 365);
    minDate = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
  }

  try {
    let sql = `
      SELECT id, rfid_uid, name, class_name, role, date, time, type, status FROM (
        SELECT id, rfid_uid, name, class_name, role, date, time, type, status FROM attendance_logs
        UNION ALL
        SELECT id, rfid_uid, name, class_name, role, date, time, type, status FROM attendance_history
      )
    `;
    const conditions: string[] = [];
    const args: any[] = [];

    if (minDate) {
      conditions.push('date >= ?');
      args.push(minDate);
    }
    if (options?.rfidUid) {
      conditions.push('UPPER(rfid_uid) = UPPER(?)');
      args.push(options.rfidUid);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY date DESC, time DESC;';

    const res = await turso.execute({ sql, args });
    return res.rows.map((r: any) => ({
      id: String(r.id),
      rfidUid: String(r.rfid_uid),
      name: String(r.name),
      className: String(r.class_name),
      role: r.role as 'siswa' | 'guru',
      date: String(r.date),
      time: String(r.time),
      type: r.type as 'masuk' | 'pulang',
      status: r.status as 'Hadir' | 'Terlambat' | 'Pulang' | 'Bolos',
    }));
  } catch (err) {
    console.error('Turso getAttendanceHistory error, fallback lokal:', err);
    try {
      const activeLogs = await getLogs();
      let archivedLogs: AttendanceLog[] = [];
      if (fs.existsSync(historyPath)) {
        archivedLogs = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
      }
      const combined = [...activeLogs, ...archivedLogs];
      return combined.filter((l) => {
        if (minDate && l.date < minDate) return false;
        if (options?.rfidUid && l.rfidUid.toUpperCase() !== options.rfidUid.toUpperCase()) return false;
        return true;
      });
    } catch {
      return [];
    }
  }
}

export async function clearAttendanceHistory(): Promise<void> {
  await initDatabase();
  try {
    await turso.execute('DELETE FROM attendance_history;');
  } catch (err) {
    console.error('Turso clearAttendanceHistory error:', err);
  }
}

