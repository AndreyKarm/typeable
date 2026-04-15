import type { Actions } from './$types';
import type { PageServerLoad } from './$types';
import { exercise } from '$lib/server/db/schema';
import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async () => {
  const randomExercise = await db
    .select()
    .from(exercise)
    .orderBy(sql`RANDOM()`)
    .limit(1);

  if (!randomExercise || randomExercise.length === 0) {
    return {
      exercise: {
        content: "No exercises found. Please add some exercises to the database."
      }
    };
  }

  return {
    exercise: randomExercise[0]
  };
}

export const actions: Actions = {
};
