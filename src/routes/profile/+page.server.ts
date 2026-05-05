import { db } from '$lib/server/db';
import { userStats, typingSession } from '$lib/server/db/typeable.schema';
import { redirect } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // Redirect to login page if not logged in
  if (!locals.user) throw redirect(302, '/login');

  // Get user stats and typing sessions
  const stats = await db.query.userStats.findFirst({
    where: eq(userStats.userId, locals.user.id)
  });

  // Get typing sessions for the user
  const sessions = await db.query.typingSession.findMany({
    where: eq(typingSession.userId, locals.user.id),
    orderBy: [desc(typingSession.createdAt)],
    limit: 10, // Limit to 10 sessions
    with: {
      exercise: true // Include the exercise
    }
  });

  // If there are no typing sessions, return an empty array
  return {
    user: locals.user,
    stats: stats ?? { xp: 0, streak: 0, totalTyped: 0, avgWpm: 0 },
    sessions
  };
};