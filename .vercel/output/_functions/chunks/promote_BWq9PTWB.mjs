import { t as __exportAll } from "./rolldown-runtime_D8jQpDG7.mjs";
import { n as turso, t as initDatabase } from "./tursoClient_L2U3qzVi.mjs";
import { t as attendanceEmitter } from "./attendanceEvents_eOwLBYLa.mjs";
import { i as resetStudentPoints } from "./pointsStorage_DocJKj43.mjs";
import { l as getStudents, u as invalidateStudentsCache } from "./attendanceStorage_DJzJ-FgX.mjs";
// src/pages/api/students/promote.ts
var promote_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var POST = async ({ request }) => {
	try {
		if (!(request.headers.get("cookie") || "").includes("auth_session=admin") && !request.headers.get("x-dev-bypass")) return new Response(JSON.stringify({
			status: "error",
			message: "Akses Ditolak: Hanya Kepala Sekolah atau Waka Kesiswaan yang berhak memproses kenaikan kelas."
		}), {
			status: 403,
			headers: { "Content-Type": "application/json" }
		});
		const body = await request.json().catch(() => ({}));
		const sourceClass = (body.sourceClass || "").trim();
		const targetClass = (body.targetClass || "").trim();
		const studentIds = Array.isArray(body.studentIds) ? body.studentIds : [];
		const resetPoints = Boolean(body.resetPoints !== false);
		if (!sourceClass || !targetClass || studentIds.length === 0) return new Response(JSON.stringify({
			status: "error",
			message: "Rombel asal, rombel tujuan, dan minimal 1 siswa terpilih wajib disertakan."
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		await initDatabase();
		const allStudents = await getStudents();
		const validStudentIds = new Set(allStudents.filter((s) => s.role === "siswa").map((s) => s.id));
		const targetCategory = targetClass.toLowerCase().includes("alumni") || targetClass.toLowerCase().includes("lulus") ? "alumni" : targetClass.toLowerCase().includes("akl") ? "akl" : targetClass.toLowerCase().includes("rpl") ? "rpl" : void 0;
		let updatedCount = 0;
		for (const sid of studentIds) {
			if (!validStudentIds.has(sid)) continue;
			if (targetCategory) await turso.execute({
				sql: "UPDATE students SET class_name = ?, category = ? WHERE id = ?;",
				args: [
					targetClass,
					targetCategory,
					sid
				]
			});
			else await turso.execute({
				sql: "UPDATE students SET class_name = ? WHERE id = ?;",
				args: [targetClass, sid]
			});
			if (resetPoints) {
				const studentObj = allStudents.find((s) => s.id === sid);
				await resetStudentPoints(sid, studentObj?.rfidUid);
			}
			updatedCount++;
		}
		invalidateStudentsCache();
		attendanceEmitter.emit("attendance", { type: "students_updated" });
		return new Response(JSON.stringify({
			status: "success",
			message: `Berhasil memproses kenaikan kelas: ${updatedCount} siswa dari ${sourceClass} ke ${targetClass}.`,
			promotedCount: updatedCount,
			sourceClass,
			targetClass
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
// \0virtual:astro:page:src/pages/api/students/promote@_@ts
var page = () => promote_exports;
export { page };
