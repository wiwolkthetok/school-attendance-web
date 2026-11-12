export const prerender = false;
import type { APIRoute } from 'astro';
import { getSchedules, saveSchedule, deleteSchedule, clearAllSchedules } from '../../utils/scheduleStorage';
import { attendanceEmitter } from '../../utils/attendanceEvents';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const day = url.searchParams.get('day');
    const category = url.searchParams.get('category');
    const visibility = url.searchParams.get('visibility');

    const cookieHeader = request.headers.get('cookie') || '';
    const isStaff = cookieHeader.includes('auth_session=admin') || cookieHeader.includes('auth_session=guru');

    let list = await getSchedules();

    // Proteksi privasi: jika bukan staf (siswa / guest), sembunyikan agenda khusus guru dan yang belum masuk H-x
    if (!isStaff) {
      const now = new Date();
      const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
      const todayDate = new Date(todayStr + 'T00:00:00');

      list = list.filter((s) => {
        if (s.visibility === 'guru') return false;
        const leadDays = Number(s.notifyLeadDays ?? 0);
        if (leadDays > 0) {
          const startStr = s.startDate || s.date || '';
          if (startStr) {
            const startDate = new Date(startStr + 'T00:00:00');
            const diffDays = Math.ceil((startDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays > leadDays) return false;
          }
        }
        return true;
      });
    }

    if (day && day !== 'all') {
      list = list.filter((s) => s.day.toLowerCase() === day.toLowerCase());
    }
    if (category && category !== 'all') {
      list = list.filter((s) => s.category.toLowerCase() === category.toLowerCase());
    }
    if (visibility && visibility !== 'all') {
      list = list.filter((s) => (s.visibility || 'public') === visibility);
    }

    return new Response(JSON.stringify(list), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ status: 'error', message: err?.message || 'Gagal memuat jadwal' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const isStaff = cookieHeader.includes('auth_session=admin') || cookieHeader.includes('auth_session=guru');
    if (!isStaff) {
      return new Response(
        JSON.stringify({ status: 'error', message: 'Akses ditolak: Hanya staf atau admin yang berhak mengelola agenda.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json().catch(() => ({}));
    const title = (body.title || '').trim();
    const day = (body.day || 'Senin').trim();
    const timeStart = (body.timeStart || '08:00').trim();
    const timeEnd = (body.timeEnd || '09:30').trim();

    if (!title) {
      return new Response(
        JSON.stringify({ status: 'error', message: 'Judul agenda / mata pelajaran wajib diisi' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const saved = await saveSchedule({
      id: body.id,
      title,
      category: body.category || 'kbm',
      day,
      date: body.date || body.startDate || '',
      startDate: body.startDate || body.date || '',
      endDate: body.endDate || body.startDate || body.date || '',
      visibility: body.visibility === 'guru' ? 'guru' : 'public',
      notifyLeadDays: Number(body.notifyLeadDays ?? 0),
      timeStart,
      timeEnd,
      room: body.room || 'Ruang KBM',
      classTarget: body.classTarget || 'Semua Kelas',
      instructor: body.instructor || 'Guru Pengampu',
      color: body.color,
    });

    attendanceEmitter.emit('attendance', { type: 'schedules_updated', data: saved });

    return new Response(
      JSON.stringify({ status: 'success', message: 'Agenda berhasil disimpan', data: saved }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ status: 'error', message: err?.message || 'Gagal menyimpan agenda' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const isStaff = cookieHeader.includes('auth_session=admin') || cookieHeader.includes('auth_session=guru');
    if (!isStaff) {
      return new Response(
        JSON.stringify({ status: 'error', message: 'Akses ditolak: Hanya staf atau admin yang berhak menghapus agenda.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(request.url);
    const clearAll = url.searchParams.get('all') === 'true';

    if (clearAll) {
      await clearAllSchedules();
      attendanceEmitter.emit('attendance', { type: 'schedules_updated' });
      return new Response(
        JSON.stringify({ status: 'success', message: 'Semua agenda berhasil dikosongkan' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const id = url.searchParams.get('id') || (await request.json().catch(() => ({}))).id;

    if (!id) {
      return new Response(
        JSON.stringify({ status: 'error', message: 'ID agenda wajib disertakan' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await deleteSchedule(id);
    attendanceEmitter.emit('attendance', { type: 'schedules_updated' });

    return new Response(
      JSON.stringify({ status: 'success', message: 'Agenda berhasil dihapus' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ status: 'error', message: err?.message || 'Gagal menghapus agenda' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
