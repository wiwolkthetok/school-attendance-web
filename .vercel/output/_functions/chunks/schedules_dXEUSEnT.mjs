import { t as __exportAll } from "./rolldown-runtime_D8jQpDG7.mjs";
import { n as turso, t as initDatabase } from "./tursoClient_L2U3qzVi.mjs";
import { t as attendanceEmitter } from "./attendanceEvents_eOwLBYLa.mjs";
import fs from "node:fs";
import path from "node:path";
// src/utils/scheduleStorage.ts
var schedulesPath = path.resolve("src/data/schedules.json");
/**
* Pembersihan Otomatis: Hapus agenda dari bulan lampau saat kalender berganti bulan
*/
async function autoCleanupPastMonthSchedules() {
	await initDatabase();
	const now = /* @__PURE__ */ new Date();
	const firstDayOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
	try {
		return (await turso.execute({
			sql: `DELETE FROM schedules 
            WHERE COALESCE(NULLIF(end_date, ''), date) != '' 
              AND COALESCE(NULLIF(end_date, ''), date) IS NOT NULL 
              AND COALESCE(NULLIF(end_date, ''), date) < ?;`,
			args: [firstDayOfMonth]
		})).rowsAffected || 0;
	} catch (err) {
		console.error("Turso autoCleanupPastMonthSchedules error:", err);
		return 0;
	}
}
async function getSchedules() {
	await initDatabase();
	await autoCleanupPastMonthSchedules().catch(() => {});
	try {
		return (await turso.execute("SELECT * FROM schedules ORDER BY time_start ASC;")).rows.map((r) => ({
			id: String(r.id),
			title: String(r.title),
			category: r.category,
			day: String(r.day),
			date: r.date ? String(r.date) : "",
			startDate: String(r.start_date || r.date || ""),
			endDate: String(r.end_date || r.start_date || r.date || ""),
			timeStart: String(r.time_start),
			timeEnd: String(r.time_end),
			room: String(r.room),
			classTarget: String(r.class_target),
			instructor: String(r.instructor),
			color: String(r.color || "teal"),
			visibility: r.visibility === "guru" ? "guru" : "public",
			notifyLeadDays: Number(r.notify_lead_days || 0)
		}));
	} catch (err) {
		console.error("Turso getSchedules error, fallback ke local JSON:", err);
		try {
			if (fs.existsSync(schedulesPath)) return JSON.parse(fs.readFileSync(schedulesPath, "utf-8"));
		} catch {}
		return [];
	}
}
async function saveSchedule(item) {
	await initDatabase();
	const id = item.id || `SCH-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
	const title = item.title || "Agenda Baru";
	const category = item.category || "kbm";
	const day = item.day || "Senin";
	const date = item.date || item.startDate || "";
	const startDate = item.startDate || date || "";
	const endDate = item.endDate || startDate || date || "";
	const visibility = item.visibility === "guru" ? "guru" : "public";
	const notifyLeadDays = Number(item.notifyLeadDays ?? 0);
	const timeStart = item.timeStart || "08:00";
	const timeEnd = item.timeEnd || "09:30";
	const room = item.room || "Ruang KBM";
	const classTarget = item.classTarget || "Semua Kelas";
	const instructor = item.instructor || "Guru Pengampu";
	let color = item.color;
	if (!color) switch (category) {
		case "kbm":
			color = "teal";
			break;
		case "rapat":
			color = "pink";
			break;
		case "lsp":
			color = "purple";
			break;
		default: color = "amber";
	}
	const fullItem = {
		id,
		title,
		category,
		day,
		date,
		startDate,
		endDate,
		timeStart,
		timeEnd,
		room,
		classTarget,
		instructor,
		color,
		visibility,
		notifyLeadDays
	};
	try {
		await turso.execute({
			sql: `INSERT OR REPLACE INTO schedules (id, title, category, day, date, time_start, time_end, room, class_target, instructor, color, visibility, start_date, end_date, notify_lead_days)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
			args: [
				id,
				title,
				category,
				day,
				date,
				timeStart,
				timeEnd,
				room,
				classTarget,
				instructor,
				color,
				visibility,
				startDate,
				endDate,
				notifyLeadDays
			]
		});
		let list = [];
		try {
			if (fs.existsSync(schedulesPath)) list = JSON.parse(fs.readFileSync(schedulesPath, "utf-8"));
		} catch {}
		const existIdx = list.findIndex((s) => s.id === id);
		if (existIdx >= 0) list[existIdx] = fullItem;
		else list.push(fullItem);
		fs.writeFileSync(schedulesPath, JSON.stringify(list, null, 2), "utf-8");
	} catch (err) {
		console.error("Turso saveSchedule error:", err);
	}
	return fullItem;
}
async function deleteSchedule(id) {
	await initDatabase();
	try {
		await turso.execute({
			sql: "DELETE FROM schedules WHERE id = ?;",
			args: [id]
		});
		if (fs.existsSync(schedulesPath)) try {
			const filtered = JSON.parse(fs.readFileSync(schedulesPath, "utf-8")).filter((s) => s.id !== id);
			fs.writeFileSync(schedulesPath, JSON.stringify(filtered, null, 2), "utf-8");
		} catch {}
	} catch (err) {
		console.error("Turso deleteSchedule error:", err);
	}
	return true;
}
async function clearAllSchedules() {
	await initDatabase();
	try {
		await turso.execute("DELETE FROM schedules;");
		fs.writeFileSync(schedulesPath, JSON.stringify([], null, 2), "utf-8");
	} catch (err) {
		console.error("Turso clearAllSchedules error:", err);
	}
	return true;
}
// src/pages/api/schedules.ts
var schedules_exports = /* @__PURE__ */ __exportAll({
	DELETE: () => DELETE,
	GET: () => GET,
	POST: () => POST,
	prerender: () => false
});
var GET = async ({ request }) => {
	try {
		const url = new URL(request.url);
		const day = url.searchParams.get("day");
		const category = url.searchParams.get("category");
		const visibility = url.searchParams.get("visibility");
		let list = await getSchedules();
		if (day && day !== "all") list = list.filter((s) => s.day.toLowerCase() === day.toLowerCase());
		if (category && category !== "all") list = list.filter((s) => s.category.toLowerCase() === category.toLowerCase());
		if (visibility && visibility !== "all") list = list.filter((s) => (s.visibility || "public") === visibility);
		return new Response(JSON.stringify(list), { headers: { "Content-Type": "application/json" } });
	} catch (err) {
		return new Response(JSON.stringify({
			status: "error",
			message: err?.message || "Gagal memuat jadwal"
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
var POST = async ({ request }) => {
	try {
		const body = await request.json().catch(() => ({}));
		const title = (body.title || "").trim();
		const day = (body.day || "Senin").trim();
		const timeStart = (body.timeStart || "08:00").trim();
		const timeEnd = (body.timeEnd || "09:30").trim();
		if (!title) return new Response(JSON.stringify({
			status: "error",
			message: "Judul agenda / mata pelajaran wajib diisi"
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		const saved = await saveSchedule({
			id: body.id,
			title,
			category: body.category || "kbm",
			day,
			date: body.date || body.startDate || "",
			startDate: body.startDate || body.date || "",
			endDate: body.endDate || body.startDate || body.date || "",
			visibility: body.visibility === "guru" ? "guru" : "public",
			notifyLeadDays: Number(body.notifyLeadDays ?? 0),
			timeStart,
			timeEnd,
			room: body.room || "Ruang KBM",
			classTarget: body.classTarget || "Semua Kelas",
			instructor: body.instructor || "Guru Pengampu",
			color: body.color
		});
		attendanceEmitter.emit("attendance", {
			type: "schedules_updated",
			data: saved
		});
		return new Response(JSON.stringify({
			status: "success",
			message: "Agenda berhasil disimpan",
			data: saved
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({
			status: "error",
			message: err?.message || "Gagal menyimpan agenda"
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
var DELETE = async ({ request }) => {
	try {
		const url = new URL(request.url);
		if (url.searchParams.get("all") === "true") {
			await clearAllSchedules();
			attendanceEmitter.emit("attendance", { type: "schedules_updated" });
			return new Response(JSON.stringify({
				status: "success",
				message: "Semua agenda berhasil dikosongkan"
			}), {
				status: 200,
				headers: { "Content-Type": "application/json" }
			});
		}
		const id = url.searchParams.get("id") || (await request.json().catch(() => ({}))).id;
		if (!id) return new Response(JSON.stringify({
			status: "error",
			message: "ID agenda wajib disertakan"
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		await deleteSchedule(id);
		attendanceEmitter.emit("attendance", { type: "schedules_updated" });
		return new Response(JSON.stringify({
			status: "success",
			message: "Agenda berhasil dihapus"
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({
			status: "error",
			message: err?.message || "Gagal menghapus agenda"
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
// \0virtual:astro:page:src/pages/api/schedules@_@ts
var page = () => schedules_exports;
export { page };
