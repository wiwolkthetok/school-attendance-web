import { A as renderHead, C as renderComponent, O as renderTemplate, T as renderSlot, j as addAttribute, k as maybeRenderHead } from "./sequence_DrwEd3A2.mjs";
import { n as renderScript, r as createComponent, t as $$PwaMeta } from "./global_BUUc7XjC.mjs";
import { t as createAstro } from "./astro-global_vzXxOLPh.mjs";
import "./compiler_f12fCyC4.mjs";
// src/components/Sidebar.astro
createAstro("https://astro.build");
var $$Sidebar = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Sidebar;
	const { activeNav = "data-presensi" } = Astro.props;
	const isGuruSession = Astro.cookies.get("auth_session")?.value === "guru";
	return renderTemplate`${maybeRenderHead($$result)}<!-- ================================================================================================================================
komponen penting buat nampilin icon
<!-- =============================================================================================================================================== --><aside class="hidden md:flex md:w-64 lg:w-72 bg-gradient-to-b from-[#1e3a8a] via-[#1d4ed8] to-[#1e40af] text-blue-100 flex-col justify-between shrink-0 select-none shadow-xl border-r border-blue-900/40 overflow-y-auto min-h-screen md:min-h-[920px]" aria-label="Sidebar Navigasi Presensi"><div class="flex flex-col"><!-- Brand Logo / Badge --><div class="p-6 pb-5 flex items-center justify-between border-b border-white/10"><a href="/" class="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-white/50 rounded-xl p-1 transition-all duration-200"><div class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg text-white font-extrabold group-hover:scale-105 transition-transform duration-200"><span class="material-symbols-outlined text-[10px]">Book_6 </span></div><div><h1 class="text-white font-[HolidayTogether] text-4xl tracking-tight leading-none flex items-center gap-1.5">SMART ABSEN</h1></div></a></div><!-- Navigation Menu Items --><nav class="mt-4 px-3 space-y-1.5" aria-label="Menu Utama Presensi">${[
		{
			id: "data-presensi",
			label: "Data Presensi",
			href: "/",
			icon: "dashboard",
			adminOnly: true
		},
		{
			id: "jadwal-agenda",
			label: "Jadwal & Agenda",
			href: "/jadwal",
			icon: "calendar",
			adminOnly: false
		},
		{
			id: "izin-dispensasi",
			label: "Kelola Izin & Dispensasi",
			href: "/izin-dispensasi",
			icon: "document",
			adminOnly: true
		},
		{
			id: "siswa-guru",
			label: "Data Siswa",
			href: "/siswa-guru",
			icon: "users",
			adminOnly: true
		},
		{
			id: "rekap",
			label: "Rekapitulasi & PDF",
			href: "/rekapitulasi",
			icon: "report",
			adminOnly: true
		},
		{
			id: "login",
			label: "Portal Login Siswa",
			href: "/login",
			icon: "login",
			adminOnly: false
		}
	].map((item) => {
		const isActive = activeNav === item.id;
		const isHidden = isGuruSession && item.adminOnly;
		return renderTemplate`<a${addAttribute(item.href, "href")}${addAttribute(`sidebar-link-${item.id}`, "id")}${addAttribute(item.adminOnly ? "true" : void 0, "data-admin-only")}${addAttribute(`nav-item ${isHidden ? "hidden" : "flex"} items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all duration-200 ease-in-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/60 ${isActive ? "bg-white text-blue-900 font-bold shadow-lg shadow-blue-950/25 border-l-4 border-indigo-700 translate-x-1" : "text-blue-100/80 hover:text-white hover:bg-white/15 hover:translate-x-0.5"}`, "class")}${addAttribute(isActive ? "page" : void 0, "aria-current")}><div class="flex items-center gap-3">${item.icon === "dashboard" && renderTemplate`<svg${addAttribute(`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-blue-700" : "text-blue-200"}`, "class")} fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path></svg>`}${item.icon === "calendar" && renderTemplate`<svg${addAttribute(`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-blue-700" : "text-blue-200"}`, "class")} fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect height="18" rx="2" ry="2" width="18" x="3" y="4"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>`}${item.icon === "document" && renderTemplate`<svg${addAttribute(`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-blue-700" : "text-blue-200"}`, "class")} fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-linecap="round" stroke-linejoin="round"></path></svg>`}${item.icon === "users" && renderTemplate`<svg${addAttribute(`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-blue-700" : "text-blue-200"}`, "class")} fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 00-3-3.87"></path><path d="M16 3.13a4 4 0 010 7.75"></path></svg>`}${item.icon === "report" && renderTemplate`<svg${addAttribute(`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-blue-700" : "text-blue-200"}`, "class")} fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" x2="8" y1="13" y2="13"></line><line x1="16" x2="8" y1="17" y2="17"></line></svg>`}${item.icon === "login" && renderTemplate`<span${addAttribute(`material-symbols-outlined text-base ${isActive ? "text-blue-700" : "text-blue-200"}`, "class")}>login</span>`}<span class="tracking-tight">${item.label}</span></div><div class="flex items-center gap-1.5"${addAttribute(`sidebar-badge-${item.id}`, "id")}>${isActive && renderTemplate`<span class="w-2 h-2 rounded-full bg-blue-600 shadow-sm" aria-hidden="true"></span>`}</div></a>`;
	})}<!-- Divider: Konfigurasi --><div id="sidebar-divider-konfigurasi"${addAttribute(`pt-5 pb-1 px-3 ${isGuruSession ? "hidden" : "block"}`, "class")}><span class="text-[10px] uppercase font-bold tracking-wider text-blue-200/70">Konfigurasi Sistem</span></div><a href="/pengaturan" id="sidebar-link-pengaturan" data-admin-only="true"${addAttribute(`nav-item ${isGuruSession ? "hidden" : "flex"} items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all duration-200 ease-in-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/60 ${activeNav === "pengaturan" ? "bg-white text-blue-900 font-bold shadow-lg shadow-blue-950/25 border-l-4 border-indigo-700 translate-x-1" : "text-blue-100/80 hover:text-white hover:bg-white/15 hover:translate-x-0.5"}`, "class")}${addAttribute(activeNav === "pengaturan" ? "page" : void 0, "aria-current")}><div class="flex items-center gap-3"><svg${addAttribute(`w-4 h-4 shrink-0 transition-colors ${activeNav === "pengaturan" ? "text-blue-700" : "text-blue-200"}`, "class")} fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path></svg><span class="tracking-tight">Pengaturan Sistem</span></div><div class="flex items-center gap-1.5" id="sidebar-badge-pengaturan">${activeNav === "pengaturan" && renderTemplate`<span class="w-2 h-2 rounded-full bg-blue-600 shadow-sm" aria-hidden="true"></span>`}</div></a></nav></div><!-- Sidebar Bottom Profile Badge --><div class="p-4 m-3 mt-6 rounded-2xl bg-blue-900/70 border border-blue-400/40 backdrop-blur-md flex items-center justify-between shadow-md"><a href="/profil-siswa" id="sidebar-profile-link" class="flex items-center gap-3 cursor-pointer group"><div class="relative"><div id="sidebar-user-avatar" class="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-black text-xs flex items-center justify-center ring-2 ring-blue-400/50 shadow-inner group-hover:scale-105 transition-transform">AP</div><span class="w-2.5 h-2.5 bg-emerald-400 border-2 border-[#161a29] rounded-full absolute bottom-0 right-0" title="Online Aktif"></span></div><div><h4 id="sidebar-user-name" class="text-xs font-bold text-white leading-tight group-hover:text-amber-300 transition-colors">Admin Piket</h4><p id="sidebar-user-role" class="text-[10px] text-blue-200">Petugas Sesi Pagi</p></div></a></div></aside>${renderScript($$result, "/home/ubuntu/school-attendance-web/src/components/Sidebar.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/ubuntu/school-attendance-web/src/components/Sidebar.astro", void 0);
// src/components/Navbar.astro
createAstro("https://astro.build");
var $$Navbar = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Navbar;
	const { title } = Astro.props;
	return renderTemplate`<!-- ================================================================================================================================
komponen penting buat nampilin icon
================================================================================================================================ --><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet"><!-- =============================================================================================================================================== -->${maybeRenderHead($$result)}<header class="h-14 sm:h-16 px-3.5 sm:px-8 border-b border-slate-200/90 bg-white/80 backdrop-blur-md flex items-center justify-between shrink-0 sticky top-0 z-30 transition-all duration-200"><!-- Left: Breadcrumb / Title --><nav class="flex items-center gap-1.5 sm:gap-2.5 text-xs font-medium text-slate-500 min-w-0" aria-label="Breadcrumb"><a id="navbar-breadcrumb-link" href="/" class="hover:text-blue-600 transition-colors duration-200 shrink-0">Dashboard</a><span class="text-slate-300 shrink-0" aria-hidden="true">/</span><h2 class="text-xs sm:text-sm font-bold text-slate-900 tracking-tight truncate max-w-[120px] xs:max-w-[180px] sm:max-w-none">${title}</h2></nav><!-- Right: Live Clock, Status, Notification, Calendar --><div class="flex items-center gap-2 sm:gap-4 shrink-0"><!-- Live WIB Clock Widget with countdown to reset --><div class="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-slate-100/90 border border-slate-200 text-slate-700 text-xs font-mono font-medium shadow-xs"><span class="material-symbols-outlined text-[10px]"> Schedule </span><span class="tracking-wide font-bold text-slate-800" id="liveClockDisplay">12:00:00 WIB</span><span class="text-[10px] text-slate-500 border-l border-slate-300 pl-2 font-sans font-semibold" id="resetCountdown" title="Waktu otomatis reset harian sistem pukul 23:00">Reset dlm 11j 0m</span></div><!-- Notification Bell with Pending Counter --><div class="relative"><button class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 active:scale-95" title="Notifikasi Absen Tertunda" aria-label="5 notifikasi absensi belum diverifikasi"><span class="material-symbols-outlined text-sm sm:text-base">notifications</span></button><span class="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">5</span></div><!-- Calendar Pill Button --><div class="hidden sm:block relative pl-1 sm:pl-2 sm:border-l border-slate-200"><div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 shadow-xs select-none transition-all duration-200"><div class="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-[10px]">Calendar_Month</span></div><div class="flex flex-col text-left leading-none"><span id="navbar-date-display" class="text-[11px] font-bold text-slate-800">Jumat, 30 Okt 2026</span><span class="text-[9px] text-slate-500 font-medium mt-0.5">Minggu Efektif KBM</span></div></div></div><!-- Tombol Pasang Aplikasi PWA (Muncul otomatis jika belum terpasang di Linux/Mac/Win/Android) --><div class="relative pl-1 sm:pl-2 sm:border-l border-slate-200 hidden" id="navbar-pwa-container"><button id="btn-pwa-install-nav" type="button" onclick="window.installPwa()" class="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95" title="Pasang aplikasi di perangkat ini"><span class="material-symbols-outlined text-sm text-blue-600">install_desktop</span><span class="hidden md:inline">Pasang Aplikasi</span></button></div><!-- Login Portal Civitas / Green Logout Button --><div class="relative pl-1 sm:pl-2 sm:border-l border-slate-200 flex items-center gap-1.5" id="navbar-auth-container"><a id="navbar-login-btn" href="/login" class="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all duration-200 active:scale-95"><span class="material-symbols-outlined text-sm">login</span><span id="navbar-login-text" class="hidden xs:inline">Login</span></a><!-- Tombol Logout Warna Hijau di Navbar Sebelah Kanan --><button id="navbar-logout-btn" type="button" class="hidden items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95" title="Klik untuk Logout / Keluar"><span class="material-symbols-outlined text-sm">logout</span><span id="navbar-logout-text" class="hidden xs:inline">Logout</span></button></div></div></header>${renderScript($$result, "/home/ubuntu/school-attendance-web/src/components/Navbar.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/ubuntu/school-attendance-web/src/components/Navbar.astro", void 0);
// src/components/BottomNav.astro
createAstro("https://astro.build");
var $$BottomNav = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$BottomNav;
	const { activeNav = "data-presensi" } = Astro.props;
	const page1Items = [
		{
			id: "data-presensi",
			label: "Presensi",
			href: "/",
			icon: "dashboard"
		},
		{
			id: "jadwal-agenda",
			label: "Jadwal",
			href: "/jadwal",
			icon: "calendar_month"
		},
		{
			id: "izin-dispensasi",
			label: "Izin",
			href: "/izin-dispensasi",
			icon: "description"
		},
		{
			id: "siswa-guru",
			label: "Siswa",
			href: "/siswa-guru",
			icon: "group"
		}
	];
	const page2Items = [
		{
			id: "rekap",
			label: "Rekap",
			href: "/rekapitulasi",
			icon: "analytics"
		},
		{
			id: "pengaturan",
			label: "Pengaturan",
			href: "/pengaturan",
			icon: "settings"
		},
		{
			id: "profil-siswa",
			label: "Profil",
			href: "/profil-siswa",
			icon: "account_circle"
		},
		{
			id: "logout",
			label: "Keluar",
			href: "#logout",
			icon: "logout",
			isLogout: true
		}
	];
	const isPage2Active = [
		"rekap",
		"pengaturan",
		"profil-siswa"
	].includes(activeNav);
	const page1ActiveIndex = page1Items.findIndex((item) => item.id === activeNav);
	const page2ActiveIndex = page2Items.findIndex((item) => item.id === activeNav);
	return renderTemplate`${maybeRenderHead($$result)}<nav aria-label="Navigasi Bawah Mobile" class="fixed bottom-0 inset-x-0 z-40 w-full bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] md:hidden select-none safe-bottom transition-all duration-200 touch-manipulation" id="bottom-nav-root" data-astro-cid-dlrkusbo><!-- Mini Header: Indikator Pager & Tombol Swap Cepat --><div class="flex items-center justify-between px-4 pt-1.5 pb-0.5 border-b border-slate-100/70" data-astro-cid-dlrkusbo><button type="button" id="bnav-btn-prev" class="text-[10px] font-bold text-slate-400 hover:text-blue-600 transition flex items-center gap-0.5 cursor-pointer py-0.5 active:scale-95" aria-label="Swap ke Menu 1" data-astro-cid-dlrkusbo><span class="material-symbols-outlined text-[13px]" data-astro-cid-dlrkusbo>chevron_left</span><span data-astro-cid-dlrkusbo>Menu 1</span></button><!-- Pager Dots Indicator (Bisa Diklik Langsung untuk Swap Animasi) --><div class="flex items-center gap-1.5 cursor-pointer py-0.5 px-2" id="bnav-dots-container" title="Geser atau klik untuk ganti menu" data-astro-cid-dlrkusbo><button type="button" id="bnav-dot-1" aria-label="Menu Halaman 1"${addAttribute(`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${!isPage2Active ? "w-6 bg-blue-600 shadow-xs" : "w-2 bg-slate-300 hover:bg-slate-400"}`, "class")} data-astro-cid-dlrkusbo></button><button type="button" id="bnav-dot-2" aria-label="Menu Halaman 2"${addAttribute(`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${isPage2Active ? "w-6 bg-blue-600 shadow-xs" : "w-2 bg-slate-300 hover:bg-slate-400"}`, "class")} data-astro-cid-dlrkusbo></button></div><button type="button" id="bnav-btn-next" class="text-[10px] font-bold text-slate-400 hover:text-blue-600 transition flex items-center gap-0.5 cursor-pointer py-0.5 active:scale-95" aria-label="Swap ke Menu 2" data-astro-cid-dlrkusbo><span data-astro-cid-dlrkusbo>Menu 2</span><span class="material-symbols-outlined text-[13px]" data-astro-cid-dlrkusbo>chevron_right</span></button></div><!-- Pager Viewport (Smooth CSS Transform Slider) --><div class="relative overflow-hidden w-full" id="bnav-pager-viewport" data-astro-cid-dlrkusbo><div class="flex w-[200%] will-change-transform" id="bnav-pages-slider"${addAttribute(`transform: translateX(${isPage2Active ? "-50%" : "0%"});`, "style")} data-astro-cid-dlrkusbo><!-- HALAMAN 1 (4 Tombol: Presensi, Jadwal, Izin, Siswa) --><div class="w-1/2 shrink-0 grid grid-cols-4 items-center px-1 py-1 relative" id="bnav-page-1" data-astro-cid-dlrkusbo><!-- Sliding Blue Pill (Lingkaran Berpindah Halus) --><div id="bnav-pill-1"${addAttribute(`bnav-sliding-pill ${page1ActiveIndex !== -1 ? "opacity-100" : "opacity-0"}`, "class")}${addAttribute(`left: calc(${page1ActiveIndex !== -1 ? page1ActiveIndex * 25 + 12.5 : 12.5}% - 18px);`, "style")} data-astro-cid-dlrkusbo></div>${page1Items.map((item, idx) => {
		const isActive = activeNav === item.id;
		return renderTemplate`<a${addAttribute(item.href, "href")} data-page="1"${addAttribute(idx, "data-index")} data-astro-prefetch="load" class="bnav-btn flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 active:scale-95 group relative z-10 touch-manipulation cursor-pointer"${addAttribute(isActive ? "page" : void 0, "aria-current")} data-astro-cid-dlrkusbo><!-- Icon Container --><div${addAttribute(`bnav-icon-box w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-300 ease-out ${isActive ? "text-white -translate-y-1.5" : "text-slate-400 group-hover:text-slate-700 translate-y-0"}`, "class")} data-astro-cid-dlrkusbo><span class="material-symbols-outlined text-[20px]" data-astro-cid-dlrkusbo>${item.icon}</span></div><!-- Label Menu Ringkas --><span${addAttribute(`bnav-label text-[10px] tracking-tight leading-tight transition-all duration-200 whitespace-nowrap ${isActive ? "text-blue-600 font-bold -translate-y-0.5" : "text-slate-400 font-medium translate-y-0"}`, "class")} data-astro-cid-dlrkusbo>${item.label}</span></a>`;
	})}</div><!-- HALAMAN 2 (4 Tombol: Rekap, Pengaturan, Profil, Logout) --><div class="w-1/2 shrink-0 grid grid-cols-4 items-center px-1 py-1 relative" id="bnav-page-2" data-astro-cid-dlrkusbo><!-- Sliding Blue Pill (Lingkaran Berpindah Halus) --><div id="bnav-pill-2"${addAttribute(`bnav-sliding-pill ${page2ActiveIndex !== -1 ? "opacity-100" : "opacity-0"}`, "class")}${addAttribute(`left: calc(${page2ActiveIndex !== -1 ? page2ActiveIndex * 25 + 12.5 : 12.5}% - 18px);`, "style")} data-astro-cid-dlrkusbo></div>${page2Items.map((item, idx) => {
		const isActive = activeNav === item.id;
		if (item.isLogout) return renderTemplate`<button type="button" id="bnav-logout-btn" class="bnav-btn flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 active:scale-95 group relative z-10 cursor-pointer touch-manipulation" title="Keluar dari Aplikasi" data-astro-cid-dlrkusbo><div class="bnav-icon-box w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-300 ease-out text-rose-500 group-hover:bg-rose-50 translate-y-0" data-astro-cid-dlrkusbo><span class="material-symbols-outlined text-[20px]" data-astro-cid-dlrkusbo>${item.icon}</span></div><span class="bnav-label text-[10px] tracking-tight leading-tight whitespace-nowrap font-bold text-rose-500" data-astro-cid-dlrkusbo>${item.label}</span></button>`;
		return renderTemplate`<a${addAttribute(item.href, "href")} data-page="2"${addAttribute(idx, "data-index")} data-astro-prefetch="load" class="bnav-btn flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 active:scale-95 group relative z-10 touch-manipulation cursor-pointer"${addAttribute(isActive ? "page" : void 0, "aria-current")} data-astro-cid-dlrkusbo><!-- Icon Container --><div${addAttribute(`bnav-icon-box w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-300 ease-out ${isActive ? "text-white -translate-y-1.5" : "text-slate-400 group-hover:text-slate-700 translate-y-0"}`, "class")} data-astro-cid-dlrkusbo><span class="material-symbols-outlined text-[20px]" data-astro-cid-dlrkusbo>${item.icon}</span></div><!-- Label Menu Ringkas --><span${addAttribute(`bnav-label text-[10px] tracking-tight leading-tight transition-all duration-200 whitespace-nowrap ${isActive ? "text-blue-600 font-bold -translate-y-0.5" : "text-slate-400 font-medium translate-y-0"}`, "class")} data-astro-cid-dlrkusbo>${item.label}</span></a>`;
	})}</div></div></div></nav>${renderScript($$result, "/home/ubuntu/school-attendance-web/src/components/BottomNav.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/ubuntu/school-attendance-web/src/components/BottomNav.astro", void 0);
// src/layouts/Layout.astro
createAstro("https://astro.build");
var $$Layout = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Layout;
	const { title, activeNav = "data-presensi" } = Astro.props;
	return renderTemplate`<html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Digital Absensi SMK</title><meta name="description" content="Sistem Presensi Digital dan Agenda Akademik SMK berbasis Astro dan Tailwind CSS."><link rel="icon" type="image/x-icon" href="/favicon.ico"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet">${renderComponent($$result, "PwaMeta", $$PwaMeta, {})}<!-- Instant Pre-Render Auth Guard: Pengguna wajib login terlebih dahulu sebelum dapat mengakses dashboard atau halaman internal --><script>
    (function () {
      try {
        var path = window.location.pathname;
        var civ = localStorage.getItem('auth_civitas');
        var role = localStorage.getItem('auth_role');
        var active = sessionStorage.getItem('auth_active');
        var bypass = sessionStorage.getItem('bypass_login');
        
        var hasCookie = document.cookie.split(';').some(function (c) {
          return c.trim().startsWith('auth_session=');
        });

        var isAuth = Boolean((civ && role) || active || bypass || hasCookie);

        // 1. Jika belum login: Sembunyikan halaman seketika & redirect ke /login
        if (!isAuth) {
          document.documentElement.style.display = 'none';
          window.location.replace('/login');
          return;
        }

        var civObj = null;
        try {
          if (civ) civObj = JSON.parse(civ);
        } catch (e) {}

        var isKepsekOrWaka = civObj && (civObj.tag === 'kepsek' || civObj.tag === 'waka');
        var canAccessDashboard = role === 'admin' || isKepsekOrWaka || bypass;

        // 2. Akses Dashboard: HANYA Admin, Kepsek, dan Waka! Pengguna lain diarahkan ke profil masing-masing
        var isAllowed = canAccessDashboard || path.startsWith('/profil-siswa');
        if (!isAllowed) {
          document.documentElement.style.display = 'none';
          var civId = civObj ? civObj.id : '';
          window.location.replace('/profil-siswa' + (civId ? '?id=' + encodeURIComponent(civId) + '&auth=true' : ''));
          return;
        }
      } catch (err) {
        document.documentElement.style.display = 'none';
        window.location.replace('/login');
      }
    })();
  <\/script>${renderHead($$result)}</head><body class="bg-[#d8def2] text-slate-800 min-h-screen font-sans antialiased p-0 sm:p-5 lg:p-6 flex items-center justify-center relative selection:bg-blue-600 selection:text-white"><!-- Main Outer Window Container inspired by HeiMaUX --><div class="w-full max-w-[1520px] bg-white rounded-none sm:rounded-[26px] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-screen md:min-h-[920px] border-0 sm:border border-white/70"><!-- 1. SIDEBAR KIRI MODULAR (Bisa digantikan khusus via slot 'sidebar') -->${Astro.slots.has("sidebar") ? renderTemplate`${renderSlot($$result, $$slots["sidebar"])}` : renderTemplate`${renderComponent($$result, "Sidebar", $$Sidebar, { "activeNav": activeNav })}`}<!-- 2. MAIN CONTENT AREA DENGAN PADDING SEIMBANG --><main class="flex-1 bg-[#f4f7fe] flex flex-col overflow-y-auto min-w-0" id="main-content"><!-- NAVBAR ATAS MODULAR -->${renderComponent($$result, "Navbar", $$Navbar, { "title": title })}<!-- DINAMIS CONTENT INJECTION DENGAN TAG <slot /> --><div class="p-3.5 sm:p-6 lg:p-8 space-y-6 flex-1 pb-24 md:pb-8">${renderSlot($$result, $$slots["default"])}</div></main></div><!-- 3. FLOATING BOTTOM NAVIGATION BAR (KHUSUS MOBILE / ANDROID - DESAIN NO. 02) -->${Astro.slots.has("bottom-nav") ? renderTemplate`${renderSlot($$result, $$slots["bottom-nav"])}` : renderTemplate`${renderComponent($$result, "BottomNav", $$BottomNav, { "activeNav": activeNav })}`}<!-- Floating Toast Notifications Container --><div id="toast-container" class="fixed top-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm"></div><!-- FLOATING IOT SIMULATOR POPUP TOOLS WIDGET --><div id="iot-simulator-root" class="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-40 flex flex-col items-end gap-3 select-none"><!-- Popup Drawer / Card (Hidden by default) --><div id="iot-simulator-card" class="hidden w-96 max-w-[calc(100vw-2rem)] max-h-[85vh] overflow-y-auto bg-white/95 backdrop-blur-xl rounded-3xl p-5 shadow-2xl border border-blue-200/80 text-slate-800 space-y-3.5 animate-toast scrollbar-thin"><div class="flex items-center justify-between border-b border-slate-100 pb-2.5"><div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span><h4 class="text-xs font-black tracking-tight text-slate-900 uppercase">IoT & Dev Simulator</h4></div><div class="flex items-center gap-1.5"><span id="iot-active-day-tag" class="text-[9px] font-black px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">Kalender Asli</span><button id="close-iot-sim" class="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 hover:bg-slate-100 rounded-lg">✕</button></div></div><!-- 1. Simulasi Hari / Kalender --><div><label for="iot-day-mode" class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Simulasi Hari / Kalender</label><select id="iot-day-mode" class="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"><option value="auto">📅 Kalender Asli (Otomatis Hari Ini)</option><option value="weekday">🏫 Hari Sekolah Aktif (Senin - Sabtu)</option><option value="sunday">🏖️ Hari Libur Sekolah (Minggu)</option></select></div><!-- 2. Mode Sesi / Waktu Pengetesan --><div><label for="iot-time-mode" class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Simulasi Jam / Sesi</label><select id="iot-time-mode" class="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"><option value="realtime">⏱️ Jam Nyata Sekarang (WIB)</option><option value="05:45|masuk">🚫 Masuk Belum Buka (05:45 WIB)</option><option value="06:45|masuk">🌅 Pagi Tepat Waktu (06:45 WIB)</option><option value="07:45|masuk">⏰ Pagi Terlambat (07:45 WIB)</option><option value="14:00|pulang">⏳ Pulang Belum Buka (14:00 WIB)</option><option value="15:30|pulang">🌇 Siang Pulang Sah (15:30 WIB)</option><option value="17:30|pulang">⚠️ Batas Akhir Pulang (17:30 WIB)</option></select></div><!-- 3. Otomasi Pengujian Kilat (1-Click Batch) --><div><span class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Otomasi Pengujian Cepat</span><div class="grid grid-cols-3 gap-1.5"><button type="button" id="btn-batch-all-hadir" class="px-2 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 font-bold text-[10px] transition text-center truncate shadow-xs">⚡ Hadir Semua</button><button type="button" id="btn-batch-mixed" class="px-2 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-800 font-bold text-[10px] transition text-center truncate shadow-xs">⏰ Hadir & Telat</button><button type="button" id="btn-batch-pulang" class="px-2 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-800 font-bold text-[10px] transition text-center truncate shadow-xs">🌇 Pulang Semua</button></div></div><!-- 4. Quick Student Tap Buttons (9-Digit Real RFID UIDs) --><div><span class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tap Kartu RFID Siswa (8 Siswa & Guru)</span><div class="grid grid-cols-2 gap-1.5"><button type="button" class="sim-btn px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-800 font-semibold text-[11px] transition text-left truncate border border-slate-100" data-uid="101182001">👧 Alya (XII AKL)</button><button type="button" class="sim-btn px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-800 font-semibold text-[11px] transition text-left truncate border border-slate-100" data-uid="101182002">👦 Rizky (XII RPL)</button><button type="button" class="sim-btn px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-800 font-semibold text-[11px] transition text-left truncate border border-slate-100" data-uid="101182003">👦 Fadli (XI RPL)</button><button type="button" class="sim-btn px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-800 font-semibold text-[11px] transition text-left truncate border border-slate-100" data-uid="101182004">👦 Budi (X RPL)</button><button type="button" class="sim-btn px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-800 font-semibold text-[11px] transition text-left truncate border border-slate-100" data-uid="101182005">👧 Siti (X AKL)</button><button type="button" class="sim-btn px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-800 font-semibold text-[11px] transition text-left truncate border border-slate-100" data-uid="101182006">👧 Dewi (XI AKL)</button><button type="button" class="sim-btn px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-800 font-semibold text-[11px] transition text-left truncate border border-slate-100" data-uid="119849847">👧 Mesi (X RPL)</button><button type="button" class="sim-btn px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-800 font-semibold text-[11px] transition text-left truncate border border-slate-100" data-uid="171182156">👦 Farhan (X RPL)</button><button type="button" class="sim-btn col-span-2 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-800 font-semibold text-[11px] transition text-left truncate border border-amber-200" data-uid="201182001">👨‍🏫 Pak Wahyu Hidayat (Guru / Waka)</button></div></div><!-- 5. Manual Input UID --><div class="flex items-center gap-1.5"><input id="manual-uid-input" type="text" placeholder="UID: 101182001..." class="flex-1 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-600"><button id="manual-tap-btn" type="button" class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs transition">Tap</button></div><!-- Action Footer --><div class="pt-2 border-t border-slate-100 flex items-center justify-between"><button type="button" onclick="window.resetAttendance()" class="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline"><span class="material-symbols-outlined text-xs">restart_alt</span> Reset Presensi</button><span class="text-[10px] text-slate-400">Jadwal: 06:00 - 23:00</span></div></div><!-- Floating Toggle Button --><button id="toggle-iot-sim" type="button" class="flex items-center gap-2 sm:gap-2.5 px-3 py-2 sm:px-4 sm:py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-xs shadow-xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/30"><span class="relative flex h-2.5 w-2.5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span></span><span class="material-symbols-outlined text-sm">sensors</span><span class="hidden sm:inline">Simulasi IoT RFID</span><span class="sm:hidden text-[11px]">IoT RFID</span></button></div>${renderScript($$result, "/home/ubuntu/school-attendance-web/src/layouts/Layout.astro?astro&type=script&index=0&lang.ts")}</body></html>`;
}, "/home/ubuntu/school-attendance-web/src/layouts/Layout.astro", void 0);
export { $$Layout as t };
