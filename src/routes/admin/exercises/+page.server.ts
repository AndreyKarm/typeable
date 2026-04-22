import { db } from "$lib/server/db";
import { exercise } from "$lib/server/db/typeable.schema";
import { fail, type Actions } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function load() {
  const items = await db.query.exercise.findMany({
    with: { author: true },
    orderBy: (e, { desc }) => [desc(e.createdAt)]
  });

  return { exercises: items }
}

export const actions: Actions = {
  submitExercise: async (event) => {
    if (!event.locals.user) return fail(401, { message: "Unauthorized" });
    const formData = await event.request.formData();
    const content = formData.get('content')?.toString();
    const time = Number(formData.get('time'));

    if (!content || content.length < 12) return fail(400, { message: "Content too short" });
    if (isNaN(time) || time < 10) return fail(400, { message: "Invalid time (min 10s)" });

    await db.insert(exercise).values({ type: "system", content, time });
    return { success: true };
  },

  deleteExercise: async (event) => {
    const user = event.locals.user;
    if (!user) return fail(401, { message: "Unauthorized" });

    const formData = await event.request.formData();
    const id = Number(formData.get('id'));

    // Check if user is author OR admin
    const exerciseToDelete = await db.query.exercise.findFirst({ where: eq(exercise.id, id) });
    if (!exerciseToDelete || (exerciseToDelete.authorId !== user.id && user.role !== 'admin')) {
      return fail(403, { message: "Forbidden" });
    }

    await db.delete(exercise).where(eq(exercise.id, id));
    return { success: true };
  },

  updateExercise: async (event) => {
    const user = event.locals.user;
    if (!user) return fail(401, { message: "Unauthorized" });

    const formData = await event.request.formData();
    const id = Number(formData.get('id'));
    const content = formData.get('content')?.toString();
    const time = Number(formData.get('time'));

    if (!content || content.length < 12) return fail(400, { message: "Content too short" });
    if (isNaN(time) || time < 10) return fail(400, { message: "Invalid time" });

    // Check if user is author OR admin
    const exerciseToUpdate = await db.query.exercise.findFirst({ where: eq(exercise.id, id) });
    if (!exerciseToUpdate || (exerciseToUpdate.authorId !== user.id && user.role !== 'admin')) {
      return fail(403, { message: "Forbidden" });
    }

    await db.update(exercise).set({ content, time }).where(eq(exercise.id, id));
    return { success: true };
  }
}