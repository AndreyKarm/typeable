import { db } from '$lib/server/db';
import { error, redirect } from '@sveltejs/kit';

export async function load() {
  const exercises = await db.query.exercise.findMany();
  if (!exercises.length) throw error(404, 'No exercises found');

  const random = exercises[Math.floor(Math.random() * exercises.length)];

  redirect(307, `/exercise/${random.id}`)
}