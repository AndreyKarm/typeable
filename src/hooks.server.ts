import { redirect, type Handle } from '@sveltejs/kit';
import { building } from '$app/environment';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { user } from '$lib/server/db/schema';

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	try {
		const session = await auth.api.getSession({ headers: event.request.headers });

		if (session) {
			event.locals.session = session.session;

			const fullUser = await db.query.user.findFirst({
				where: eq(user.id, session.user.id),
			});

			if (fullUser?.banned) {
				event.cookies.set('ban_reason', fullUser.notes || 'No reason provided.', {
					path: '/',
					httpOnly: true,
					maxAge: 60
				});

				await auth.api.signOut({ headers: event.request.headers });

				event.locals.session = null;
				event.locals.user = null;

				throw redirect(303, '/banned');
			}

			event.locals.user = fullUser ?? session.user;
		}
	} catch (e) {
		console.error('Auth hook error (database likely down):', e);
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = handleBetterAuth;
