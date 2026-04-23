import { db } from '$lib/server/db';
import { userStats } from '$lib/server/db/typeable.schema';
import { user } from '$lib/server/db/auth.schema';
import { desc, eq } from 'drizzle-orm';

export async function load() {
  // Query top 50 users by average WPM
  const leaders = await db.select({
    userId: user.id,
    name: user.name,
    avgWpm: userStats.avgWpm,
    totalTyped: userStats.totalTyped,
  })
    .from(userStats)
    .innerJoin(user, eq(userStats.userId, user.id))
    .orderBy(desc(userStats.avgWpm))
    .limit(50);

  return { leaders };
}