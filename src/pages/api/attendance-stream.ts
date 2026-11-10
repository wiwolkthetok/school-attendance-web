export const prerender = false;
import type { APIRoute } from 'astro';
import { attendanceEmitter } from '../../utils/attendanceEvents';

export const GET: APIRoute = async ({ request }) => {
  let onAttendance: (data: any) => void;
  let heartbeatInterval: ReturnType<typeof setInterval>;

  const stream = new ReadableStream({
    start(controller) {
      // Kirim pesan inisialisasi awal
      controller.enqueue(new TextEncoder().encode(`event: connected\ndata: "connected"\n\n`));

      // Heartbeat setiap 15 detik agar client tahu SSE masih hidup
      heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(`event: heartbeat\ndata: ${Date.now()}\n\n`));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 15000);

      onAttendance = (data: any) => {
        try {
          const payload = `event: attendance\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(new TextEncoder().encode(payload));
        } catch {
          // Stream controller mungkin sudah ditutup client
        }
      };

      attendanceEmitter.on('attendance', onAttendance);
    },
    cancel() {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (onAttendance) {
        attendanceEmitter.off('attendance', onAttendance);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
};
