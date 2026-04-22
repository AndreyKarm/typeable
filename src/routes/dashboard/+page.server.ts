import { db } from '$lib/server/db';
import { userStats, typingSession } from '$lib/server/db/typeable.schema';
import { eq, desc } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export async function load({ locals }) {
  if (!locals.user) throw error(401, 'Unauthorized');

  // Fetch Stats
  const stats = await db.query.userStats.findFirst({
    where: eq(userStats.userId, locals.user.id),
  });

  // Fetch Recent Activity
  const recentSessions = await db.query.typingSession.findMany({
    where: eq(typingSession.userId, locals.user.id),
    orderBy: [desc(typingSession.createdAt)],
    limit: 5,
    with: { exercise: true } // Assuming relations are set up
  });

  return {
    stats: stats ?? { xp: 0, streak: 0, totalTyped: 0, avgWpm: 0 },
    recentSessions
  };
}