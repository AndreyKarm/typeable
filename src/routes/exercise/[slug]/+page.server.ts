import { db } from '$lib/server/db';
import {
  exercise,
  typingSession,
  userStats
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

    // Calculate how many characters were typed in this session
    // This is needed for totalTyped
    const charCount = Number(formData.get('charCount')) || 0;

    if ([wpm, accuracy, exerciseId].some(isNaN)) {
      return fail(400, { message: 'Invalid stats' });
    }

    await db.transaction(async (tx) => {
      // 1. Save Session
      await tx.insert(typingSession).values({
        userId: locals.user!.id,
        exerciseId,
        wpm,
        accuracy,
        errors
      });

      // 2. Update Exercise Metrics
      await tx
        .update(exercise)
        .set({ timesPlayed: sql`${exercise.timesPlayed} + 1` })
        .where(eq(exercise.id, exerciseId));

      // 3. Update User Stats (Upsert)
      await tx
        .insert(userStats)
        .values({
          userId: locals.user!.id,
          totalTyped: charCount,
          avgWpm: wpm // Initial value if insert happens
        })
        .onConflictDoUpdate({
          target: userStats.userId,
          set: {
            totalTyped: sql`${userStats.totalTyped} + ${charCount}`,
            // Simple moving average formula: (oldAvg * count + newWpm) / (count + 1)
            // Or just a simple average for now:
            avgWpm: sql`(${userStats.avgWpm} + ${wpm}) / 2`
          }
        });
    });

    return { success: true };
  }
};