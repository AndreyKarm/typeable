import { db } from "$lib/server/db";
import { userStats } from "$lib/server/db/typeable.schema";
import { user } from "$lib/server/db/schema";
import { desc } from "drizzle-orm";
import { eq } from 'drizzle-orm';

export async function load() {
  const leaderboard = await db
    .select({
      userId: user.id,
      name: user.name,
      xp: userStats.xp,
      avgWpm: userStats.avgWpm,
      streak: userStats.streak,
    })
    .from(userStats)
    .innerJoin(user, eq(userStats.userId, user.id))
    .orderBy(desc(userStats.xp));

  return { leaderboard };
}