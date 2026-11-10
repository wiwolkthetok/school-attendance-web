import { n as turso, t as initDatabase } from "./tursoClient_L2U3qzVi.mjs";
import { t as attendanceEmitter } from "./attendanceEvents_eOwLBYLa.mjs";
import { i as saveSchedulerState, t as getSchedulerState } from "./settingsStorage_DKBhOGrx.mjs";
import { a as savePointDeduction } from "./pointsStorage_DocJKj43.mjs";
import fs from "node:fs";
import path from "node:path";
// src/utils/permissionStorage.ts
var permissionsPath = path.resolve("src/data/permissions.json");
var cachedPermissions = null;
var cachedPermissionsTime = 0;
var PERMISSIONS_CACHE_TTL = 3e4;
function invalidatePermissionsCache() {
	cachedPermissions = null;
	cachedPermissionsTime = 0;
}
async function getPermissions(forceRefresh = false) {
	if (!forceRefresh && cachedPermissions && Date.now() - cachedPermissionsTime < PERMISSIONS_CACHE_TTL) return cachedPermissions;
	await initDatabase();
	try {
		const result = (await turso.execute("SELECT * FROM permissions ORDER BY start_date DESC;")).rows.map((r) => ({
			id: String(r.id),
			studentId: String(r.student_id),
			name: String(r.name),
			className: String(r.class_name),
			category: r.category,
			categoryLabel: String(r.category_label || ""),
			title: String(r.title),
			startDate: String(r.start_date),
			endDate: String(r.end_date),
			daysCount: Number(r.days_count) || 1,
			status: r.status,
			attachmentNote: String(r.attachment_note || ""),
			jurusan: String(r.jurusan || ""),
			photoProof: String(r.photo_proof || ""),
			approvedBy: String(r.approved_by || ""),
			approvedAt: String(r.approved_at || "")
		}));
		cachedPermissions = result;
		cachedPermissionsTime = Date.now();
		return result;
	} catch (err) {
		console.error("Turso getPermissions error, fallback ke local JSON:", err);
		try {
			if (fs.existsSync(permissionsPath)) {
				const raw = JSON.parse(fs.readFileSync(permissionsPath, "utf-8"));
				cachedPermissions = raw;
				cachedPermissionsTime = Date.now();
				return raw;
			}
			return [];
		} catch {
			return [];
		}
	}
}
async function savePermission(data) {
	await initDatabase();
	const id = `PRM-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
	const newPerm = {
		...data,
		id
	};
	try {
		await turso.execute({
			sql: `INSERT INTO permissions (id, student_id, name, class_name, category, category_label, title, start_date, end_date, days_count, status, attachment_note, jurusan, photo_proof) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
			args: [
				newPerm.id,
				newPerm.studentId,
				newPerm.name,
				newPerm.className,
				newPerm.category,
				newPerm.categoryLabel,
				newPerm.title,
				newPerm.startDate,
				newPerm.endDate,
				newPerm.daysCount,
				newPerm.status,
				newPerm.attachmentNote,
				newPerm.jurusan || "",
				newPerm.photoProof || ""
			]
		});
		let list = [];
		try {
			if (fs.existsSync(permissionsPath)) list = JSON.parse(fs.readFileSync(permissionsPath, "utf-8"));
		} catch {}
		const existIdx = list.findIndex((p) => p.id === id);
		if (existIdx >= 0) list[existIdx] = newPerm;
		else list.push(newPerm);
		fs.writeFileSync(permissionsPath, JSON.stringify(list, null, 2), "utf-8");
	} catch (err) {
		console.error("Turso savePermission error:", err);
	}
	invalidatePermissionsCache();
	return newPerm;
}
async function updatePermission(id, data) {
	await initDatabase();
	try {
		const existing = (await getPermissions()).find((p) => p.id === id);
		if (!existing) return null;
		const merged = { ...existing };
		for (const [k, v] of Object.entries(data)) if (v !== void 0) merged[k] = v;
		await turso.execute({
			sql: `
        UPDATE permissions SET
          category = ?,
          category_label = ?,
          title = ?,
          start_date = ?,
          end_date = ?,
          days_count = ?,
          attachment_note = ?,
          jurusan = ?,
          photo_proof = ?
        WHERE id = ?;
      `,
			args: [
				merged.category ?? "",
				merged.categoryLabel ?? "",
				merged.title ?? "",
				merged.startDate ?? "",
				merged.endDate ?? "",
				merged.daysCount ?? 1,
				merged.attachmentNote ?? "",
				merged.jurusan ?? "",
				merged.photoProof ?? "",
				id
			]
		});
		invalidatePermissionsCache();
		return merged;
	} catch (err) {
		console.error("Turso updatePermission error:", err);
		return null;
	}
}
async function deletePermission(id) {
	await initDatabase();
	try {
		const res = await turso.execute({
			sql: "DELETE FROM permissions WHERE id = ?;",
			args: [id]
		});
		invalidatePermissionsCache();
		return res.rowsAffected > 0;
	} catch (err) {
		console.error("Turso deletePermission error:", err);
		return false;
	}
}
async function updatePermissionStatus(id, status, approvedBy) {
	await initDatabase();
	const approvedAt = (/* @__PURE__ */ new Date()).toISOString();
	try {
		if (approvedBy !== void 0 && approvedBy !== "") await turso.execute({
			sql: "UPDATE permissions SET status = ?, approved_by = ?, approved_at = ? WHERE id = ?;",
			args: [
				status,
				approvedBy,
				approvedAt,
				id
			]
		});
		else await turso.execute({
			sql: "UPDATE permissions SET status = ? WHERE id = ?;",
			args: [status, id]
		});
		const res = await turso.execute({
			sql: "SELECT * FROM permissions WHERE id = ?;",
			args: [id]
		});
		invalidatePermissionsCache();
		if (!res.rows.length) return null;
		const r = res.rows[0];
		return {
			id: String(r.id),
			studentId: String(r.student_id),
			name: String(r.name),
			className: String(r.class_name),
			category: r.category,
			categoryLabel: String(r.category_label || ""),
			title: String(r.title),
			startDate: String(r.start_date),
			endDate: String(r.end_date),
			daysCount: Number(r.days_count) || 1,
			status: r.status,
			attachmentNote: String(r.attachment_note || ""),
			jurusan: String(r.jurusan || ""),
			photoProof: String(r.photo_proof || ""),
			approvedBy: String(r.approved_by || ""),
			approvedAt: String(r.approved_at || "")
		};
	} catch (err) {
		console.error("Turso updatePermissionStatus error:", err);
		return null;
	}
}
/**
* Otomatis membersihkan data foto bukti surat izin (photo_proof) yang umurnya sudah melebihi 7 hari (1 minggu).
* Menjaga ukuran database tetap ringan dan hemat memori, sementara rekaman teks status izin tetap tersimpan.
*/
async function cleanExpiredProofPhotos(days = 7) {
	await initDatabase();
	const thresholdDate = (/* @__PURE__ */ new Date((/* @__PURE__ */ new Date()).getTime() - days * 24 * 60 * 60 * 1e3)).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
	try {
		return { cleanedCount: (await turso.execute({
			sql: `UPDATE permissions SET photo_proof = '' WHERE start_date < ? AND photo_proof != '' AND photo_proof IS NOT NULL;`,
			args: [thresholdDate]
		})).rowsAffected };
	} catch (err) {
		console.error("cleanExpiredProofPhotos error:", err);
		return { cleanedCount: 0 };
	}
}
/**
* Otomatis mengarsipkan izin yang tanggal selesainya sudah lampau (endDate < todayStr).
* Status permohonan diubah menjadi 'Selesai'.
* Sekaligus membersihkan foto bukti lampau yang berumur lebih dari 7 hari.
*/
async function archiveExpiredPermissions(todayDate) {
	await initDatabase();
	const todayStr = todayDate || (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
	await cleanExpiredProofPhotos(7).catch(() => {});
	const expired = (await getPermissions()).filter((p) => p.status === "Disetujui" && (p.endDate || p.startDate) < todayStr);
	const expiredPerms = [];
	if (expired.length > 0) try {
		await turso.batch(expired.map((perm) => ({
			sql: `UPDATE permissions SET status = 'Selesai' WHERE id = ?;`,
			args: [perm.id]
		})), "write");
		for (const perm of expired) {
			perm.status = "Selesai";
			expiredPerms.push(perm);
		}
	} catch (err) {
		console.error("Gagal mengarsipkan izin batch:", err);
	}
	return {
		archivedCount: expiredPerms.length,
		expiredPerms
	};
}
async function clearPermissions() {
	await initDatabase();
	try {
		await turso.execute("DELETE FROM permissions;");
		invalidatePermissionsCache();
	} catch (err) {
		console.error("Turso clearPermissions error:", err);
	}
}
/**
* Pembersihan Total Terfilter:
* 1. Menghapus total (permanen) berkas yang 'Ditolak'.
* 2. Menghapus total (permanen) permohonan 'Menunggu' yang masa pengajuannya sudah lewat (endDate < todayWib) alias Kadaluarsa/Hangus.
* 3. Memindahkan berkas 'Disetujui' yang sudah selesai (endDate < todayWib) ke status 'Selesai' (Arsip Sah) dan menjamin presensi lampau tercatat di attendance_history.
* 4. Mempertahankan berkas 'Menunggu' dan 'Disetujui' yang masih aktif (hari ini / masa depan).
*/
async function cleanupPermissionsTotal(targetDate) {
	await initDatabase();
	const todayWib = targetDate || (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
	const allPerms = await getPermissions();
	let deletedRejected = 0;
	let deletedExpired = 0;
	let cleanedCompleted = 0;
	let archivedApproved = 0;
	for (const p of allPerms) {
		const end = p.endDate || p.startDate;
		if (p.status === "Ditolak") {
			await turso.execute({
				sql: "DELETE FROM permissions WHERE id = ?;",
				args: [p.id]
			});
			deletedRejected++;
		} else if (p.status === "Menunggu" && end < todayWib) {
			await turso.execute({
				sql: "DELETE FROM permissions WHERE id = ?;",
				args: [p.id]
			});
			deletedExpired++;
		} else if (p.status === "Selesai") {
			await turso.execute({
				sql: "DELETE FROM permissions WHERE id = ?;",
				args: [p.id]
			});
			cleanedCompleted++;
		} else if (p.status === "Disetujui" && end < todayWib) {
			try {
				await turso.execute({
					sql: `INSERT OR REPLACE INTO attendance_history (id, rfid_uid, name, class_name, role, date, time, type, status)
                VALUES (?, ?, ?, ?, 'siswa', ?, '07:00:00', 'masuk', 'Izin');`,
					args: [
						`HIST-${p.id}`,
						p.studentId,
						p.name,
						p.className,
						p.startDate
					]
				});
			} catch {}
			await turso.execute({
				sql: "DELETE FROM permissions WHERE id = ?;",
				args: [p.id]
			});
			archivedApproved++;
		}
	}
	const keptActiveCount = (await getPermissions()).filter((p) => p.status === "Menunggu" || p.status === "Disetujui").length;
	return {
		deletedRejected,
		deletedExpired,
		cleanedCompleted,
		archivedApproved,
		keptActiveCount
	};
}
// src/utils/attendanceStorage.ts
var studentsPath = path.resolve("src/data/students.json");
var logsPath = path.resolve("src/data/attendanceLogs.json");
var historyPath = path.resolve("src/data/attendanceHistory.json");
var cachedStudents = null;
var cachedStudentsTime = 0;
var STUDENTS_CACHE_TTL = 6e4;
var cachedLogs = null;
var cachedLogsTime = 0;
var LOGS_CACHE_TTL = 1e4;
function invalidateStudentsCache() {
	cachedStudents = null;
	cachedStudentsTime = 0;
}
function invalidateLogsCache() {
	cachedLogs = null;
	cachedLogsTime = 0;
}
attendanceEmitter.on("attendance", (evt) => {
	invalidateLogsCache();
	if (evt?.type === "students_updated") invalidateStudentsCache();
});
async function getStudents(forceRefresh = false) {
	if (!forceRefresh && cachedStudents && Date.now() - cachedStudentsTime < STUDENTS_CACHE_TTL) return cachedStudents;
	await initDatabase();
	try {
		const result = (await turso.execute("SELECT * FROM students ORDER BY role DESC, name ASC;")).rows.map((r) => ({
			id: String(r.id),
			rfidUid: String(r.rfid_uid),
			name: String(r.name),
			identifier: String(r.identifier || ""),
			role: r.role,
			category: String(r.category || (r.role === "admin" ? "admin" : r.role === "guru" ? "guru" : "rpl")),
			className: String(r.class_name),
			address: String(r.address || "Padang Ratu, Lampung"),
			email: String(r.email || (r.name ? `${r.name.toLowerCase().replace(/[^a-z0-9]/g, ".")}@smkmaarif.sch.id` : "")),
			phone: String(r.phone || (r.role === "admin" ? "+62 812-3456-7890" : r.role === "guru" ? "+62 813-6901-4432" : "+62 821-7788-9900")),
			birthDate: String(r.birth_date || (r.role === "admin" ? "10 Januari 1980" : r.role === "guru" ? "15 Maret 1984" : "12 Mei 2007")),
			gender: String(r.gender || "L"),
			tag: String(r.tag || "")
		}));
		cachedStudents = result;
		cachedStudentsTime = Date.now();
		return result;
	} catch (err) {
		console.error("Turso getStudents error, fallback ke local JSON:", err);
		try {
			if (fs.existsSync(studentsPath)) {
				const raw = JSON.parse(fs.readFileSync(studentsPath, "utf-8"));
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
async function saveStudent(studentData) {
	await initDatabase();
	const prefix = studentData.role === "admin" ? "ADM" : studentData.role === "guru" ? "GUR" : "STD";
	const id = studentData.id || `${prefix}-${Date.now().toString().slice(-4)}`;
	const rfidUid = (studentData.rfidUid || "").toUpperCase().trim();
	const name = studentData.name || "Nama Civitas";
	const identifier = studentData.identifier || "0000000000";
	const role = studentData.role || "siswa";
	const category = studentData.category || (role === "admin" ? "admin" : role === "guru" ? "guru" : "rpl");
	const className = studentData.className || (role === "admin" ? "Administrator Sekolah" : role === "guru" ? "Dewan Guru" : "X RPL");
	const address = studentData.address || "Padang Ratu, Lampung";
	const email = studentData.email || "";
	const phone = studentData.phone || "";
	const birthDate = studentData.birthDate || "";
	const gender = studentData.gender || "L";
	const tag = studentData.tag || "";
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
		args: [
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
			tag
		]
	});
	invalidateStudentsCache();
	return {
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
		tag
	};
}
async function deleteStudent(id) {
	await initDatabase();
	try {
		const res = await turso.execute({
			sql: "DELETE FROM students WHERE id = ?;",
			args: [id]
		});
		invalidateStudentsCache();
		return res.rowsAffected > 0;
	} catch (err) {
		console.error("Turso deleteStudent error:", err);
		return false;
	}
}
async function getLogs(forceRefresh = false) {
	if (!forceRefresh && cachedLogs && Date.now() - cachedLogsTime < LOGS_CACHE_TTL) return cachedLogs;
	await initDatabase();
	try {
		const result = (await turso.execute("SELECT * FROM attendance_logs ORDER BY date DESC, time DESC;")).rows.map((r) => ({
			id: String(r.id),
			rfidUid: String(r.rfid_uid),
			name: String(r.name),
			className: String(r.class_name),
			role: r.role,
			date: String(r.date),
			time: String(r.time),
			type: r.type,
			status: r.status
		}));
		cachedLogs = result;
		cachedLogsTime = Date.now();
		return result;
	} catch (err) {
		console.error("Turso getLogs error, fallback ke local JSON:", err);
		try {
			if (fs.existsSync(logsPath)) {
				const raw = JSON.parse(fs.readFileSync(logsPath, "utf-8"));
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
async function saveLog(log) {
	await initDatabase();
	try {
		await turso.execute({
			sql: `INSERT OR REPLACE INTO attendance_logs (id, rfid_uid, name, class_name, role, date, time, type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
			args: [
				log.id,
				log.rfidUid,
				log.name,
				log.className,
				log.role,
				log.date,
				log.time,
				log.type,
				log.status
			]
		});
		invalidateLogsCache();
	} catch (err) {
		console.error("Turso saveLog error:", err);
	}
}
async function clearLogs() {
	await initDatabase();
	try {
		await turso.execute("DELETE FROM attendance_logs;");
		invalidateLogsCache();
	} catch (err) {
		console.error("Turso clearLogs error:", err);
	}
}
/**
* Evaluasi Otomatis Alpa Saat Jadwal Masuk Ditutup / Masuk Jadwal Siang (13:30 WIB):
* 1. Mengecek seluruh siswa aktif (role: 'siswa', non-alumni).
* 2. Mengecek siapa yang sudah absen masuk pagi dan siapa yang memiliki surat izin disetujui.
* 3. Siswa yang TIDAK ada absen masuk pagi dan TIDAK ada surat izin langsung dicatat sebagai 'Alpa' di attendance_logs.
*/
async function checkAndApplyAlpa(targetDate) {
	await initDatabase();
	const dateStr = targetDate || (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
	if ((/* @__PURE__ */ new Date(dateStr + "T12:00:00+07:00")).getDay() === 0) return {
		date: dateStr,
		evaluatedCount: 0,
		alpaCount: 0,
		alpaStudents: []
	};
	const students = await getStudents();
	const dateLogs = (await getLogs()).filter((l) => l.date === dateStr);
	const morningUids = /* @__PURE__ */ new Set();
	const alreadyAlpaUids = /* @__PURE__ */ new Set();
	dateLogs.forEach((l) => {
		if (l.role === "siswa") {
			const u = l.rfidUid.toUpperCase();
			if (l.type === "masuk") {
				if (l.status === "Alpa") alreadyAlpaUids.add(u);
				else morningUids.add(u);
			}
		}
	});
	const permissions = await getPermissions(true);
	const approvedPermStudentIds = /* @__PURE__ */ new Set();
	permissions.forEach((p) => {
		if (p.status === "Disetujui" && dateStr >= p.startDate && dateStr <= (p.endDate || p.startDate)) {
			if (p.studentId) approvedPermStudentIds.add(p.studentId.toUpperCase());
			const sMatch = students.find((s) => s.id === p.studentId || p.name && s.name.toLowerCase() === p.name.toLowerCase());
			if (sMatch) {
				approvedPermStudentIds.add(sMatch.rfidUid.toUpperCase());
				approvedPermStudentIds.add(sMatch.id.toUpperCase());
			}
		}
	});
	const alpaStudents = [];
	for (const student of students) {
		if (student.role !== "siswa") continue;
		if (student.className && (student.className.toLowerCase().includes("alumni") || student.className.toLowerCase().includes("lulus"))) continue;
		const u = (student.rfidUid || "").toUpperCase();
		const sId = (student.id || "").toUpperCase();
		if (morningUids.has(u) || approvedPermStudentIds.has(sId) || approvedPermStudentIds.has(u) || alreadyAlpaUids.has(u)) continue;
		const alpaLog = {
			id: `ATT-ALPA-${student.id}-${dateStr}`,
			rfidUid: student.rfidUid,
			name: student.name,
			className: student.className,
			role: "siswa",
			date: dateStr,
			time: "07:40:00",
			type: "masuk",
			status: "Alpa"
		};
		await saveLog(alpaLog);
		alpaStudents.push({
			id: alpaLog.id,
			studentId: student.id,
			rfidUid: student.rfidUid,
			name: student.name,
			className: student.className
		});
	}
	if (alpaStudents.length > 0) attendanceEmitter.emit("attendance", {
		type: "alpa_applied",
		date: dateStr,
		count: alpaStudents.length
	});
	return {
		date: dateStr,
		evaluatedCount: students.length,
		alpaCount: alpaStudents.length,
		alpaStudents
	};
}
/**
* Deteksi Siswa Bolos (ide.txt):
* Siswa yang absen pagi (masuk) tetapi tidak absen siang (pulang)
* dikategorikan 'Bolos' dan dipotong 10 poin secara otomatis.
*/
async function checkAndApplyBolos(targetDate, targetStudentId) {
	await initDatabase();
	const dateStr = targetDate || (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
	const timeStr = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-GB", { timeZone: "Asia/Jakarta" });
	const dateLogs = (await getLogs()).filter((l) => l.date === dateStr);
	const students = await getStudents();
	if ((/* @__PURE__ */ new Date(dateStr + "T12:00:00+07:00")).getDay() === 0 && !targetStudentId) return {
		date: dateStr,
		evaluatedCount: 0,
		bolosCount: 0,
		penalizedStudents: []
	};
	if (targetStudentId) {
		const target = students.find((s) => s.id === targetStudentId || s.rfidUid.toUpperCase() === targetStudentId.toUpperCase());
		if (target && target.role === "siswa") {
			const bolosLog = {
				id: `ATT-BOLOS-${Date.now()}-${target.id}`,
				rfidUid: target.rfidUid,
				name: target.name,
				className: target.className,
				role: "siswa",
				date: dateStr,
				time: timeStr.slice(0, 8),
				type: "pulang",
				status: "Bolos"
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
				reason: "Bolos: Tertangkap basah meninggalkan lingkungan sekolah / jam pelajaran tanpa izin"
			};
			await savePointDeduction(deductionRecord);
			attendanceEmitter.emit("attendance", {
				type: "bolos_penalized",
				log: bolosLog,
				deduction: deductionRecord
			});
			return {
				date: dateStr,
				evaluatedCount: 1,
				bolosCount: 1,
				penalizedStudents: [{
					id: bolosLog.id,
					studentId: target.id,
					rfidUid: target.rfidUid,
					name: target.name,
					className: target.className,
					pointsDeducted: 10
				}]
			};
		}
	}
	const studentMap = /* @__PURE__ */ new Map();
	students.forEach((s) => {
		if (s.role === "siswa") {
			studentMap.set(s.rfidUid.toUpperCase(), s);
			studentMap.set(s.id.toUpperCase(), s);
		}
	});
	const morningUids = /* @__PURE__ */ new Set();
	const afternoonUids = /* @__PURE__ */ new Set();
	const alreadyBolosUids = /* @__PURE__ */ new Set();
	dateLogs.forEach((l) => {
		if (l.role === "siswa") {
			const u = l.rfidUid.toUpperCase();
			if (l.type === "masuk") morningUids.add(u);
			if (l.type === "pulang") {
				afternoonUids.add(u);
				if (l.status === "Bolos") alreadyBolosUids.add(u);
			}
		}
	});
	const permissions = await getPermissions(true);
	const approvedPermUids = /* @__PURE__ */ new Set();
	permissions.forEach((p) => {
		if (p.status === "Disetujui" && dateStr >= p.startDate && dateStr <= (p.endDate || p.startDate)) {
			if (p.studentId) approvedPermUids.add(p.studentId.toUpperCase());
			const sMatch = students.find((s) => s.id === p.studentId || p.name && s.name.toLowerCase() === p.name.toLowerCase());
			if (sMatch) {
				approvedPermUids.add(sMatch.rfidUid.toUpperCase());
				approvedPermUids.add(sMatch.id.toUpperCase());
			}
		}
	});
	const penalizedStudents = [];
	for (const uid of morningUids) {
		if (approvedPermUids.has(uid)) continue;
		if (!afternoonUids.has(uid) && !alreadyBolosUids.has(uid)) {
			const student = studentMap.get(uid);
			if (student) {
				const bolosLog = {
					id: `ATT-BOLOS-${Date.now()}-${student.id}`,
					rfidUid: student.rfidUid,
					name: student.name,
					className: student.className,
					role: "siswa",
					date: dateStr,
					time: timeStr.slice(0, 8),
					type: "pulang",
					status: "Bolos"
				};
				await saveLog(bolosLog);
				const deductionRecord = {
					id: `DED-BOLOS-${Date.now()}-${student.id}`,
					studentId: student.id,
					rfidUid: student.rfidUid,
					date: dateStr,
					time: timeStr.slice(0, 8),
					minutesLate: 0,
					pointsDeducted: 10,
					reason: "Bolos: Tercatat presensi masuk pagi tetapi tidak melakukan presensi kepulangan (pulang)"
				};
				await savePointDeduction(deductionRecord);
				attendanceEmitter.emit("attendance", {
					type: "bolos_penalized",
					log: bolosLog,
					deduction: deductionRecord
				});
				penalizedStudents.push({
					id: bolosLog.id,
					studentId: student.id,
					rfidUid: student.rfidUid,
					name: student.name,
					className: student.className,
					pointsDeducted: 10
				});
			}
		}
	}
	return {
		date: dateStr,
		evaluatedCount: morningUids.size,
		bolosCount: penalizedStudents.length,
		penalizedStudents
	};
}
/**
* Arsip Otomatis Jam 23:00 WIB & Reset Harian (ide.txt):
* 1. Mengeksekusi penalti bolos (-10 poin) bagi yang belum absen pulang.
* 2. Memindahkan log hari berjalan ke tabel arsip historis permanen (attendance_history).
* 3. Mengosongkan attendance_logs aktif sehingga status esok hari kembali 'Belum Absen'.
*/
async function archiveAndResetDailyLogs(targetDate) {
	await initDatabase();
	const dateStr = targetDate || (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
	const bolosResult = await checkAndApplyBolos(dateStr);
	const logsToArchive = (await getLogs()).filter((l) => l.date === dateStr);
	if (logsToArchive.length > 0) {
		for (const log of logsToArchive) try {
			await turso.execute({
				sql: `
            INSERT OR REPLACE INTO attendance_history (id, rfid_uid, name, class_name, role, date, time, type, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
          `,
				args: [
					log.id,
					log.rfidUid,
					log.name,
					log.className,
					log.role,
					log.date,
					log.time,
					log.type,
					log.status
				]
			});
		} catch (err) {
			console.error("Gagal arsip log ke attendance_history:", err);
		}
		try {
			await turso.execute({
				sql: "DELETE FROM attendance_logs WHERE date = ?;",
				args: [dateStr]
			});
		} catch (err) {
			console.error("Gagal hapus attendance_logs setelah arsip:", err);
		}
	}
	let permArchivedCount = 0;
	try {
		const allPerms = await getPermissions();
		const allStudents = await getStudents();
		const activePermsForDate = allPerms.filter((p) => p.status === "Disetujui" && dateStr >= p.startDate && dateStr <= (p.endDate || p.startDate));
		for (const perm of activePermsForDate) {
			const std = allStudents.find((s) => s.id === perm.studentId || s.name && perm.name && s.name.toLowerCase() === perm.name.toLowerCase());
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
						std?.role || "siswa",
						dateStr,
						"07:00:00",
						"masuk",
						"Izin"
					]
				});
				permArchivedCount++;
			} catch (err) {
				console.error("Gagal arsip catatan izin ke attendance_history:", err);
			}
			if ((perm.endDate || perm.startDate) <= dateStr) await updatePermissionStatus(perm.id, "Selesai");
		}
	} catch (err) {
		console.error("Gagal memproses arsip izin harian:", err);
	}
	const isSundayDate = (/* @__PURE__ */ new Date(dateStr + "T12:00:00+07:00")).getDay() === 0;
	let alpaArchivedCount = 0;
	if (!isSundayDate) try {
		const allStudents = await getStudents();
		const allPerms = await getPermissions();
		const activePermStudentIds = new Set(allPerms.filter((p) => p.status === "Disetujui" && dateStr >= p.startDate && dateStr <= (p.endDate || p.startDate)).map((p) => p.studentId));
		const morningTapUids = new Set(logsToArchive.filter((l) => l.role === "siswa" && l.type === "masuk").map((l) => l.rfidUid.toUpperCase()));
		for (const student of allStudents) {
			if (student.role !== "siswa") continue;
			if (student.className && (student.className.toLowerCase().includes("alumni") || student.className.toLowerCase().includes("lulus"))) continue;
			const u = (student.rfidUid || "").toUpperCase();
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
							"siswa",
							dateStr,
							"07:15:00",
							"masuk",
							"Alpa"
						]
					});
					alpaArchivedCount++;
				} catch (err) {
					console.error("Gagal arsip catatan alpa ke attendance_history:", err);
				}
			}
		}
	} catch (err) {
		console.error("Gagal memproses arsip alpa harian:", err);
	}
	attendanceEmitter.emit("attendance", {
		type: "daily_archived",
		date: dateStr,
		count: logsToArchive.length,
		permissionsCount: permArchivedCount,
		alpaCount: alpaArchivedCount
	});
	return {
		status: "success",
		message: `Presensi tanggal ${dateStr} berhasil diarsip ke tabel permanen (${logsToArchive.length} log presensi, ${permArchivedCount} izin, ${alpaArchivedCount} alpa).`,
		archivedDate: dateStr,
		archivedCount: logsToArchive.length,
		bolosCount: bolosResult.bolosCount,
		permissionsCount: permArchivedCount
	};
}
/**
* FUNGSI UTAMA PEMINDAIAN MANDIRI (SELF-HEALING SCANNER & AUTO-CATCHUP):
* 1. Langsung memindai saat server dibuat / diaktifkan (Startup Scan).
* 2. Mengarsip seluruh log tanggal lampau (date < todayStr) yang tertinggal saat server mati.
* 3. Mengarsip perizinan yang masa berlakunya sudah habis (endDate < todayStr) ke status 'Selesai'.
* 4. Mencatat rekaman presensi 'Izin' resmi di attendance_history untuk setiap izin lampau.
* 5. Menjalankan reset jam 23:00 jika waktu sudah mencapai/melewati 23:00 WIB.
*/
async function syncDailyAttendanceAndPermissions(forcedDate) {
	await initDatabase();
	const now = /* @__PURE__ */ new Date();
	const todayWib = forcedDate || now.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
	const hour = parseInt(new Intl.DateTimeFormat("id-ID", {
		timeZone: "Asia/Jakarta",
		hour: "2-digit",
		hour12: false
	}).format(now), 10);
	const staleDatesProcessed = [];
	const allLogs = await getLogs();
	const staleDates = Array.from(new Set(allLogs.filter((l) => l.date < todayWib).map((l) => l.date))).sort();
	for (const sDate of staleDates) {
		console.log(`[SELF-HEALING SCAN] Mengarsip log presensi tanggal lampau (${sDate})...`);
		await archiveAndResetDailyLogs(sDate);
		staleDatesProcessed.push(sDate);
	}
	const permArchiveResult = await archiveExpiredPermissions(todayWib);
	const allStudents = await getStudents();
	const permBatchStatements = [];
	for (const expPerm of permArchiveResult.expiredPerms) {
		const std = allStudents.find((s) => s.id === expPerm.studentId || s.name && expPerm.name && s.name.toLowerCase() === expPerm.name.toLowerCase());
		const dStart = new Date(expPerm.startDate);
		const dEnd = new Date(expPerm.endDate || expPerm.startDate);
		for (let d = new Date(dStart); d <= dEnd; d.setDate(d.getDate() + 1)) {
			const curDateStr = d.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
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
						std?.role || "siswa",
						curDateStr,
						"07:00:00",
						"masuk",
						"Izin"
					]
				});
			}
		}
	}
	if (permBatchStatements.length > 0) try {
		await turso.batch(permBatchStatements, "write");
	} catch (e) {
		console.error("[SYNC PERMISSIONS BATCH ERROR]:", e);
	}
	const minute = parseInt(new Intl.DateTimeFormat("id-ID", {
		timeZone: "Asia/Jakarta",
		minute: "2-digit"
	}).format(now), 10);
	const curMinutes = hour * 60 + minute;
	const schedulerState = getSchedulerState();
	if (curMinutes >= 810 && schedulerState.lastAlpaDate !== todayWib) {
		console.log(`[SELF-HEALING 13:30 WIB] Menjalankan penetapan Alpa otomatis untuk ${todayWib}...`);
		const alpaRes = await checkAndApplyAlpa(todayWib);
		saveSchedulerState({
			lastAlpaDate: todayWib,
			lastStatusMessage: `Sukses Evaluasi Alpa: ${alpaRes.alpaCount} siswa dicatat Alpa.`
		});
	}
	if (curMinutes >= 900 && schedulerState.lastBolosDate !== todayWib) {
		console.log(`[SELF-HEALING 15:00 WIB] Menjalankan evaluasi Bolos kepulangan untuk ${todayWib}...`);
		const bolosRes = await checkAndApplyBolos(todayWib);
		saveSchedulerState({
			lastBolosDate: todayWib,
			lastStatusMessage: `Sukses Evaluasi Bolos: ${bolosRes.bolosCount} siswa bolos dipotong 10 poin.`
		});
	}
	if (hour >= 23 && globalThis.__lastArchivedDate !== todayWib) {
		globalThis.__lastArchivedDate = todayWib;
		console.log(`[AUTO-RESET 23:00 WIB] Menjalankan arsip otomatis & reset harian untuk tanggal ${todayWib}...`);
		await archiveAndResetDailyLogs(todayWib);
		staleDatesProcessed.push(todayWib);
	}
	return {
		status: "success",
		today: todayWib,
		staleDatesProcessed,
		permissionsArchivedCount: permArchiveResult.archivedCount,
		message: `Pemindaian instan selesai: ${staleDatesProcessed.length} tanggal lampau direset, ${permArchiveResult.archivedCount} izin kedaluwarsa diarsipkan.`
	};
}
/**
* Mengambil Riwayat Presensi Historis untuk Filter Laporan (Hari Ini / Minggu Lalu / Bulan Lalu / Tahun Lalu)
*/
async function getAttendanceHistory(options) {
	await initDatabase();
	const filter = options?.filter || "all";
	const now = /* @__PURE__ */ new Date();
	const todayStr = now.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
	let minDate = "";
	if (filter === "today") minDate = todayStr;
	else if (filter === "week") {
		const d = new Date(now);
		d.setDate(d.getDate() - 7);
		minDate = d.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
	} else if (filter === "month") {
		const d = new Date(now);
		d.setDate(d.getDate() - 30);
		minDate = d.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
	} else if (filter === "year") {
		const d = new Date(now);
		d.setDate(d.getDate() - 365);
		minDate = d.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
	}
	try {
		let sql = `
      SELECT id, rfid_uid, name, class_name, role, date, time, type, status FROM (
        SELECT id, rfid_uid, name, class_name, role, date, time, type, status FROM attendance_logs
        UNION ALL
        SELECT id, rfid_uid, name, class_name, role, date, time, type, status FROM attendance_history
      )
    `;
		const conditions = [];
		const args = [];
		if (minDate) {
			conditions.push("date >= ?");
			args.push(minDate);
		}
		if (options?.rfidUid) {
			conditions.push("UPPER(rfid_uid) = UPPER(?)");
			args.push(options.rfidUid);
		}
		if (conditions.length > 0) sql += " WHERE " + conditions.join(" AND ");
		sql += " ORDER BY date DESC, time DESC;";
		return (await turso.execute({
			sql,
			args
		})).rows.map((r) => ({
			id: String(r.id),
			rfidUid: String(r.rfid_uid),
			name: String(r.name),
			className: String(r.class_name),
			role: r.role,
			date: String(r.date),
			time: String(r.time),
			type: r.type,
			status: r.status
		}));
	} catch (err) {
		console.error("Turso getAttendanceHistory error, fallback lokal:", err);
		try {
			const activeLogs = await getLogs();
			let archivedLogs = [];
			if (fs.existsSync(historyPath)) archivedLogs = JSON.parse(fs.readFileSync(historyPath, "utf-8"));
			return [...activeLogs, ...archivedLogs].filter((l) => {
				if (minDate && l.date < minDate) return false;
				if (options?.rfidUid && l.rfidUid.toUpperCase() !== options.rfidUid.toUpperCase()) return false;
				return true;
			});
		} catch {
			return [];
		}
	}
}
async function clearAttendanceHistory() {
	await initDatabase();
	try {
		await turso.execute("DELETE FROM attendance_history;");
	} catch (err) {
		console.error("Turso clearAttendanceHistory error:", err);
	}
}
export { getPermissions as _, clearLogs as a, updatePermissionStatus as b, getLogs as c, saveLog as d, saveStudent as f, deletePermission as g, clearPermissions as h, clearAttendanceHistory as i, getStudents as l, cleanupPermissionsTotal as m, checkAndApplyAlpa as n, deleteStudent as o, syncDailyAttendanceAndPermissions as p, checkAndApplyBolos as r, getAttendanceHistory as s, archiveAndResetDailyLogs as t, invalidateStudentsCache as u, savePermission as v, updatePermission as y };
