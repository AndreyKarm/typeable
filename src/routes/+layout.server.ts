import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
// import type { Actions } from './$types';
// import { auth } from '$lib/server/auth';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  if (url.pathname.startsWith('/login') || url.pathname.startsWith('/register')) {
    return {};
  }

  if (!locals.session) {
    return redirect(302, '/register');
  }

  if (!locals.user || locals.user.banned) {
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
