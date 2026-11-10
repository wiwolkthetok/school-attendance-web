import { EventEmitter } from "node:events";
// src/utils/attendanceEvents.ts
if (!globalThis.__attendanceEmitter) {
	globalThis.__attendanceEmitter = new EventEmitter();
	globalThis.__attendanceEmitter.setMaxListeners(200);
}
var attendanceEmitter = globalThis.__attendanceEmitter;
export { attendanceEmitter as t };
