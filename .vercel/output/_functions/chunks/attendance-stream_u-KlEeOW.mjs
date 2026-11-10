import { t as __exportAll } from "./rolldown-runtime_D8jQpDG7.mjs";
import { t as attendanceEmitter } from "./attendanceEvents_eOwLBYLa.mjs";
// src/pages/api/attendance-stream.ts
var attendance_stream_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	prerender: () => false
});
var GET = async ({ request }) => {
	let onAttendance;
	const stream = new ReadableStream({
		start(controller) {
			controller.enqueue(new TextEncoder().encode(`event: connected\ndata: "connected"\n\n`));
			onAttendance = (data) => {
				try {
					const payload = `event: attendance\ndata: ${JSON.stringify(data)}\n\n`;
					controller.enqueue(new TextEncoder().encode(payload));
				} catch {}
			};
			attendanceEmitter.on("attendance", onAttendance);
		},
		cancel() {
			if (onAttendance) attendanceEmitter.off("attendance", onAttendance);
		}
	});
	return new Response(stream, { headers: {
		"Content-Type": "text/event-stream",
		"Cache-Control": "no-cache, no-transform",
		"Connection": "keep-alive"
	} });
};
// \0virtual:astro:page:src/pages/api/attendance-stream@_@ts
var page = () => attendance_stream_exports;
export { page };
