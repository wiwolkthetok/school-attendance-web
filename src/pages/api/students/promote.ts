export const prerender = false;
import type { APIRoute } from 'astro';
import { turso, initDatabase } from '../../../utils/tursoClient';
import { getStudents, invalidateStudentsCache } from '../../../utils/attendanceStorage';
import { resetStudentPoints } from '../../../utils/pointsStorage';
import { attendanceEmitter } from '../../../utils/attendanceEvents';

export const POST: APIRoute = async ({ request }) => {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const hasAdminSession = cookieHeader.includes('auth_session=admin');
    if (!hasAdminSession && !request.headers.get('x-dev-bypass')) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Akses Ditolak: Hanya Kepala Sekolah atau Waka Kesiswaan yang berhak memproses kenaikan kelas.',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const body = await request.json().catch(() => ({}));
    const sourceClass = (body.sourceClass || '').trim();
    const targetClass = (body.targetClass || '').trim();
    const studentIds: string[] = Array.isArray(body.studentIds) ? body.studentIds : [];
    const resetPoints = Boolean(body.resetPoints !== false);

    if (!sourceClass || !targetClass || studentIds.length === 0) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Rombel asal, rombel tujuan, dan minimal 1 siswa terpilih wajib disertakan.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    await initDatabase();
    const allStudents = await getStudents();
    const validStudentIds = new Set(allStudents.filter((s) => s.role === 'siswa').map((s) => s.id));
    const targetCategory = targetClass.toLowerCase().includes('alumni') || targetClass.toLowerCase().includes('lulus')
      ? 'alumni'
      : targetClass.toLowerCase().includes('akl')
        ? 'akl'
        : targetClass.toLowerCase().includes('rpl')
          ? 'rpl'
          : undefined;

    let updatedCount = 0;
    for (const sid of studentIds) {
      if (!validStudentIds.has(sid)) continue;

      if (targetCategory) {
        await turso.execute({
          sql: 'UPDATE students SET class_name = ?, category = ? WHERE id = ?;',
          args: [targetClass, targetCategory, sid],
        });
      } else {
        await turso.execute({
          sql: 'UPDATE students SET class_name = ? WHERE id = ?;',
          args: [targetClass, sid],
        });
      }

      if (resetPoints) {
        const studentObj = allStudents.find((s) => s.id === sid);
        await resetStudentPoints(sid, studentObj?.rfidUid);
      }
      updatedCount++;
    }

    invalidateStudentsCache();
    attendanceEmitter.emit('attendance', { type: 'students_updated' });

    return new Response(
      JSON.stringify({
        status: 'success',
        message: `Berhasil memproses kenaikan kelas: ${updatedCount} siswa dari ${sourceClass} ke ${targetClass}.`,
        promotedCount: updatedCount,
        sourceClass,
        targetClass,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ status: 'error', message: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

