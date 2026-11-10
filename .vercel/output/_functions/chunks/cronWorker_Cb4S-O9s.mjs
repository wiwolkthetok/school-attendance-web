import { t as attendanceEmitter } from "./attendanceEvents_eOwLBYLa.mjs";
import { i as saveSchedulerState, t as getSchedulerState } from "./settingsStorage_DKBhOGrx.mjs";
import { n as checkAndApplyAlpa, p as syncDailyAttendanceAndPermissions, r as checkAndApplyBolos, t as archiveAndResetDailyLogs } from "./attendanceStorage_DJzJ-FgX.mjs";
// src/utils/cronWorker.ts
/**
* @file src/utils/cronWorker.ts
* @description Background Scheduler Presisi Mandiri (Target-Timer & Event-Driven)
* Tanpa Polling berulang: Menghitung selisih waktu menuju 17:00 WIB (Deteksi Bolos)
* dan 23:00 WIB (Arsip Harian), lalu pasang 1 timer tunggal yang tidur hingga jam target.
* Menerima sinyal 'settings_updated' jika jadwal diubah sewaktu-waktu.
*/
var activeTimer = null;
var isInitialized = false;
function getWibNow() {
	const now = /* @__PURE__ */ new Date();
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Jakarta",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false
	}).formatToParts(now);
	const get = (type) => parts.find((p) => p.type === type)?.value || "00";
	return {
		now,
		dateStr: `${get("year")}-${get("month")}-${get("day")}`,
		hour: parseInt(get("hour"), 10),
		minute: parseInt(get("minute"), 10),
		second: parseInt(get("second"), 10),
		timeStr: `${get("hour")}:${get("minute")}:${get("second")}`
	};
}
function getMsUntilWibTarget(targetDateStr, targetHour, targetMinute = 0, targetSecond = 0) {
	const pad = (n) => String(n).padStart(2, "0");
	const targetIso = `${targetDateStr}T${pad(targetHour)}:${pad(targetMinute)}:${pad(targetSecond)}+07:00`;
	const targetTimestamp = new Date(targetIso).getTime();
	return Math.max(1e3, targetTimestamp - Date.now());
}
function scheduleNextTarget() {
	if (activeTimer) {
		clearTimeout(activeTimer);
		activeTimer = null;
	}
	const { dateStr, hour, minute, timeStr } = getWibNow();
	const curMinutes = hour * 60 + minute;
	const state = getSchedulerState();
	let nextType = "alpa";
	let targetDate = dateStr;
	let targetHour = 13;
	let targetMinute = 30;
	let targetLabel = `${dateStr} 13:30:00 WIB (Penetapan Siswa Alpa)`;
	if (state.lastAlpaDate !== dateStr && curMinutes < 810) {
		nextType = "alpa";
		targetDate = dateStr;
		targetHour = 13;
		targetMinute = 30;
		targetLabel = `${dateStr} 13:30:00 WIB (Penetapan Siswa Alpa)`;
	} else if (state.lastBolosDate !== dateStr && curMinutes < 900) {
		nextType = "bolos";
		targetDate = dateStr;
		targetHour = 15;
		targetMinute = 0;
		targetLabel = `${dateStr} 15:00:00 WIB (Deteksi Siswa Bolos Kepulangan)`;
	} else if (state.lastArchivedDate !== dateStr && curMinutes < 1380) {
		nextType = "archive";
		targetDate = dateStr;
		targetHour = 23;
		targetMinute = 0;
		targetLabel = `${dateStr} 23:00:00 WIB (Arsip & Reset Harian)`;
	} else {
		const tomorrowDateStr = new Date(Date.now() + 864e5).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
		nextType = "alpa";
		targetDate = tomorrowDateStr;
		targetHour = 13;
		targetMinute = 30;
		targetLabel = `${tomorrowDateStr} 13:30:00 WIB (Penetapan Siswa Alpa)`;
	}
	const delayMs = getMsUntilWibTarget(targetDate, targetHour, targetMinute, 0);
	const hoursLeft = (delayMs / 36e5).toFixed(2);
	saveSchedulerState({
		nextRunType: nextType,
		nextRunTime: targetLabel,
		lastStatusMessage: `Timer aktif: Menunggu jadwal berikutnya dalam ~${hoursLeft} jam (${targetLabel})`
	});
	console.log(`[SCHEDULER MANDIRI] ⏱️ Timer disetel: Target ${targetLabel} (tidur selama ~${hoursLeft} jam, 0 kueri).`);
	activeTimer = setTimeout(async () => {
		try {
			const curWib = getWibNow();
			console.log(`[SCHEDULER MANDIRI] ⏰ Waktu target tiba (${curWib.timeStr} WIB). Mengeksekusi tugas: ${nextType.toUpperCase()}...`);
			if (nextType === "alpa") {
				const alpaRes = await checkAndApplyAlpa(curWib.dateStr);
				saveSchedulerState({
					lastAlpaDate: curWib.dateStr,
					lastStatusMessage: `Sukses Evaluasi Alpa: ${alpaRes.alpaCount} siswa dicatat Alpa.`
				});
				console.log(`[SCHEDULER MANDIRI] ✅ Penetapan Alpa selesai: ${alpaRes.alpaCount} siswa dicatat Alpa.`);
			} else if (nextType === "bolos") {
				const bolosRes = await checkAndApplyBolos(curWib.dateStr);
				saveSchedulerState({
					lastBolosDate: curWib.dateStr,
					lastStatusMessage: `Sukses Evaluasi Bolos: ${bolosRes.bolosCount} siswa bolos dipotong 10 poin.`
				});
				console.log(`[SCHEDULER MANDIRI] ✅ Evaluasi bolos selesai: ${bolosRes.bolosCount} siswa ditindaklanjuti.`);
			} else {
				const archiveRes = await archiveAndResetDailyLogs(curWib.dateStr);
				saveSchedulerState({
					lastArchivedDate: curWib.dateStr,
					lastStatusMessage: `Sukses Arsip: ${archiveRes.message} (${archiveRes.archivedCount} log, ${archiveRes.bolosCount} bolos).`
				});
				console.log(`[SCHEDULER MANDIRI] ✅ Arsip harian selesai: ${archiveRes.archivedCount} log tersimpan di arsip permanen.`);
			}
		} catch (err) {
			console.error("[SCHEDULER MANDIRI] ❌ Kesalahan eksekusi timer target:", err);
			saveSchedulerState({ lastStatusMessage: `Gagal eksekusi: ${err?.message || err}` });
		} finally {
			scheduleNextTarget();
		}
	}, delayMs);
}
function initCronWorker() {
	if (typeof globalThis === "undefined" || isInitialized) return;
	isInitialized = true;
	console.log("[SCHEDULER MANDIRI] 🚀 Menginisialisasi scheduler hemat resource berbasis acuan JSON & target timer.");
	const { dateStr, hour, minute } = getWibNow();
	const curMinutes = hour * 60 + minute;
	const state = getSchedulerState();
	if (state.lastArchivedDate && state.lastArchivedDate < dateStr) {
		console.log(`[STARTUP SELF-HEALING] Menjadwalkan pemeriksaan arsip tanggal lampau (${state.lastArchivedDate}) dalam 5 detik...`);
		setTimeout(() => {
			syncDailyAttendanceAndPermissions().catch((e) => console.error("[STARTUP SELF-HEALING ERROR]:", e));
		}, 5e3);
	} else if (curMinutes >= 810 && state.lastAlpaDate !== dateStr) {
		console.log(`[STARTUP SELF-HEALING] Server aktif lewat jam 13:30. Menjalankan evaluasi Alpa hari ini...`);
		setTimeout(() => {
			syncDailyAttendanceAndPermissions().catch((e) => console.error("[STARTUP SELF-HEALING ERROR]:", e));
		}, 3e3);
	}
	scheduleNextTarget();
	attendanceEmitter.on("settings_updated", (newSettings) => {
		console.log("[SCHEDULER MANDIRI] ⚡ Sinyal perubahan jadwal diterima! Menyetel ulang timer target...");
		scheduleNextTarget();
	});
}
function getCronStatus() {
	const { dateStr, timeStr } = getWibNow();
	const state = getSchedulerState();
	return {
		initialized: isInitialized,
		timezone: "Asia/Jakarta (WIB)",
		targetSchedule: "13:30 WIB (Alpa), 15:00 WIB (Bolos), 23:00 WIB (Arsip)",
		currentWibTime: `${dateStr} ${timeStr} WIB`,
		lastRunDate: state.lastArchivedDate,
		lastRunTime: state.lastArchivedDate ? "23:00:00 WIB" : null,
		lastBolosDate: state.lastBolosDate,
		lastStatusMessage: state.lastStatusMessage || "Sistem siap",
		nextRunEstimated: state.nextRunTime || "Menghitung..."
	};
}
async function runCronNow(targetDate) {
	const dateStr = targetDate || getWibNow().dateStr;
	const result = await archiveAndResetDailyLogs(dateStr);
	saveSchedulerState({
		lastArchivedDate: dateStr,
		lastStatusMessage: `Trigger Manual Sukses: ${result.message} (${result.archivedCount} log, ${result.bolosCount} bolos)`
	});
	scheduleNextTarget();
	return result;
}
export { initCronWorker as n, runCronNow as r, getCronStatus as t };
