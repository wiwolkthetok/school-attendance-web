import { t as __exportAll } from "./rolldown-runtime_D8jQpDG7.mjs";
import { t as attendanceEmitter } from "./attendanceEvents_eOwLBYLa.mjs";
import { f as saveStudent, l as getStudents, o as deleteStudent } from "./attendanceStorage_DJzJ-FgX.mjs";
// src/pages/api/students.ts
var students_exports = /* @__PURE__ */ __exportAll({
	DELETE: () => DELETE,
	GET: () => GET,
	POST: () => POST,
	prerender: () => false
});
var GET = async () => {
	const safeStudents = (await getStudents()).map((s) => {
		if (s.role === "admin") return {
			...s,
			rfidUid: ""
		};
		return s;
	});
	return new Response(JSON.stringify(safeStudents), { headers: { "Content-Type": "application/json" } });
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
		const body = await request.json().catch(() => ({}));
		let rfidUid = extractDecimalUid(body.rfidUid || "");
		const name = (body.name || "").trim();
		const students = await getStudents();
		const existingById = body.id ? students.find((s) => s.id === body.id) : null;
		if (existingById && (existingById.role === "admin" || body.role === "admin") && !rfidUid) rfidUid = existingById.rfidUid ? existingById.rfidUid.trim().toUpperCase() : "";
		if (!name || !rfidUid) return new Response(JSON.stringify({
			status: "error",
			message: "Nama dan UID Kartu RFID wajib diisi"
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		const rawPhone = (body.phone || "").trim().replace(/[\s\-\.]/g, "");
		if (rawPhone) {
			const is08 = rawPhone.startsWith("08") && rawPhone.length >= 10 && rawPhone.length <= 13;
			const is628 = rawPhone.startsWith("628") && rawPhone.length >= 11 && rawPhone.length <= 14;
			const isPlus628 = rawPhone.startsWith("+628") && rawPhone.length >= 12 && rawPhone.length <= 15;
			if (!is08 && !is628 && !isPlus628) return new Response(JSON.stringify({
				status: "error",
				message: "Nomor WhatsApp tidak valid (harus 10-13 digit diawali 08 atau 628)"
			}), {
				status: 400,
				headers: { "Content-Type": "application/json" }
			});
		}
		const existing = students.find((s) => s.rfidUid.toUpperCase() === rfidUid && s.id !== body.id);
		if (existing) return new Response(JSON.stringify({
			status: "error",
			message: `UID Kartu ${rfidUid} sudah terdaftar atas nama ${existing.name} (${existing.className})`
		}), {
			status: 409,
			headers: { "Content-Type": "application/json" }
		});
		const cleanId = (body.identifier || "").trim();
		if (cleanId && cleanId !== "0000000000" && body.role === "siswa") {
			const existingId = students.find((s) => s.identifier === cleanId && s.id !== body.id && s.role === "siswa");
			if (existingId) return new Response(JSON.stringify({
				status: "error",
				message: `NISN ${cleanId} sudah terdaftar atas nama ${existingId.name} (${existingId.className})`
			}), {
				status: 409,
				headers: { "Content-Type": "application/json" }
			});
		}
		const saved = await saveStudent({
			id: body.id,
			rfidUid,
			name,
			identifier: body.identifier || "0000000000",
			role: body.role || (existingById ? existingById.role : "siswa"),
			category: body.category || (body.role === "guru" ? "guru" : body.role === "admin" ? "admin" : "rpl"),
			className: body.className || (body.role === "admin" ? "Administrator Sekolah" : "XII RPL"),
			address: body.address || "Padang Ratu, Lampung",
			email: body.email || "",
			phone: body.phone || "",
			birthDate: body.birthDate || "",
			gender: body.gender || "L",
			tag: body.tag || ""
		});
		const safeSaved = saved.role === "admin" ? {
			...saved,
			rfidUid: ""
		} : saved;
		attendanceEmitter.emit("attendance", {
			type: "students_updated",
			data: safeSaved
		});
		return new Response(JSON.stringify({
			status: "success",
			message: "Data civitas dan kartu RFID berhasil disimpan",
			data: safeSaved
		}), { headers: { "Content-Type": "application/json" } });
	} catch (err) {
		return new Response(JSON.stringify({
			status: "error",
			message: err?.message || "Gagal menyimpan data"
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
var DELETE = async ({ request }) => {
	try {
		const id = new URL(request.url).searchParams.get("id") || (await request.json().catch(() => ({}))).id;
		if (!id) return new Response(JSON.stringify({
			status: "error",
			message: "ID civitas wajib disertakan"
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		const target = (await getStudents()).find((s) => s.id === id);
		if (!target) return new Response(JSON.stringify({
			status: "error",
			message: "Data civitas tidak ditemukan"
		}), {
			status: 404,
			headers: { "Content-Type": "application/json" }
		});
		if (target.role === "admin" || target.id === "ADM-001") return new Response(JSON.stringify({
			status: "error",
			message: "Akun Administrator Utama dilindungi dan tidak boleh dihapus."
		}), {
			status: 403,
			headers: { "Content-Type": "application/json" }
		});
		await deleteStudent(id);
		attendanceEmitter.emit("attendance", { type: "students_updated" });
		return new Response(JSON.stringify({
			status: "success",
			message: "Data civitas berhasil dihapus"
		}), { headers: { "Content-Type": "application/json" } });
	} catch (err) {
		return new Response(JSON.stringify({
			status: "error",
			message: err?.message || "Gagal menghapus data"
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
// \0virtual:astro:page:src/pages/api/students@_@ts
var page = () => students_exports;
export { page };
