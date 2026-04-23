import { db } from '$lib/server/db';
import { userStats, typingSession } from '$lib/server/db/typeable.schema';
import { redirect } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) throw redirect(302, '/login');

  // 1. Fetch Stats
  const stats = await db.query.userStats.findFirst({
    where: eq(userStats.userId, locals.user.id)
  });

  // 2. Fetch Recent History
  const sessions = await db.query.typingSession.findMany({
    where: eq(typingSession.userId, locals.user.id),
    orderBy: [desc(typingSession.createdAt)],
    limit: 10,
    with: {
      exercise: true
    }
  });

  return {
    user: locals.user,
    stats: stats ?? { xp: 0, streak: 0, totalTyped: 0, avgWpm: 0 },
    sessions
  };
};