import { db } from "$lib/server/db";
import { user } from "$lib/server/db/auth.schema";
import { fail, type Actions } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function load({ locals }) {
  // Check if the user is an admin
  if (locals.user?.role !== 'admin') throw fail(403, { message: 'Forbidden' });

  // Fetch all users from the database
  const users = await db.query.user.findMany({
    orderBy: (u, { desc }) => [desc(u.createdAt)] // Order by createdAt descending
  });

  // Return the users
  return { users };
}

export const actions: Actions = {
  updateUser: async ({ request, locals }) => {
    // Check if the user is an admin
    if (locals.user?.role !== 'admin') return fail(403, { message: 'Forbidden' });

    const formData = await request.formData();
    const id = formData.get('id') as string;
    const role = formData.get('role') as "user" | "admin" | "moderator";
    const banned = formData.get('banned') === 'true';
    const notes = formData.get('notes') as string;

    // Check if the user exists
    await db.update(user).set({ role, banned, notes }).where(eq(user.id, id));

    // Return a success message
    return { success: true };
  }
}