import { db } from '$lib/server/db';
import { exercise } from '$lib/server/db/typeable.schema';
import { fail } from '@sveltejs/kit';
import { or, eq } from 'drizzle-orm';

export async function load({ locals }) {
  // Check if the user is logged in
  const userId = locals.user?.id;

  // Get all exercises for the user
  const exercises = await db.query.exercise.findMany({
    with: {
      author: {
        columns: { name: true } // Only include the name of the author
      }
    },
    where: userId
      ? or(eq(exercise.isPersonal, false), eq(exercise.authorId, userId)) // If the user is logged in, only show their own exercises
      : eq(exercise.isPersonal, false)                                     // If the user is not logged in, only show non-personal exercises
  });

  // If there are no exercises, return an empty array
  return { exercises };
}

export const actions = {
  // Create exercise function triggers when user clicks on the create exercise button
  create: async ({ request, locals }) => {
    // Check if the user is logged in
    if (!locals.user) return fail(401, { message: 'Unauthorized' });

    const formData = await request.formData();
    const content = formData.get('content')?.toString();
    const time = parseInt(formData.get('time')?.toString() || '30');

    // Check if the content is provided
    if (!content || content.length < 10) {
      return fail(400, { message: 'Exercise content is too short (min 10 chars).' });
    }

    // Insert the exercise into the database
    await db.insert(exercise).values({
      type: 'user',
      content,
      time,
      authorId: locals.user?.id || null,
      isPersonal: false
    });

    // Redirect to the dashboard page
    return { success: true };
  }
};