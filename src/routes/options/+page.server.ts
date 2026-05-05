import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';

export const load: PageServerLoad = (event) => {
  // Redirect to login page if not logged in
  return { user: event.locals.user };
};

export const actions: Actions = {
  // Sign out function triggers when user clicks on the logout button
  signOut: async (event) => {
    await auth.api.signOut({
      headers: event.request.headers
    });

    // Redirect to the login page
    return redirect(302, '/login');
  },

  // Change password function triggers when user clicks on the change password button
  changePassword: async (event) => {
    const formData = await event.request.formData();
    const newPassword = formData.get('newPassword')?.toString().trim();
    const currentPassword = formData.get('currentPassword')?.toString().trim();

    // Check if new password and current password are provided
    if (!newPassword || !currentPassword) {
      return fail(400, { message: 'New Password and Current Password are required.' });
    }

    try {
      // Pass the password in the body to satisfy the type requirement
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

    // Redirect to the profile page
    return { success: true };
  },

  // Delete account function triggers when user clicks on the delete account button
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

    // Redirect to the goodbye page
    redirect(302, '/goodbye');
  }
};