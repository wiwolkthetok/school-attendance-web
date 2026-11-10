import { n as turso, t as initDatabase } from "./tursoClient_L2U3qzVi.mjs";
import fs from "node:fs";
import path from "node:path";
// src/utils/pointsStorage.ts
var pointsPath = path.resolve("src/data/pointDeductions.json");
/**
* Hitung pengurangan poin secara akurat berdasarkan menit keterlambatan sesi pagi (ide.txt)
*/
function calculatePointDeduction(minutesLate) {
	if (minutesLate <= 0) return {
		pointsDeducted: 0,
		reason: "Tepat Waktu (Tidak Ada Pengurangan)"
	};
	if (minutesLate >= 1 && minutesLate <= 5) return {
		pointsDeducted: 2,
		reason: `Terlambat ${minutesLate} menit pada sesi pagi (Kategori 1 - 5 menit: -2 Poin)`
	};
	if (minutesLate > 5 && minutesLate < 10) return {
		pointsDeducted: 3,
		reason: `Terlambat ${minutesLate} menit pada sesi pagi (Kategori 6 - 9 menit: -3 Poin)`
	};
	if (minutesLate >= 10 && minutesLate <= 20) return {
		pointsDeducted: 5,
		reason: `Terlambat ${minutesLate} menit pada sesi pagi (Kategori 10 - 20 menit: -5 Poin)`
	};
	if (minutesLate > 20 && minutesLate <= 30) return {
		pointsDeducted: 30,
		reason: `Terlambat ${minutesLate} menit pada sesi pagi (Kategori 20 - 30 menit: -30 Poin)`
	};
	return {
		pointsDeducted: 40,
		reason: `Terlambat berat ${minutesLate} menit pada sesi pagi (> 30 menit: -40 Poin)`
	};
}
async function getPointDeductions(studentId, rfidUid) {
	await initDatabase();
	try {
		let sql = "SELECT * FROM point_deductions ORDER BY date DESC, time DESC;";
		let args = [];
		const cleanSid = (studentId || "").trim();
		const cleanRfid = (rfidUid || "").trim().replace(/\s+/g, "");
		if (cleanSid && cleanRfid) {
			sql = "SELECT * FROM point_deductions WHERE UPPER(student_id) = UPPER(?) OR UPPER(rfid_uid) = UPPER(?) ORDER BY date DESC, time DESC;";
			args = [cleanSid, cleanRfid];
		} else if (cleanSid) {
			sql = "SELECT * FROM point_deductions WHERE UPPER(student_id) = UPPER(?) ORDER BY date DESC, time DESC;";
			args = [cleanSid];
		} else if (cleanRfid) {
			sql = "SELECT * FROM point_deductions WHERE UPPER(rfid_uid) = UPPER(?) ORDER BY date DESC, time DESC;";
			args = [cleanRfid];
		}
		return (await turso.execute({
			sql,
			args
		})).rows.map((r) => ({
			id: String(r.id),
			studentId: String(r.student_id),
			rfidUid: String(r.rfid_uid),
			date: String(r.date),
			time: String(r.time),
			minutesLate: Number(r.minutes_late),
			pointsDeducted: Number(r.points_deducted),
			reason: String(r.reason)
		}));
	} catch (err) {
		console.error("Turso getPointDeductions error, fallback local JSON:", err);
		try {
			if (!fs.existsSync(pointsPath)) return [];
			const all = JSON.parse(fs.readFileSync(pointsPath, "utf-8"));
			const cleanSid = (studentId || "").trim().toUpperCase();
			const cleanRfid = (rfidUid || "").trim().toUpperCase().replace(/\s+/g, "");
			if (cleanSid && cleanRfid) return all.filter((p) => p.studentId && p.studentId.toUpperCase() === cleanSid || p.rfidUid && p.rfidUid.toUpperCase() === cleanRfid);
			else if (cleanSid) return all.filter((p) => p.studentId && p.studentId.toUpperCase() === cleanSid);
			else if (cleanRfid) return all.filter((p) => p.rfidUid && p.rfidUid.toUpperCase() === cleanRfid);
			return all;
		} catch {
			return [];
		}
	}
}
async function savePointDeduction(deduction) {
	await initDatabase();
	try {
		await turso.execute({
			sql: `
        INSERT OR REPLACE INTO point_deductions (id, student_id, rfid_uid, date, time, minutes_late, points_deducted, reason)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
      `,
			args: [
				deduction.id,
				deduction.studentId,
				deduction.rfidUid,
				deduction.date,
				deduction.time,
				deduction.minutesLate,
				deduction.pointsDeducted,
				deduction.reason
			]
		});
	} catch (err) {
		console.error("Turso savePointDeduction error:", err);
	}
}
async function getStudentPointSummary(studentId, rfidUid) {
	const deductions = await getPointDeductions(studentId, rfidUid);
	const totalDeducted = deductions.reduce((acc, curr) => acc + curr.pointsDeducted, 0);
	const totalPoints = Math.max(0, 100 - totalDeducted);
	let status = "aman";
	let statusLabel = "Disiplin & Aman";
	if (totalPoints === 0) {
		status = "diblokir";
		statusLabel = "Terkunci / Diblokir (Poin 0)";
	} else if (totalPoints < 10) {
		status = "peringatan";
		statusLabel = "Peringatan! Poin Kritis (< 10)";
	}
	let currentAccum = 100;
	const enriched = [...deductions].reverse().map((d) => {
		currentAccum = Math.max(0, currentAccum - d.pointsDeducted);
		return {
			...d,
			remainingPoints: currentAccum
		};
	}).reverse();
	return {
		totalPoints,
		status,
		statusLabel,
		totalDeducted,
		deductions: enriched
	};
}
async function resetStudentPoints(studentId, rfidUid) {
	await initDatabase();
	const cleanSid = (studentId || "").trim();
	const cleanRfid = (rfidUid || "").trim().replace(/\s+/g, "");
	try {
		if (cleanSid || cleanRfid) await turso.execute({
			sql: "DELETE FROM point_deductions WHERE UPPER(student_id) = UPPER(?) OR UPPER(rfid_uid) = UPPER(?);",
			args: [cleanSid, cleanRfid]
		});
		else await turso.execute("DELETE FROM point_deductions;");
	} catch (err) {
		console.error("Turso resetStudentPoints error:", err);
	}
}
export { savePointDeduction as a, resetStudentPoints as i, getPointDeductions as n, getStudentPointSummary as r, calculatePointDeduction as t };
