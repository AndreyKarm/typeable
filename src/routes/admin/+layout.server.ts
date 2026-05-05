import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  // Check if the user is logged in
  if (!locals.user) {
    throw redirect(302, '/login');
  }

  if (locals.user.role !== 'admin') {
    throw redirect(302, '/'); // Redirect non-admins to home
  }

  // Return the user object
  return {
    user: locals.user
  };
};