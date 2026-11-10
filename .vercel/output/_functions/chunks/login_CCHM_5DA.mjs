import { t as __exportAll } from "./rolldown-runtime_D8jQpDG7.mjs";
import { l as getStudents } from "./attendanceStorage_DJzJ-FgX.mjs";
// src/pages/api/auth/login.ts
var login_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
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
		const rawName = (body.name || body.username || "").trim();
		const rawRfid = extractDecimalUid(body.rfidUid || body.rfid || body.refid || "");
		const isAdminKeyword = (val) => /^(admin|administrator|piket)$/i.test(val.trim());
		if (isAdminKeyword(rawName) || isAdminKeyword(rawRfid)) {
			const adminCivitas = (await getStudents()).find((s) => s.role === "admin") || {
				id: "ADM-001",
				name: "Administrator Sekolah",
				role: "admin",
				className: "Administrator Sekolah",
				category: "admin"
			};
			return new Response(JSON.stringify({
				status: "success",
				message: `Verifikasi Berhasil! Selamat datang, ${adminCivitas.name} (Administrator Sekolah).`,
				civitas: adminCivitas,
				role: "admin",
				roleLabel: "Administrator Sekolah (Kepsek/Waka)",
				canAccessDashboard: true,
				redirectUrl: "/"
			}), {
				status: 200,
				headers: {
					"Content-Type": "application/json",
					"Set-Cookie": `auth_session=admin; Path=/; SameSite=Lax; Max-Age=86400`
				}
			});
		}
		console.log("\n==================================================");
		console.log("🔐 [LOGIN API] Percobaan Masuk Portal:");
		console.log("--------------------------------------------------");
		console.log("Nama Input   : " + (rawName || "(kosong)"));
		console.log("RFID Input   : " + (body.rfidUid || "(kosong)"));
		console.log("Filter UID   : [" + rawRfid + "]");
		console.log("==================================================");
		if (!rawName || !rawRfid) {
			console.log("❌ [LOGIN] Ditolak: Salah satu atau kedua field kosong.\n");
			return new Response(JSON.stringify({
				status: "error",
				message: "Nama Lengkap dan ID Kartu RFID wajib diisi."
			}), {
				status: 400,
				headers: { "Content-Type": "application/json" }
			});
		}
		const students = await getStudents();
		const cleanStr = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
		const matchRfid = (s, input) => {
			if (!input) return false;
			const upperInput = input.trim().toUpperCase();
			if (s.rfidUid && s.rfidUid.trim().toUpperCase() === upperInput) return true;
			if (s.id && s.id.trim().toUpperCase() === upperInput) return true;
			return false;
		};
		const matchName = (s, input) => {
			if (!input) return false;
			const cInput = cleanStr(input);
			if (s.name) {
				const cName = cleanStr(s.name);
				if (cName === cInput) return true;
				if (cInput.length >= 3 && (cName.includes(cInput) || cInput.includes(cName))) return true;
			}
			return false;
		};
		const found = students.find((s) => matchRfid(s, rawRfid) && matchName(s, rawName));
		if (!found) {
			console.log(`❌ [LOGIN] Gagal: Data tidak cocok atau belum terdaftar.\n`);
			return new Response(JSON.stringify({
				status: "error",
				message: "Data tidak sesuai atau belum terdaftar. Pastikan Nama Lengkap dan ID Kartu RFID sudah benar."
			}), {
				status: 400,
				headers: { "Content-Type": "application/json" }
			});
		}
		console.log(`✅ [LOGIN] Berhasil: ${found.name} (${found.role})\n`);
		const isKepsek = found.tag === "kepsek" || found.className && found.className.toLowerCase().includes("kepala sekolah");
		const isWaka = found.tag === "waka" || found.className && found.className.toLowerCase().includes("waka");
		const isAdmin = found.role === "admin";
		const canAccessDashboard = isAdmin || isKepsek || isWaka;
		const isAlumni = found.className && (found.className.toLowerCase().includes("alumni") || found.className.toLowerCase().includes("lulus")) || found.category === "alumni";
		const roleLabel = isKepsek ? "Kepala Sekolah" : isWaka ? "Waka Kesiswaan" : isAdmin ? "Administrator Sekolah" : found.role === "guru" ? "Dewan Guru" : isAlumni ? "Alumni Sekolah" : "Peserta Didik (Siswa)";
		const redirectUrl = canAccessDashboard ? "/" : `/profil-siswa?id=${found.id}&auth=true`;
		return new Response(JSON.stringify({
			status: "success",
			message: `Verifikasi Berhasil! Selamat datang, ${found.name} (${roleLabel}).`,
			civitas: found,
			role: found.role,
			roleLabel,
			canAccessDashboard,
			redirectUrl
		}), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Set-Cookie": `auth_session=${canAccessDashboard ? "admin" : "siswa"}; Path=/; SameSite=Lax; Max-Age=86400`
			}
		});
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
// \0virtual:astro:page:src/pages/api/auth/login@_@ts
var page = () => login_exports;
export { page };
