import type { APIRoute } from 'astro';

export const ALL: APIRoute = async ({ cookies }) => {
  cookies.delete('auth_session', { path: '/' });
  return new Response(JSON.stringify({ success: true, message: 'Logged out' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'auth_session=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax',
    },
  });
};
