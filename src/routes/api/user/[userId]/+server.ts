import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { userStats } from '$lib/server/db/typeable.schema';
import { eq } from 'drizzle-orm';

export async function GET({ params }) {
  const stats = await db.select()
    .from(userStats)
    .where(eq(userStats.userId, params.userId))
    .limit(1);

  return json(stats[0] || {});
}