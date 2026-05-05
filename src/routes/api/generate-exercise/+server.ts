import { db } from '$lib/server/db';
import { exercise, typingSession } from '$lib/server/db/typeable.schema';
import { generateCustomExercise as GeminiGenerate } from '$lib/service/gemini';
import { generateCustomExercise as LMGenerate } from '$lib/service/lmstudio';
import { error, json } from '@sveltejs/kit';
import { eq, desc, and } from 'drizzle-orm';
import { EXERCISE_TIME_VALUE } from '$lib/consts';
import type { Mistake } from '$lib/service/TMistake';

const prod = false;

export async function POST({ locals }) {
  if (!locals.user) throw error(401, 'Unauthorized');

  // Look for existing exercsise 
  const existingExercise = await db.query.exercise.findFirst({
    where: and(
      eq(exercise.targetUserId, locals.user.id),
      eq(exercise.type, 'ai')
    ),
    orderBy: [desc(exercise.createdAt)]
  });

  // Send to existing if never played
  if (existingExercise && existingExercise.timesPlayed === 0) {
    return json({ exerciseId: existingExercise.id });
  }

  // Generate new
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
    time: Math.round(newContent.length * EXERCISE_TIME_VALUE),
    isPersonal: true,
    targetUserId: locals.user.id
  }).returning();

  return json({ exerciseId: newExercise.id });
}