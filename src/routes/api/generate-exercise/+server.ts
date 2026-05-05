import { db } from '$lib/server/db';
import { exercise, typingSession } from '$lib/server/db/typeable.schema';
import { generateCustomExercise as GeminiGenerate } from '$lib/service/gemini';
import { generateCustomExercise as LMGenerate } from '$lib/service/lmstudio';
import { error, json } from '@sveltejs/kit';
import { eq, desc, and } from 'drizzle-orm';
import { EXERCISE_TIME_VALUE } from '$lib/consts';
import type { Mistake } from '$lib/service/TMistake';

const prod = true;

export async function POST({ locals }) {
  // Check if the user is logged in
  if (!locals.user) throw error(401, 'Unauthorized');

  // Check if the user has already generated an exercise
  const existingExercise = await db.query.exercise.findFirst({
    where: and(
      eq(exercise.targetUserId, locals.user.id),
      eq(exercise.type, 'ai')
    ),
    orderBy: [desc(exercise.createdAt)]
  });

  // If the user has already generated an exercise, return the existing exercise
  if (existingExercise && existingExercise.timesPlayed === 0) {
    return json({ exerciseId: existingExercise.id });
  }

  // Fetch the user's typing sessions
  const sessions = await db.query.typingSession.findMany({
    where: eq(typingSession.userId, locals.user.id),
    limit: 10 // Limit to 10 sessions
  });

  // Generate a new exercise using the typing sessions
  const generator = prod ? GeminiGenerate : LMGenerate;
  const allMistakes: Mistake[] = sessions.flatMap((s) => (s.errors as Mistake[]) || []);
  const newContent = await generator(allMistakes);

  // Insert the new exercise into the database
  const [newExercise] = await db.insert(exercise).values({
    type: 'ai',
    content: newContent,
    time: Math.round(newContent.length * EXERCISE_TIME_VALUE),
    isPersonal: true,
    targetUserId: locals.user.id
  }).returning();

  // Return the new exercise ID
  return json({ exerciseId: newExercise.id });
}