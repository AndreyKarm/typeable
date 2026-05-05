import { db } from '$lib/server/db';
import { userStats, typingSession } from '$lib/server/db/typeable.schema';
import { eq, desc, count, max, avg } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

const REQUIRED_AI_EXERCISES = 10;

export async function load({ locals }) {
  // Check if the user is logged in
  if (!locals.user) throw error(401, 'Unauthorized');

  // Fetch the user stats and typing session metrics
  const stats = await db.query.userStats.findFirst({
    where: eq(userStats.userId, locals.user.id),
  });

  // If there are no stats, return an empty object
  const [metrics] = await db
    .select({
      totalSessions: count(typingSession.id),
      highestWpm: max(typingSession.wpm),
      avgAccuracy: avg(typingSession.accuracy),
    })
    .from(typingSession)
    .where(eq(typingSession.userId, locals.user.id)); // Filter by the user ID

  // Fetch the recent sessions
  const recentSessions = await db.query.typingSession.findMany({
    where: eq(typingSession.userId, locals.user.id),
    orderBy: [desc(typingSession.createdAt)],
    limit: 5, // Limit to 5 sessions
    with: { exercise: true }
  });

  // Merge the fetched data
  return {
    aiTestRequired: REQUIRED_AI_EXERCISES,
    stats: {
      // Merge the fetched stats with the cached stats
      ...stats,
      totalSessions: metrics?.totalSessions ?? 0,
      highestWpm: metrics?.highestWpm ?? 0,
      // 'avg' in SQL returns a string, cast to number
      avgAccuracy: Math.round(Number(metrics?.avgAccuracy ?? 0)),
      avgWpm: stats?.avgWpm ?? 0, // Using the cached value in userStats
      totalTyped: stats?.totalTyped ?? 0,
      streak: stats?.streak ?? 0,
    },
    // Filter the recent sessions to only include exercises that the user has completed
    recentSessions
  };
}