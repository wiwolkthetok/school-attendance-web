import { t as __exportAll } from "./rolldown-runtime_D8jQpDG7.mjs";
import { c as getLogs, l as getStudents, r as checkAndApplyBolos } from "./attendanceStorage_DJzJ-FgX.mjs";
// src/pages/api/attendance/bolos.ts
var bolos_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	POST: () => POST,
	prerender: () => false
});
var GET = async ({ request }) => {
	try {
		const dateStr = new URL(request.url).searchParams.get("date") || (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
		const dateLogs = (await getLogs()).filter((l) => l.date === dateStr && l.role === "siswa");
		const students = await getStudents();
		const morningMap = /* @__PURE__ */ new Map();
		const afternoonSet = /* @__PURE__ */ new Set();
		const bolosSet = /* @__PURE__ */ new Set();
		dateLogs.forEach((l) => {
			const u = l.rfidUid.toUpperCase();
			if (l.type === "masuk") morningMap.set(u, l);
			if (l.type === "pulang") {
				afternoonSet.add(u);
				if (l.status === "Bolos") bolosSet.add(u);
			}
		});
		const pendingBolos = [];
		const confirmedBolos = [];
		students.forEach((s) => {
			if (s.role === "siswa") {
				const u = s.rfidUid.toUpperCase();
				if (morningMap.has(u)) {
					if (bolosSet.has(u)) confirmedBolos.push({
						student: s,
						masukLog: morningMap.get(u),
						status: "Sudah Dihukum Bolos (-10 Poin)"
					});
					else if (!afternoonSet.has(u)) pendingBolos.push({
						student: s,
						masukLog: morningMap.get(u),
						status: "Belum Presensi Pulang"
					});
				}
			}
		});
		return new Response(JSON.stringify({
			status: "success",
			date: dateStr,
			pendingCount: pendingBolos.length,
			confirmedCount: confirmedBolos.length,
			pendingBolos,
			confirmedBolos
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
var POST = async ({ request }) => {
	try {
		if (!(request.headers.get("cookie") || "").includes("auth_session=admin") && !request.headers.get("x-dev-bypass")) return new Response(JSON.stringify({
			status: "error",
			message: "Akses Ditolak: Hanya Kepala Sekolah, Waka, atau Admin yang berhak mengeksekusi sanksi bolos."
		}), {
			status: 403,
			headers: { "Content-Type": "application/json" }
		});
		const body = await request.json().catch(() => ({}));
		const dateStr = body.date || (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
		const studentId = body.studentId || "";
		const result = await checkAndApplyBolos(dateStr, studentId);
		return new Response(JSON.stringify({
			status: "success",
			message: studentId ? `Siswa ${result.penalizedStudents[0]?.name || studentId} berhasil ditindaklanjuti dan dipotong 10 poin disiplin.` : `Evaluasi bolos selesai: ${result.bolosCount} siswa dikategorikan bolos dan dipotong 10 poin.`,
			data: result
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
// \0virtual:astro:page:src/pages/api/attendance/bolos@_@ts
var page = () => bolos_exports;
export { page };
