import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  // Redirect to login page if not logged in
  const publicRoutes = ['/login', '/register', '/banned', '/goodbye', '/'];
  const isPublicRoute = publicRoutes.includes(url.pathname);

  // If the route is a public route, return the user data
  if (isPublicRoute) {
    return {
      user: locals.user
    };
  }

  // If the user is not logged in, redirect to the login page
  if (!locals.user) {
    throw redirect(302, '/login');
  }

  // If the user is banned, redirect to the banned page
  if (locals.user.banned) {
    throw redirect(303, '/banned');
  }

  // If the user is logged in, return the user data
  return {
    user: locals.user
  };
};