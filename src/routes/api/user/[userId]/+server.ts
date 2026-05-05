import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { userStats } from '$lib/server/db/typeable.schema';
import { eq } from 'drizzle-orm';

export async function GET({ params }) {
  // Fetch the user stats from the database
  const stats = await db.select()
    .from(userStats)
    .where(eq(userStats.userId, params.userId))
    .limit(1); // Limit to 1 result

  // Return the user stats as JSON
  return json(stats[0] || {});
}