import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';

export const load: PageServerLoad = (event) => {
  return { user: event.locals.user };
};

export const actions: Actions = {
  signOut: async (event) => {
    await auth.api.signOut({
      headers: event.request.headers
    });
    return redirect(302, '/login');
  },

  changePassword: async (event) => {
    const formData = await event.request.formData();
    const newPassword = formData.get('newPassword')?.toString().trim();
    const currentPassword = formData.get('currentPassword')?.toString().trim();

    if (!newPassword || !currentPassword) {
      return fail(400, { message: 'New Password and Current Password are required.' });
    }

    try {
      await auth.api.changePassword({
        body: {
          newPassword,
          currentPassword,
          revokeOtherSessions: true,
        },
        headers: event.request.headers
      });
    } catch (e) {
      console.error(e);
      return fail(401, { message: 'Failed to change password. Please check your current password.' });
    }

    return { success: true };
  },

  deleteAccount: async (event) => {
    const formData = await event.request.formData();
    const password = formData.get('password')?.toString();

    try {
      // Pass the password in the body to satisfy the type requirement
      await auth.api.deleteUser({
        body: { password },
        headers: event.request.headers,
      });
    } catch (e) {
      console.error(e);
      return fail(401, { message: 'Failed to delete account. Check your password.' });
    }

    redirect(302, '/goodbye');
  }
};