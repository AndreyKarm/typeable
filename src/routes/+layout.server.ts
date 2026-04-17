import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
// import type { Actions } from './$types';
// import { auth } from '$lib/server/auth';

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

// export const actions: Actions = {
//   signOut: async (event) => {
//     await auth.api.signOut({
//       headers: event.request.headers
//     });
//     return redirect(302, '/');
//   }
// };
