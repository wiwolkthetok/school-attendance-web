import { t as __exportAll } from "./rolldown-runtime_D8jQpDG7.mjs";
import { n as initCronWorker, r as runCronNow, t as getCronStatus } from "./cronWorker_Cb4S-O9s.mjs";
// src/pages/api/attendance/cron-status.ts
var cron_status_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	POST: () => POST,
	prerender: () => false
});
var GET = async () => {
	initCronWorker();
	const status = getCronStatus();
	return new Response(JSON.stringify(status), { headers: { "Content-Type": "application/json" } });
};
var POST = async ({ request }) => {
	try {
		const body = await request.json().catch(() => ({}));
		const result = await runCronNow(body.date);
		return new Response(JSON.stringify({
			status: "success",
			data: result,
			cron: getCronStatus()
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
// \0virtual:astro:page:src/pages/api/attendance/cron-status@_@ts
var page = () => cron_status_exports;
export { page };
