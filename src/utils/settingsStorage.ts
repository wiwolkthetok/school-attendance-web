import { turso, initDatabase } from './tursoClient';
import { attendanceEmitter } from './attendanceEvents';
import fs from 'node:fs';
import path from 'node:path';

const settingsPath = path.resolve('src/data/settings.json');

export interface SchoolSettings {
  jamBuka: string;
  jamMasuk: string;
  jamToleransi: string;
  jamPulang: string;
  jamTutupPulang?: string;
  spWali: string;
  spBk: string;
  waTemplate: string;
}

export interface SchedulerState {
  lastAlpaDate?: string | null;
  lastBolosDate: string | null;
  lastArchivedDate: string | null;
  nextRunType: 'alpa' | 'bolos' | 'archive';
  nextRunTime: string;
  lastStatusMessage?: string;
}

export const DEFAULT_SETTINGS: SchoolSettings = {
  jamBuka: '06:15',
  jamMasuk: '07:30',
  jamToleransi: '07:40',
  jamPulang: '13:30',
  jamTutupPulang: '15:00',
  spWali: '3 Hari Terlambat Berturut-turut',
  spBk: 'Akumulasi 3 Hari Alpa',
  waTemplate: 'Yth. Bapak/Ibu Wali Murid dari {nama_siswa} ({kelas}).\nAnanda telah hadir di SMK pada pukul {jam_masuk} WIB dengan status: [{status}].',
};

export function readRawSettingsJson(): Record<string, any> {
  try {
    if (fs.existsSync(settingsPath)) {
      return JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    }
  } catch {}
  return { ...DEFAULT_SETTINGS };
}

export function getSchedulerState(): SchedulerState {
  const raw = readRawSettingsJson();
  return raw.scheduler || {
    lastBolosDate: null,
    lastArchivedDate: null,
    nextRunType: 'bolos',
    nextRunTime: '17:00:00 WIB',
    lastStatusMessage: 'Menunggu jadwal operasional',
  };
}

export function saveSchedulerState(state: Partial<SchedulerState>): SchedulerState {
  const raw = readRawSettingsJson();
  const current = raw.scheduler || {
    lastBolosDate: null,
    lastArchivedDate: null,
    nextRunType: 'bolos',
    nextRunTime: '17:00:00 WIB',
    lastStatusMessage: 'Menunggu jadwal operasional',
  };
  const updatedScheduler: SchedulerState = { ...current, ...state };
  raw.scheduler = updatedScheduler;
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(raw, null, 2), 'utf-8');
  } catch (err) {
    console.error('Gagal simpan scheduler state ke JSON:', err);
  }
  return updatedScheduler;
}

let cachedSettings: SchoolSettings | null = null;
let cachedSettingsTime = 0;
const SETTINGS_CACHE_TTL = 3 * 1000;

export function invalidateSettingsCache(): void {
  cachedSettings = null;
  cachedSettingsTime = 0;
}

export async function getSettings(forceRefresh = false): Promise<SchoolSettings> {
  if (!forceRefresh && cachedSettings && Date.now() - cachedSettingsTime < SETTINGS_CACHE_TTL) {
    return cachedSettings;
  }

  await initDatabase();
  try {
    const res = await turso.execute('SELECT * FROM settings;');
    if (!res.rows.length) {
      cachedSettings = DEFAULT_SETTINGS;
      cachedSettingsTime = Date.now();
      return DEFAULT_SETTINGS;
    }

    const map: Record<string, string> = {};
    for (const r of res.rows) {
      map[String(r.key)] = String(r.value);
    }
    const result: SchoolSettings = { ...DEFAULT_SETTINGS, ...map };
    cachedSettings = result;
    cachedSettingsTime = Date.now();
    return result;
  } catch (err) {
    console.error('Turso getSettings error, fallback ke local JSON:', err);
    try {
      const raw = fs.readFileSync(settingsPath, 'utf-8');
      const result: SchoolSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      cachedSettings = result;
      cachedSettingsTime = Date.now();
      return result;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }
}

export async function saveSettings(newSettings: Partial<SchoolSettings>): Promise<SchoolSettings> {
  await initDatabase();
  const current = await getSettings();
  const updated: SchoolSettings = { ...current, ...newSettings };

  try {
    for (const [k, v] of Object.entries(updated)) {
      await turso.execute({
        sql: `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);`,
        args: [k, String(v)],
      });
    }

    // Perbarui file acuan JSON: ganti nilai jadwal yang diedit tanpa menghapus state scheduler
    const raw = readRawSettingsJson();
    for (const [k, v] of Object.entries(updated)) {
      raw[k] = v;
    }
    fs.writeFileSync(settingsPath, JSON.stringify(raw, null, 2), 'utf-8');
  } catch (err) {
    console.error('Turso saveSettings error:', err);
  }

  invalidateSettingsCache();
  // Pancarkan sinyal bahwa jadwal / pengaturan telah diperbarui
  attendanceEmitter.emit('settings_updated', updated);

  return updated;
}

export async function resetSettings(): Promise<SchoolSettings> {
  await initDatabase();
  try {
    for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) {
      await turso.execute({
        sql: `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);`,
        args: [k, String(v)],
      });
    }

    const raw = readRawSettingsJson();
    for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) {
      raw[k] = v;
    }
    fs.writeFileSync(settingsPath, JSON.stringify(raw, null, 2), 'utf-8');
  } catch (err) {
    console.error('Turso resetSettings error:', err);
  }

  attendanceEmitter.emit('settings_updated', DEFAULT_SETTINGS);
  invalidateSettingsCache();
  return DEFAULT_SETTINGS;
}

export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}
