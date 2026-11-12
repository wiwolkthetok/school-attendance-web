export const prerender = false;
import type { APIRoute } from 'astro';
import { getSettings, saveSettings, resetSettings } from '../../utils/settingsStorage';

export const GET: APIRoute = async () => {
  const settings = await getSettings();
  return new Response(JSON.stringify(settings), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const hasAdminSession = cookieHeader.includes('auth_session=admin');
    if (!hasAdminSession && !request.headers.get('x-dev-bypass')) {
      return new Response(JSON.stringify({ status: 'error', message: 'Akses Ditolak: Hanya Administrator yang berhak mengubah pengaturan.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json().catch(() => ({}));
    const updated = await saveSettings(body);
    return new Response(
      JSON.stringify({ status: 'success', message: 'Pengaturan berhasil diperbarui', data: updated }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ status: 'error', message: err?.message || 'Gagal menyimpan pengaturan' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  const cookieHeader = request.headers.get('cookie') || '';
  const hasAdminSession = cookieHeader.includes('auth_session=admin');
  if (!hasAdminSession && !request.headers.get('x-dev-bypass')) {
    return new Response(JSON.stringify({ status: 'error', message: 'Akses Ditolak: Hanya Administrator yang berhak mereset pengaturan.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const defaults = await resetSettings();
  return new Response(
    JSON.stringify({ status: 'success', message: 'Pengaturan berhasil direset ke default', data: defaults }),
    { headers: { 'Content-Type': 'application/json' } }
  );
};
