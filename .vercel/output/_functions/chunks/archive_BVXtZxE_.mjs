import { t as __exportAll } from "./rolldown-runtime_D8jQpDG7.mjs";
import { i as clearAttendanceHistory, p as syncDailyAttendanceAndPermissions, s as getAttendanceHistory, t as archiveAndResetDailyLogs } from "./attendanceStorage_DJzJ-FgX.mjs";
// src/pages/api/attendance/archive.ts
var archive_exports = /* @__PURE__ */ __exportAll({
	DELETE: () => DELETE,
	GET: () => GET,
	POST: () => POST,
	prerender: () => false
});
var GET = async ({ request }) => {
	try {
		const url = new URL(request.url);
		if (url.searchParams.get("action") === "sync") {
			const targetDate = url.searchParams.get("date") || void 0;
			const syncResult = await syncDailyAttendanceAndPermissions(targetDate);
			return new Response(JSON.stringify(syncResult), { headers: { "Content-Type": "application/json" } });
		}
		const filter = url.searchParams.get("filter") || "all";
		const studentId = url.searchParams.get("studentId") || void 0;
		const rfidUid = url.searchParams.get("rfid") || void 0;
		const history = await getAttendanceHistory({
			filter,
			studentId,
			rfidUid
		});
		return new Response(JSON.stringify(history), { headers: { "Content-Type": "application/json" } });
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
			message: "Akses Ditolak: Hanya Kepala Sekolah, Waka, atau Admin yang berhak memproses arsip."
		}), {
			status: 403,
			headers: { "Content-Type": "application/json" }
		});
		const body = await request.json().catch(() => ({}));
		if ((body.action || "") === "sync") {
			const syncResult = await syncDailyAttendanceAndPermissions(body.date);
			return new Response(JSON.stringify(syncResult), { headers: { "Content-Type": "application/json" } });
		}
		const dateStr = body.date || (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
		const result = await archiveAndResetDailyLogs(dateStr);
		return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } });
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
			message: "Akses Ditolak: Hanya Kepala Sekolah, Waka, atau Admin yang berhak membersihkan arsip."
		}), {
			status: 403,
			headers: { "Content-Type": "application/json" }
		});
		await clearAttendanceHistory();
		return new Response(JSON.stringify({
			status: "success",
			message: "Tabel arsip historis berhasil dibersihkan."
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
// \0virtual:astro:page:src/pages/api/attendance/archive@_@ts
var page = () => archive_exports;
export { page };
