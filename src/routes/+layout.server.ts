import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
  if (event.url.pathname.startsWith('/login')) {
    return {};
  }

  if (!event.locals.session) {
    return redirect(302, '/login');
  }

  return {
    user: event.locals.user
  };
};