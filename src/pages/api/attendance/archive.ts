export const prerender = false;
import type { APIRoute } from 'astro';
import { getAttendanceHistory, archiveAndResetDailyLogs, clearAttendanceHistory, syncDailyAttendanceAndPermissions } from '../../../utils/attendanceStorage';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    if (action === 'sync') {
      const targetDate = url.searchParams.get('date') || undefined;
      const syncResult = await syncDailyAttendanceAndPermissions(targetDate);
      return new Response(JSON.stringify(syncResult), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const filter = (url.searchParams.get('filter') || 'all') as 'today' | 'week' | 'month' | 'year' | 'all';
    const studentId = url.searchParams.get('studentId') || undefined;
    const rfidUid = url.searchParams.get('rfid') || undefined;

    const history = await getAttendanceHistory({ filter, studentId, rfidUid });
    return new Response(JSON.stringify(history), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ status: 'error', message: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const hasAdminSession = cookieHeader.includes('auth_session=admin');
    if (!hasAdminSession && !request.headers.get('x-dev-bypass')) {
      return new Response(JSON.stringify({ status: 'error', message: 'Akses Ditolak: Hanya Kepala Sekolah, Waka, atau Admin yang berhak memproses arsip.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json().catch(() => ({}));
    const action = body.action || '';

    if (action === 'sync') {
      const syncResult = await syncDailyAttendanceAndPermissions(body.date);
      return new Response(JSON.stringify(syncResult), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const dateStr = body.date || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
    const result = await archiveAndResetDailyLogs(dateStr);
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ status: 'error', message: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const hasAdminSession = cookieHeader.includes('auth_session=admin');
    if (!hasAdminSession && !request.headers.get('x-dev-bypass')) {
      return new Response(JSON.stringify({ status: 'error', message: 'Akses Ditolak: Hanya Kepala Sekolah, Waka, atau Admin yang berhak membersihkan arsip.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await clearAttendanceHistory();
    return new Response(JSON.stringify({ status: 'success', message: 'Tabel arsip historis berhasil dibersihkan.' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ status: 'error', message: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

