import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { APIError } from 'better-auth/api';

export const load: PageServerLoad = (event) => {
	if (event.locals.user) {
		return redirect(302, '/');
	}
	return {};
};

export const actions: Actions = {
	signInEmail: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		try {
			// Sign in the user with their email and password
			await auth.api.signInEmail({
				body: {
					email,
					password,
					callbackURL: '/auth/verification-success'
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				// If the error is an APIError, return a 400 status code with the error message
				return fail(400, { message: error.message || 'Signin failed' });
			}

			// If the error is not an APIError, return a 500 status code with the error message
			return fail(500, { message: 'Unexpected error' });
		}

		// Redirect the user to the dashboard page
		return redirect(302, '/dashboard');
	}
};
