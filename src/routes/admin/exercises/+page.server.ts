import { db } from "$lib/server/db";
import { exercise } from "$lib/server/db/typeable.schema";
import { fail, type Actions } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function load() {
  // Fetch all exercises from the database
  const items = await db.query.exercise.findMany({
    with: { author: true },                       // Include the author
    orderBy: (e, { desc }) => [desc(e.createdAt)] // Order by createdAt descending
  });

  // Return the exercises
  return { exercises: items }
}

export const actions: Actions = {
  submitExercise: async (event) => {
    // Check if the user is logged in
    if (!event.locals.user) return fail(401, { message: "Unauthorized" });
    const formData = await event.request.formData();
    const content = formData.get('content')?.toString();
    const time = Number(formData.get('time'));

    // Check if the content is provided
    if (!content || content.length < 12) return fail(400, { message: "Content too short" });
    if (isNaN(time) || time < 10) return fail(400, { message: "Invalid time (min 10s)" });

    // Insert the exercise into the database
    await db.insert(exercise).values({ type: "system", content, time });

    // Return a success message
    return { success: true };
  },

  deleteExercise: async (event) => {
    // Check if the user is logged in
    const user = event.locals.user;
    if (!user) return fail(401, { message: "Unauthorized" });

    const formData = await event.request.formData();
    const id = Number(formData.get('id'));

    // Check if user is author OR admin
    const exerciseToDelete = await db.query.exercise.findFirst({ where: eq(exercise.id, id) });
    if (!exerciseToDelete || (exerciseToDelete.authorId !== user.id && user.role !== 'admin')) {
      return fail(403, { message: "Forbidden" });
    }

    // Delete the exercise from the database
    await db.delete(exercise).where(eq(exercise.id, id));

    // Return a success message
    return { success: true };
  },

  updateExercise: async (event) => {
    // Check if the user is logged in
    const user = event.locals.user;
    if (!user) return fail(401, { message: "Unauthorized" });

    const formData = await event.request.formData();
    const id = Number(formData.get('id'));
    const content = formData.get('content')?.toString();
    const time = Number(formData.get('time'));

    // Check if the content is provided
    if (!content || content.length < 12) return fail(400, { message: "Content too short" });
    if (isNaN(time) || time < 10) return fail(400, { message: "Invalid time" });

    // Check if user is author OR admin
    const exerciseToUpdate = await db.query.exercise.findFirst({ where: eq(exercise.id, id) });
    if (!exerciseToUpdate || (exerciseToUpdate.authorId !== user.id && user.role !== 'admin')) {
      return fail(403, { message: "Forbidden" });
    }

    // Update the exercise in the database
    await db.update(exercise).set({ content, time }).where(eq(exercise.id, id));

    // Return a success message
    return { success: true };
  }
}