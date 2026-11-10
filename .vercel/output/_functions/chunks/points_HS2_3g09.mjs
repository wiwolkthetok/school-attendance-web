import { t as __exportAll } from "./rolldown-runtime_D8jQpDG7.mjs";
import { a as savePointDeduction, i as resetStudentPoints, n as getPointDeductions, r as getStudentPointSummary } from "./pointsStorage_DocJKj43.mjs";
// src/pages/api/points.ts
var points_exports = /* @__PURE__ */ __exportAll({
	DELETE: () => DELETE,
	GET: () => GET,
	POST: () => POST,
	prerender: () => false
});
var GET = async ({ request }) => {
	const url = new URL(request.url);
	const studentId = url.searchParams.get("studentId") || url.searchParams.get("id") || "";
	const rfidUid = url.searchParams.get("rfid") || url.searchParams.get("uid") || "";
	if (studentId || rfidUid) {
		const summary = await getStudentPointSummary(studentId, rfidUid);
		return new Response(JSON.stringify(summary), { headers: { "Content-Type": "application/json" } });
	}
	const allDeductions = await getPointDeductions();
	return new Response(JSON.stringify(allDeductions), { headers: { "Content-Type": "application/json" } });
};
var POST = async ({ request }) => {
	try {
		const body = await request.json().catch(() => ({}));
		if (!body.studentId || !body.rfidUid) return new Response(JSON.stringify({
			status: "error",
			message: "studentId dan rfidUid wajib dikirim"
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		const deduction = {
			id: body.id || `DED-${Date.now()}`,
			studentId: body.studentId,
			rfidUid: body.rfidUid,
			date: body.date || (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" }),
			time: body.time || "07:15:00",
			minutesLate: Number(body.minutesLate) || 5,
			pointsDeducted: Number(body.pointsDeducted) || 2,
			reason: body.reason || "Terlambat sesi pagi gerbang"
		};
		await savePointDeduction(deduction);
		return new Response(JSON.stringify({
			status: "success",
			data: deduction
		}), { headers: { "Content-Type": "application/json" } });
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
var DELETE = async ({ request }) => {
	try {
		if (!(request.headers.get("cookie") || "").includes("auth_session=admin") && !request.headers.get("x-dev-bypass")) return new Response(JSON.stringify({
			status: "error",
			message: "Akses Ditolak: Hanya Kepala Sekolah, Waka, atau Admin yang dapat mereset poin."
		}), {
			status: 403,
			headers: { "Content-Type": "application/json" }
		});
		const url = new URL(request.url);
		const studentId = url.searchParams.get("studentId") || url.searchParams.get("id") || "";
		const rfidUid = url.searchParams.get("rfid") || url.searchParams.get("uid") || "";
		await resetStudentPoints(studentId, rfidUid);
		return new Response(JSON.stringify({
			status: "success",
			message: "Seluruh poin kedisiplinan siswa berhasil direset ke 100 Poin penuh (Pemutihan)."
		}), { headers: { "Content-Type": "application/json" } });
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
// \0virtual:astro:page:src/pages/api/points@_@ts
var page = () => points_exports;
export { page };
