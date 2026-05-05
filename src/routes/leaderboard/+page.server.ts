import { db } from '$lib/server/db';
import { userStats } from '$lib/server/db/typeable.schema';
import { user } from '$lib/server/db/auth.schema';
import { desc, eq } from 'drizzle-orm';

export async function load() {
  // Get the top 50 leaders
  const leadersResult = await db.select({
    userId: user.id,
    name: user.name,
    avgWpm: userStats.avgWpm,
    totalTyped: userStats.totalTyped,
  })
    .from(userStats)
    .innerJoin(user, eq(userStats.userId, user.id))
    .orderBy(desc(userStats.avgWpm)) // Order by average WPM
    .limit(50);                      // Limit to 50 results 

  // Add a rank property to each user
  const leaders = leadersResult.map((u, i) => ({
    ...u,
    rank: i + 1
  }));

  // Return the top 50 leaders
  return { leaders };
}