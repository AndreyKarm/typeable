import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
// import type { Actions } from './$types';
// import { auth } from '$lib/server/auth';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  const publicRoutes = ['/login', '/register', '/banned', '/goodbye'];
  if (publicRoutes.some((route) => url.pathname.startsWith(route))) {
    return {};
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

// export const actions: Actions = {
//   signOut: async (event) => {
//     await auth.api.signOut({
//       headers: event.request.headers
//     });
//     return redirect(302, '/');
//   }
// };
