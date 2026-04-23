import { db } from '$lib/server/db';
import { userStats, typingSession } from '$lib/server/db/typeable.schema';
import { eq, desc, count, max, avg } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

const REQUIRED_AI_EXERCISES = 10;

export async function load({ locals }) {
  if (!locals.user) throw error(401, 'Unauthorized');

  // 1. Fetch static user stats (e.g., xp, streak)
  const stats = await db.query.userStats.findFirst({
    where: eq(userStats.userId, locals.user.id),
  });

  // 2. Fetch Aggregated metrics from typing sessions
  const [metrics] = await db
    .select({
      totalSessions: count(typingSession.id),
      highestWpm: max(typingSession.wpm),
      avgAccuracy: avg(typingSession.accuracy),
    })
    .from(typingSession)
    .where(eq(typingSession.userId, locals.user.id));

  // 3. Fetch Recent Activity
  const recentSessions = await db.query.typingSession.findMany({
    where: eq(typingSession.userId, locals.user.id),
    orderBy: [desc(typingSession.createdAt)],
    limit: 5,
    with: { exercise: true }
  });

  // Merge the fetched data
  return {
    aiTestRequired: REQUIRED_AI_EXERCISES,
    stats: {
      ...stats,
      totalSessions: metrics?.totalSessions ?? 0,
      highestWpm: metrics?.highestWpm ?? 0,
      // 'avg' in SQL returns a string, cast to number
      avgAccuracy: Math.round(Number(metrics?.avgAccuracy ?? 0)),
      avgWpm: stats?.avgWpm ?? 0, // Using the cached value in userStats
      totalTyped: stats?.totalTyped ?? 0,
      streak: stats?.streak ?? 0,
    },
    recentSessions
  };
}