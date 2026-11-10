import { t as __exportAll } from "./rolldown-runtime_D8jQpDG7.mjs";
import { a as saveSettings, n as getSettings, r as resetSettings } from "./settingsStorage_DKBhOGrx.mjs";
// src/pages/api/settings.ts
var settings_exports = /* @__PURE__ */ __exportAll({
	DELETE: () => DELETE,
	GET: () => GET,
	POST: () => POST,
	prerender: () => false
});
var GET = async () => {
	const settings = await getSettings();
	return new Response(JSON.stringify(settings), { headers: { "Content-Type": "application/json" } });
};
var POST = async ({ request }) => {
	try {
		const body = await request.json().catch(() => ({}));
		const updated = await saveSettings(body);
		return new Response(JSON.stringify({
			status: "success",
			message: "Pengaturan berhasil diperbarui",
			data: updated
		}), { headers: { "Content-Type": "application/json" } });
	} catch (err) {
		return new Response(JSON.stringify({
			status: "error",
			message: err?.message || "Gagal menyimpan pengaturan"
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
var DELETE = async () => {
	const defaults = await resetSettings();
	return new Response(JSON.stringify({
		status: "success",
		message: "Pengaturan berhasil direset ke default",
		data: defaults
	}), { headers: { "Content-Type": "application/json" } });
};
// \0virtual:astro:page:src/pages/api/settings@_@ts
var page = () => settings_exports;
export { page };
