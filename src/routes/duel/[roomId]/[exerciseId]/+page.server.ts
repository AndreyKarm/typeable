import { redirect, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { exercise } from '$lib/server/db/typeable.schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  // Check if the user is logged in
  if (!locals.user) { throw redirect(302, '/login') }

  // Fetch the specific exercise from the URL params
  const exerciseData = await db.query.exercise.findFirst({
    where: eq(exercise.id, parseInt(params.exerciseId))
  });

  if (!exerciseData) {
    throw error(404, 'Exercise not found');
  }

  // Return the user ID, user name, room ID, and exercise data
  return {
    userId: locals.user.id,
    userName: locals.user.name,
    roomId: params.roomId,
    exercise: {
      ...exerciseData,
      content: exerciseData.content.trim().replace('—', ' - ')
    }
  };
};