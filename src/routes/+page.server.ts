import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

export const actions = {
  // Sign out function triggers when user clicks on the logout button
  signOut: async ({ request }) => {
    await auth.api.signOut({
      headers: request.headers
    });
    throw redirect(302, '/');
  }
};