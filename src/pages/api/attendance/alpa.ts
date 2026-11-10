export const prerender = false;
import type { APIRoute } from 'astro';
import { checkAndApplyAlpa } from '../../../utils/attendanceStorage';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const dateStr = body.date || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
    const result = await checkAndApplyAlpa(dateStr);
    return new Response(JSON.stringify({
      status: 'success',
      message: `Evaluasi Alpa selesai: ${result.alpaCount} siswa dicatat Alpa.`,
      data: result,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ status: 'error', message: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
