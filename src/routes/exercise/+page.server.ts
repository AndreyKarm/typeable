// src/routes/exercise/+page.server.ts
import { db } from '$lib/server/db';
import { exercise } from '$lib/server/db/typeable.schema';
import { fail } from '@sveltejs/kit';

export async function load() {
  const exercises = await db.query.exercise.findMany();
  return { exercises };
}

export const actions = {
  create: async ({ request, locals }) => {
    const formData = await request.formData();
    const content = formData.get('content')?.toString();
    const time = parseInt(formData.get('time')?.toString() || '30');

    if (!content || content.length < 10) {
      return fail(400, { message: 'Exercise content is too short (min 10 chars).' });
    }

    await db.insert(exercise).values({
      type: 'user',
      content,
      time,
      authorId: locals.user?.id || null,
      isPersonal: false
    });

    return { success: true };
  }
};