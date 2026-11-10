import { n as turso, t as initDatabase } from "./tursoClient_L2U3qzVi.mjs";
import { t as attendanceEmitter } from "./attendanceEvents_eOwLBYLa.mjs";
import fs from "node:fs";
import path from "node:path";
// src/utils/settingsStorage.ts
var settingsPath = path.resolve("src/data/settings.json");
var DEFAULT_SETTINGS = {
	jamBuka: "06:15",
	jamMasuk: "07:30",
	jamToleransi: "07:40",
	jamPulang: "13:30",
	jamTutupPulang: "15:00",
	spWali: "3 Hari Terlambat Berturut-turut",
	spBk: "Akumulasi 3 Hari Alpa",
	waTemplate: "Yth. Bapak/Ibu Wali Murid dari {nama_siswa} ({kelas}).\nAnanda telah hadir di SMK pada pukul {jam_masuk} WIB dengan status: [{status}]."
};
function readRawSettingsJson() {
	try {
		if (fs.existsSync(settingsPath)) return JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
	} catch {}
	return { ...DEFAULT_SETTINGS };
}
function getSchedulerState() {
	return readRawSettingsJson().scheduler || {
		lastBolosDate: null,
		lastArchivedDate: null,
		nextRunType: "bolos",
		nextRunTime: "17:00:00 WIB",
		lastStatusMessage: "Menunggu jadwal operasional"
	};
}
function saveSchedulerState(state) {
	const raw = readRawSettingsJson();
	const updatedScheduler = {
		...raw.scheduler || {
			lastBolosDate: null,
			lastArchivedDate: null,
			nextRunType: "bolos",
			nextRunTime: "17:00:00 WIB",
			lastStatusMessage: "Menunggu jadwal operasional"
		},
		...state
	};
	raw.scheduler = updatedScheduler;
	try {
		fs.writeFileSync(settingsPath, JSON.stringify(raw, null, 2), "utf-8");
	} catch (err) {
		console.error("Gagal simpan scheduler state ke JSON:", err);
	}
	return updatedScheduler;
}
var cachedSettings = null;
var cachedSettingsTime = 0;
var SETTINGS_CACHE_TTL = 6e4;
function invalidateSettingsCache() {
	cachedSettings = null;
	cachedSettingsTime = 0;
}
async function getSettings(forceRefresh = false) {
	if (!forceRefresh && cachedSettings && Date.now() - cachedSettingsTime < SETTINGS_CACHE_TTL) return cachedSettings;
	await initDatabase();
	try {
		const res = await turso.execute("SELECT * FROM settings;");
		if (!res.rows.length) {
			cachedSettings = DEFAULT_SETTINGS;
			cachedSettingsTime = Date.now();
			return DEFAULT_SETTINGS;
		}
		const map = {};
		for (const r of res.rows) map[String(r.key)] = String(r.value);
		const result = {
			...DEFAULT_SETTINGS,
			...map
		};
		cachedSettings = result;
		cachedSettingsTime = Date.now();
		return result;
	} catch (err) {
		console.error("Turso getSettings error, fallback ke local JSON:", err);
		try {
			const raw = fs.readFileSync(settingsPath, "utf-8");
			const result = {
				...DEFAULT_SETTINGS,
				...JSON.parse(raw)
			};
			cachedSettings = result;
			cachedSettingsTime = Date.now();
			return result;
		} catch {
			return DEFAULT_SETTINGS;
		}
	}
}
async function saveSettings(newSettings) {
	await initDatabase();
	const updated = {
		...await getSettings(),
		...newSettings
	};
	try {
		for (const [k, v] of Object.entries(updated)) await turso.execute({
			sql: `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);`,
			args: [k, String(v)]
		});
		const raw = readRawSettingsJson();
		for (const [k, v] of Object.entries(updated)) raw[k] = v;
		fs.writeFileSync(settingsPath, JSON.stringify(raw, null, 2), "utf-8");
	} catch (err) {
		console.error("Turso saveSettings error:", err);
	}
	invalidateSettingsCache();
	attendanceEmitter.emit("settings_updated", updated);
	return updated;
}
async function resetSettings() {
	await initDatabase();
	try {
		for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) await turso.execute({
			sql: `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);`,
			args: [k, String(v)]
		});
		const raw = readRawSettingsJson();
		for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) raw[k] = v;
		fs.writeFileSync(settingsPath, JSON.stringify(raw, null, 2), "utf-8");
	} catch (err) {
		console.error("Turso resetSettings error:", err);
	}
	attendanceEmitter.emit("settings_updated", DEFAULT_SETTINGS);
	return DEFAULT_SETTINGS;
}
function timeToMinutes(timeStr) {
	if (!timeStr) return 0;
	const [h, m] = timeStr.split(":").map(Number);
	return (h || 0) * 60 + (m || 0);
}
export { saveSettings as a, saveSchedulerState as i, getSettings as n, timeToMinutes as o, resetSettings as r, getSchedulerState as t };
