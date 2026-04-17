import { db } from '$lib/server/db';
import {
  exercise,
  typingSession
} from '$lib/server/db/typeable.schema';
import { error, fail, type Actions } from '@sveltejs/kit';
import { eq, sql } from 'drizzle-orm';

export async function load() {
  const exercises = await db.query.exercise.findMany();
  if (!exercises.length) throw error(404, 'No exercises found');

  const random = exercises[Math.floor(Math.random() * exercises.length)];
  return { exercise: random };
}

export const actions: Actions = {
  save: async (event) => {
    if (!event.locals.user) return fail(401, { message: 'Unauthorized' });

    const formData = await event.request.formData();
    const wpm = Number(formData.get('wpm'));
    const accuracy = Number(formData.get('accuracy'));
    const exerciseId = Number(formData.get('exerciseId'));

    let errors: unknown[];
    try {
      errors = JSON.parse(formData.get('errors')?.toString() ?? '[]');
    } catch {
      errors = [];
    }

    if ([wpm, accuracy, exerciseId].some(isNaN)) {
      return fail(400, { message: 'Invalid form data' });
    }

    await db.insert(typingSession).values({
      userId: event.locals.user.id,
      exerciseId,
      wpm,
      accuracy,
      errors
    });

    await db
      .update(exercise)
      .set({ timesPlayed: sql`${exercise.timesPlayed} + 1` })
      .where(eq(exercise.id, exerciseId));

    return { success: true };
  }
};