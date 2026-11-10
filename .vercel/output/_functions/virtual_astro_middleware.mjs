import { t as sequence, yt as defineMiddleware } from "./chunks/sequence_DrwEd3A2.mjs";
import { t as initDatabase } from "./chunks/tursoClient_L2U3qzVi.mjs";
import { n as initCronWorker } from "./chunks/cronWorker_Cb4S-O9s.mjs";
// src/middleware.ts
initCronWorker();
initDatabase().catch(() => {});
var onRequest$1 = defineMiddleware(async (context, next) => {
	const pathname = new URL(context.request.url).pathname;
	if (pathname.startsWith("/api") || pathname.startsWith("/_astro") || pathname.startsWith("/assets") || pathname.startsWith("/favicon") || pathname === "/login") return next();
	if (!context.cookies.get("auth_session")?.value) return context.redirect("/login");
	return next();
});
// \0virtual:astro:middleware
var onRequest = sequence(onRequest$1);
export { onRequest };
