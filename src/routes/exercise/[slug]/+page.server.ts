import { db } from '$lib/server/db';
import {
  exercise,
  exerciseRating,
  typingSession,
  userStats
} from '$lib/server/db/typeable.schema';
import { error, fail, type Actions } from '@sveltejs/kit';
import { and, eq, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  const id = Number(params.slug);
  if (isNaN(id)) throw error(404, 'Invalid Exercise ID');

  const ex = await db.query.exercise.findFirst({
    where: eq(exercise.id, id)
  });

  if (!ex) throw error(404, 'Exercise not found');

  let userRating = 0;
  if (locals.user) {
    const existing = await db.query.exerciseRating.findFirst({
      where: and(
        eq(exerciseRating.userId, locals.user.id),
        eq(exerciseRating.exerciseId, id)
      )
    });
    userRating = existing?.isLiked ?? 0;
  }

  return { exercise: ex, userRating };
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

    const lengthModifier = Math.max(1, charCount / 10);
    const xpEarned = Math.max(1, Math.round(wpm * (accuracy / 100) * lengthModifier));

    console.log(`Char count: ${charCount}, length modifier: ${lengthModifier}, xpearned: ${xpEarned}`)

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

      // 3. Update User Stats (Single MERGED Upsert)
      await tx
        .insert(userStats)
        .values({
          userId: locals.user!.id,
          totalTyped: charCount,
          avgWpm: wpm,
          xp: xpEarned,
          streak: 1, // Default if new record
          lastPlayedAt: sql`CURRENT_TIMESTAMP` // Default if new record
        })
        .onConflictDoUpdate({
          target: userStats.userId,
          set: {
            totalTyped: sql`${userStats.totalTyped} + ${charCount}`,
            avgWpm: sql`(${userStats.avgWpm} + ${wpm}) / 2`,
            xp: sql`${userStats.xp} + ${xpEarned}`,
            streak: sql`
              CASE 
                WHEN COALESCE(${userStats.lastPlayedAt}, '1970-01-01'::timestamp)::date = CURRENT_DATE THEN ${userStats.streak}
                WHEN COALESCE(${userStats.lastPlayedAt}, '1970-01-01'::timestamp)::date = CURRENT_DATE - INTERVAL '1 day' THEN ${userStats.streak} + 1
                ELSE 1 
              END`,
            lastPlayedAt: sql`CURRENT_TIMESTAMP`
          }
        });
    });

    return { success: true, xpEarned };
  },

  rate: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { message: 'Unauthorized' });

    const formData = await request.formData();
    const exerciseId = Number(formData.get('exerciseId'));
    const newRating = Number(formData.get('rating')); // 1 or -1

    if (isNaN(exerciseId) || (newRating !== 1 && newRating !== -1)) {
      return fail(400, { message: 'Invalid input' });
    }

    await db.transaction(async (tx) => {
      // 1. Get existing rating
      const existing = await tx.query.exerciseRating.findFirst({
        where: and(
          eq(exerciseRating.userId, locals.user!.id),
          eq(exerciseRating.exerciseId, exerciseId)
        )
      });

      const oldRating = existing?.isLiked ?? 0;

      // 2. Determine final rating (Toggle behavior: if clicking same, set to 0)
      const finalRating = oldRating === newRating ? 0 : newRating;

      // 3. Update Exercise Counts
      // Logic: If transitioning from old, subtract old, add final
      await tx
        .update(exercise)
        .set({
          likes: sql`${exercise.likes} - ${oldRating === 1 ? 1 : 0} + ${finalRating === 1 ? 1 : 0}`,
          dislikes: sql`${exercise.dislikes} - ${oldRating === -1 ? 1 : 0} + ${finalRating === -1 ? 1 : 0}`
        })
        .where(eq(exercise.id, exerciseId));

      // 4. Update or Delete rating entry
      if (finalRating === 0) {
        if (existing) {
          await tx.delete(exerciseRating).where(eq(exerciseRating.id, existing.id));
        }
      } else {
        if (existing) {
          await tx
            .update(exerciseRating)
            .set({ isLiked: finalRating })
            .where(eq(exerciseRating.id, existing.id));
        } else {
          await tx.insert(exerciseRating).values({
            userId: locals.user!.id,
            exerciseId,
            isLiked: finalRating
          });
        }
      }
    });

    return { success: true };
  }
};