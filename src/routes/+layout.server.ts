import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  const publicRoutes = ['/login', '/register', '/banned', '/goodbye', '/'];
  const isPublicRoute = publicRoutes.includes(url.pathname);

  if (isPublicRoute) {
    return {
      user: locals.user
    };
  }

  if (!locals.user) {
    throw redirect(302, '/login');
  }

  if (locals.user.banned) {
    throw redirect(303, '/banned');
  }

  return {
    user: locals.user
  };
};