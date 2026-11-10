import { h as InvalidComponentArgs, q as AstroError } from "./errors-data_BNWc2OO7.mjs";
import { M as createRenderInstruction, O as renderTemplate } from "./sequence_DrwEd3A2.mjs";
import "./compiler_f12fCyC4.mjs";
// node_modules/astro/dist/runtime/server/astro-component.js
function validateArgs(args) {
	if (args.length !== 3) return false;
	if (!args[0] || typeof args[0] !== "object") return false;
	return true;
}
function baseCreateComponent(cb, moduleId, propagation) {
	const name = moduleId?.split("/").pop()?.replace(".astro", "") ?? "";
	const fn = (...args) => {
		if (!validateArgs(args)) throw new AstroError({
			...InvalidComponentArgs,
			message: InvalidComponentArgs.message(name)
		});
		return cb(...args);
	};
	Object.defineProperty(fn, "name", {
		value: name,
		writable: false
	});
	fn.isAstroComponentFactory = true;
	fn.moduleId = moduleId;
	fn.propagation = propagation;
	return fn;
}
function createComponentWithOptions(opts) {
	return baseCreateComponent(opts.factory, opts.moduleId, opts.propagation);
}
function createComponent(arg1, moduleId, propagation) {
	if (typeof arg1 === "function") return baseCreateComponent(arg1, moduleId, propagation);
	else return createComponentWithOptions(arg1);
}
// node_modules/astro/dist/runtime/server/render/script.js
/**
* Relies on the `renderScript: true` compiler option
* @experimental
*/
async function renderScript(result, id) {
	const inlined = result.inlinedScripts.get(id);
	let content = "";
	if (inlined != null) {
		if (inlined) content = `<script type="module">${inlined}<\/script>`;
	} else {
		const resolved = await result.resolve(id);
		content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"><\/script>`;
	}
	return createRenderInstruction({
		type: "script",
		id,
		content
	});
}
// src/components/PwaMeta.astro
var $$PwaMeta = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`<!-- Web App Manifest --><link rel="manifest" href="/manifest.webmanifest"><meta name="theme-color" content="#2563eb"><!-- Apple iOS / Safari Support --><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="default"><meta name="apple-mobile-web-app-title" content="Smart Absen"><link rel="apple-touch-icon" href="/icons/apple-touch-icon.png"><!-- Windows / Desktop Tile Support (32 & 64-bit) --><meta name="application-name" content="Smart Absen"><meta name="msapplication-TileColor" content="#2563eb"><meta name="msapplication-TileImage" content="/icons/icon-192.png"><!-- Client-side PWA Initializer --><script src="/pwa-init.js"><\/script>`;
}, "/home/ubuntu/school-attendance-web/src/components/PwaMeta.astro", void 0);
export { renderScript as n, createComponent as r, $$PwaMeta as t };
