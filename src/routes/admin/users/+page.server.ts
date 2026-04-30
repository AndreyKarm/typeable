import { db } from "$lib/server/db";
import { user } from "$lib/server/db/auth.schema";
import { fail, type Actions } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function load({ locals }) {
  if (locals.user?.role !== 'admin') throw fail(403, { message: 'Forbidden' });

  const users = await db.query.user.findMany({
    orderBy: (u, { desc }) => [desc(u.createdAt)]
  });

  return { users };
}

export const actions: Actions = {
  updateUser: async ({ request, locals }) => {
    if (locals.user?.role !== 'admin') return fail(403, { message: 'Forbidden' });

    const formData = await request.formData();
    const id = formData.get('id') as string;
    const role = formData.get('role') as "user" | "admin" | "moderator";
    const banned = formData.get('banned') === 'true';

    await db.update(user).set({ role, banned }).where(eq(user.id, id));
    return { success: true };
  }
}