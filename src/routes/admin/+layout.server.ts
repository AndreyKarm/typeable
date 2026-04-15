import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  // 1. Check if the user is authenticated
  if (!locals.user) {
    throw redirect(302, '/login');
  }

  // 2. Check if the user is an admin
  if (locals.user.role !== 'admin') {
    throw redirect(302, '/'); // Redirect non-admins to home
  }

  // Return user info if needed by the layout
  return {
    user: locals.user
  };
};