import { t as __exportAll } from "./rolldown-runtime_D8jQpDG7.mjs";
import { n as checkAndApplyAlpa } from "./attendanceStorage_DJzJ-FgX.mjs";
// src/pages/api/attendance/alpa.ts
var alpa_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var POST = async ({ request }) => {
	try {
		const dateStr = (await request.json().catch(() => ({}))).date || (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
		const result = await checkAndApplyAlpa(dateStr);
		return new Response(JSON.stringify({
			status: "success",
			message: `Evaluasi Alpa selesai: ${result.alpaCount} siswa dicatat Alpa.`,
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
// \0virtual:astro:page:src/pages/api/attendance/alpa@_@ts
var page = () => alpa_exports;
export { page };
