import { t as __exportAll } from "./rolldown-runtime_D8jQpDG7.mjs";
import { t as attendanceEmitter } from "./attendanceEvents_eOwLBYLa.mjs";
import { n as getSettings, o as timeToMinutes } from "./settingsStorage_DKBhOGrx.mjs";
import { a as savePointDeduction, r as getStudentPointSummary, t as calculatePointDeduction } from "./pointsStorage_DocJKj43.mjs";
import { a as clearLogs, c as getLogs, d as saveLog, l as getStudents, p as syncDailyAttendanceAndPermissions } from "./attendanceStorage_DJzJ-FgX.mjs";
// src/pages/api/attendance.ts
var attendance_exports = /* @__PURE__ */ __exportAll({
	DELETE: () => DELETE,
	GET: () => GET,
	POST: () => POST,
	prerender: () => false
});
var lastCheckedDate = "";
var GET = async () => {
	const todayWib = (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
	if (lastCheckedDate !== todayWib) {
		lastCheckedDate = todayWib;
		syncDailyAttendanceAndPermissions().catch(() => {});
	}
	const safeLogs = (await getLogs()).map((l) => {
		if (l.role === "admin") return {
			...l,
			rfidUid: ""
		};
		return l;
	});
	return new Response(JSON.stringify(safeLogs), { headers: { "Content-Type": "application/json" } });
};
var DELETE = async () => {
	await clearLogs();
	attendanceEmitter.emit("attendance", { type: "reset" });
	return new Response(JSON.stringify({
		status: "success",
		message: "Log presensi berhasil direset"
	}), { headers: { "Content-Type": "application/json" } });
};
function extractDecimalUid(raw) {
	if (!raw) return "";
	const text = String(raw).trim();
	if (text.toUpperCase().startsWith("ADM-") || /^(admin|piket)$/i.test(text)) return text.toUpperCase();
	const decMatch = text.match(/(?:UID\s*Decimal|Decimal|Dec)\s*[:=]?\s*([0-9]{8,12})/i);
	if (decMatch && decMatch[1]) return decMatch[1].trim();
	const digitsOnly = text.replace(/[^0-9]/g, "");
	if (digitsOnly.length >= 9) return digitsOnly.slice(0, 9);
	return digitsOnly || text;
}
var POST = async ({ request }) => {
	try {
		const todayWib = (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
		if (lastCheckedDate !== todayWib) {
			lastCheckedDate = todayWib;
			syncDailyAttendanceAndPermissions().catch(() => {});
		}
		const contentType = request.headers.get("content-type") || "";
		let body = {};
		let rawInput = "";
		if (contentType.includes("application/json")) {
			body = await request.json().catch(() => ({}));
			rawInput = body.uid || body.rfid || body.id || body.rfidUid || body.data || body.text || "";
			if (!rawInput && typeof body === "string") rawInput = body;
		} else {
			const text = await request.text().catch(() => "");
			try {
				body = JSON.parse(text);
				rawInput = body.uid || body.rfid || body.id || body.rfidUid || body.data || text;
			} catch {
				rawInput = text;
			}
		}
		const uid = extractDecimalUid(rawInput);
		console.log("\n==================================================");
		console.log("📡 [PRESENSI API] Data Masuk dari Scanner / IoT:");
		console.log("--------------------------------------------------");
		console.log("Raw Data     : " + (rawInput ? rawInput.replace(/\n\s*/g, " | ") : "(kosong)"));
		console.log("Filter UID   : [" + uid + "]");
		console.log("==================================================");
		if (!uid) return new Response(JSON.stringify({
			status: "error",
			message: "ID/UID wajib dikirim"
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		const student = (await getStudents()).find((s) => s.rfidUid.toUpperCase() === uid || s.id.toUpperCase() === uid);
		if (!student) {
			console.log(`❌ [PRESENSI] UID [${uid}] BELUM TERDAFTAR di database.\n`);
			return new Response(JSON.stringify({
				status: "error",
				message: `ID/UID ${uid} belum terdaftar di sistem`
			}), {
				status: 404,
				headers: { "Content-Type": "application/json" }
			});
		}
		console.log(`✅ [PRESENSI] Siswa Terdeteksi: ${student.name} (${student.className})\n`);
		if (student.className && (student.className.toLowerCase().includes("alumni") || student.className.toLowerCase().includes("lulus"))) return new Response(JSON.stringify({
			status: "error",
			message: `Kartu Tidak Aktif: ${student.name} telah berstatus Alumni (${student.className}).`
		}), {
			status: 403,
			headers: { "Content-Type": "application/json" }
		});
		const settings = await getSettings();
		const bukaMinutes = timeToMinutes(settings.jamBuka);
		const masukMinutes = timeToMinutes(settings.jamMasuk);
		const pulangMinutes = timeToMinutes(settings.jamPulang);
		const now = /* @__PURE__ */ new Date();
		const dateStr = now.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
		const realTimeStr = now.toLocaleTimeString("en-GB", { timeZone: "Asia/Jakarta" });
		const customTime = (body.simulatedTime || body.time || body.scanTime || "").trim();
		const timeStr = customTime ? customTime.length === 5 ? `${customTime}:00` : customTime : realTimeStr;
		const [hh, mm] = timeStr.split(":").map(Number);
		const totalMinutes = hh * 60 + mm;
		const session = (body.type === "masuk" || body.type === "pulang" ? body.type : void 0) || (totalMinutes < Math.min(pulangMinutes, 720) ? "masuk" : "pulang");
		const isStaff = student.role === "guru" || student.role === "admin";
		if (totalMinutes < 300 || totalMinutes > 1380) return new Response(JSON.stringify({
			status: "error",
			message: `Di luar jadwal operasional gerbang (05:00 - 23:00 WIB)`
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		if (!isStaff) {
			const toleransiMinutes = timeToMinutes(settings.jamToleransi || "07:40");
			const tutupPulangMinutes = timeToMinutes(settings.jamTutupPulang || "15:00");
			if (session === "masuk") {
				if (totalMinutes < bukaMinutes) return new Response(JSON.stringify({
					status: "error",
					message: `Presensi masuk belum dibuka (Gerbang buka pukul ${settings.jamBuka} WIB)`
				}), {
					status: 400,
					headers: { "Content-Type": "application/json" }
				});
				if (totalMinutes > toleransiMinutes) return new Response(JSON.stringify({
					status: "error",
					message: `Presensi masuk telah ditutup (Batas toleransi pukul ${settings.jamToleransi || "07:40"} WIB)`
				}), {
					status: 400,
					headers: { "Content-Type": "application/json" }
				});
			}
			if (session === "pulang") {
				if (totalMinutes < pulangMinutes) return new Response(JSON.stringify({
					status: "error",
					message: `Presensi pulang belum dibuka (Kepulangan pukul ${settings.jamPulang} WIB)`
				}), {
					status: 400,
					headers: { "Content-Type": "application/json" }
				});
				if (totalMinutes > tutupPulangMinutes) return new Response(JSON.stringify({
					status: "error",
					message: `Presensi kepulangan telah ditutup (Sesi berakhir pukul ${settings.jamTutupPulang || "15:00"} WIB)`
				}), {
					status: 400,
					headers: { "Content-Type": "application/json" }
				});
			}
		}
		const existing = (await getLogs()).find((l) => {
			if (!(l.rfidUid.toUpperCase() === student.rfidUid.toUpperCase() && l.date === dateStr)) return false;
			if (isStaff) return true;
			return l.type === session;
		});
		if (existing) return new Response(JSON.stringify({
			status: "warning",
			message: isStaff ? `Staff/Pendidik (${student.name}) sudah melakukan presensi hari ini (jam ${existing.time} WIB)` : `${student.name} sudah absen ${session === "masuk" ? "masuk" : "pulang"} hari ini (${existing.status} jam ${existing.time} WIB)`,
			data: existing
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
		let studentPoints = 100;
		if (!isStaff) {
			studentPoints = (await getStudentPointSummary(student.id, student.rfidUid)).totalPoints;
			if (studentPoints <= 0) return new Response(JSON.stringify({
				status: "error",
				message: `Akses Ditolak: Poin siswa 0 (Terkunci). Silahkan temui Guru Piket atau Wakasis untuk persetujuan / reset poin.`
			}), {
				status: 403,
				headers: { "Content-Type": "application/json" }
			});
		}
		let status;
		let message;
		let deductionInfo = null;
		if (isStaff) {
			status = "Hadir";
			message = `Presensi ${student.role === "admin" ? "Administrator" : "Pendidik"} Berhasil (${student.name}) - Hadir Bertugas`;
		} else if (session === "masuk") {
			const isLate = totalMinutes > masukMinutes;
			status = isLate ? "Terlambat" : "Hadir";
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
						reason
					};
					await savePointDeduction(deductionRecord);
					studentPoints = Math.max(0, studentPoints - pointsDeducted);
					deductionInfo = deductionRecord;
				}
				message = `Presensi Masuk Terlambat (${student.name}) - Telat ${minutesLate} menit.`;
				if (studentPoints < 10) message += ` ⚠️ Peringatan: Poin Anda sisa ${studentPoints} (kurang dari 10), silahkan temui guru terlebih dahulu!`;
				else if (deductionInfo) message += ` Poin berkurang -${deductionInfo.pointsDeducted} (Sisa ${studentPoints} Poin).`;
			} else message = `Presensi Masuk Tepat Waktu (${student.name})`;
		} else {
			const morningLog = (await getLogs()).find((l) => l.rfidUid.toUpperCase() === student.rfidUid.toUpperCase() && l.date === dateStr && l.type === "masuk");
			if (!morningLog || morningLog.status === "Alpa") {
				status = "Alpa";
				message = `Tap Siang Terdeteksi (${student.name}), status tetap Alpa karena tidak presensi masuk pagi.`;
			} else if (morningLog.status === "Terlambat") {
				status = "Terlambat";
				message = `Presensi Kepulangan Berhasil (${student.name}) - Status: Terlambat`;
			} else {
				status = "Hadir";
				message = `Presensi Kepulangan Berhasil (${student.name}) - Status: Hadir`;
			}
		}
		const newLog = {
			id: `ATT-${Date.now()}`,
			rfidUid: student.rfidUid,
			name: student.name,
			className: student.className,
			role: student.role,
			date: dateStr,
			time: timeStr.slice(0, 8),
			type: session,
			status
		};
		await saveLog(newLog);
		const clientLog = student.role === "admin" ? {
			...newLog,
			rfidUid: ""
		} : newLog;
		attendanceEmitter.emit("attendance", {
			type: "new_log",
			log: clientLog,
			deduction: deductionInfo,
			remainingPoints: studentPoints
		});
		return new Response(JSON.stringify({
			status: "success",
			message,
			data: clientLog,
			points: studentPoints,
			deduction: deductionInfo
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({
			status: "error",
			message: err.message
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
// \0virtual:astro:page:src/pages/api/attendance@_@ts
var page = () => attendance_exports;
export { page };
