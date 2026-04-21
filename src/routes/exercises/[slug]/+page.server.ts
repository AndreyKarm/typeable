import { db } from '$lib/server/db';
import {
  exercise,
  typingSession
} from '$lib/server/db/typeable.schema';
import { error, fail, type Actions } from '@sveltejs/kit';
import { eq, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const id = Number(params.slug);
  if (isNaN(id)) throw error(404, 'Invalid Exercise ID');

  const ex = await db.query.exercise.findFirst({
    where: eq(exercise.id, id)
  });

  if (!ex) throw error(404, 'Exercise not found');
  return { exercise: ex };
};

export const actions: Actions = {
  save: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { message: 'Unauthorized' });

    const formData = await request.formData();
    const wpm = Number(formData.get('wpm'));
    const accuracy = Number(formData.get('accuracy'));
    const exerciseId = Number(formData.get('exerciseId'));
    const errors = JSON.parse(String(formData.get('errors') ?? '[]'));

    if ([wpm, accuracy, exerciseId].some(isNaN)) {
      return fail(400, { message: 'Invalid stats' });
    }

    await db.transaction(async (tx) => {
      await tx.insert(typingSession).values({
        userId: locals.user!.id,
        exerciseId,
        wpm,
        accuracy,
        errors
      });

      await tx
        .update(exercise)
        .set({ timesPlayed: sql`${exercise.timesPlayed} + 1` })
        .where(eq(exercise.id, exerciseId));
    });

    return { success: true };
  }
};