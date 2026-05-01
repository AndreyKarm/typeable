import { db } from '$lib/server/db';
import { exercise, typingSession } from '$lib/server/db/typeable.schema';
import { generateCustomExercise as GeminiGenerate } from '$lib/service/gemini';
import { generateCustomExercise as LMGenerate } from '$lib/service/lmstudio';
import { error, redirect } from '@sveltejs/kit';
import { eq, desc, and } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { EXERCISE_TIME_VALUE } from '$lib/consts';
import type { Mistake } from '$lib/service/TMistake';
import { env } from '$env/dynamic/private';

const prod = env.NODE_ENV == "production" ? false : true

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) throw error(401, 'Unauthorized');

  const existingExercise = await db.query.exercise.findFirst({
    where: and(
      eq(exercise.targetUserId, locals.user.id),
      eq(exercise.type, 'ai')
    ),
    orderBy: [desc(exercise.createdAt)]
  });

  if (existingExercise && existingExercise.timesPlayed === 0) {
    throw redirect(303, `/exercise/${existingExercise.id}`);
  }

  const sessions = await db.query.typingSession.findMany({
    where: eq(typingSession.userId, locals.user.id),
    limit: 10
  });

  const generator = prod ? GeminiGenerate : LMGenerate;

  const allMistakes: Mistake[] = sessions.flatMap((s) => (s.errors as Mistake[]) || []);
  const newContent = await generator(allMistakes);

  const [newExercise] = await db.insert(exercise).values({
    type: 'ai',
    content: newContent,
    time: newContent.length * EXERCISE_TIME_VALUE,
    isPersonal: true,
    targetUserId: locals.user.id
  }).returning();

  throw redirect(303, `/exercise/${newExercise.id}`);
};