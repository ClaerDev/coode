"use server";

import { z } from "zod";
import { getCurrentUser } from "@/app/services/clerk";
import {
  canCreateLessons,
  canDeleteLessons,
  canUpdateLessons,
} from "../permissions/lessons";
import {
  getNextCourseLessonOrder,
  insertLesson,
  updateLesson as updateLessonDB,
  deleteLesson as deleteLessonDB,
  updateLessonOrders as updateLessonOrderDB,
} from "../db/lessons";
import { lessonSchema } from "../schemas/lessons";

export async function createLesson(unsafeData: z.infer<typeof lessonSchema>) {
  const { success, data } = lessonSchema.safeParse(unsafeData);

  if (!success || !canCreateLessons(await getCurrentUser())) {
    return { error: true, message: "There was an error creating your lesson" };
  }

  const order = await getNextCourseLessonOrder(data.sectionId);

  await insertLesson({ ...data, order });

  return { error: false, message: "Successfully created your lesson" };
}

export async function updateLesson(
  id: string,
  unsafeData: z.infer<typeof lessonSchema>
) {
  const { success, data } = lessonSchema.safeParse(unsafeData);

  if (!success || !canUpdateLessons(await getCurrentUser())) {
    return { error: true, message: "There was an error updating your lesson" };
  }
  await updateLessonDB(id, data);
  return { error: false, message: "Successfully updated your lesson" };
}

export async function deleteLesson(id: string) {
  if (!canDeleteLessons(await getCurrentUser())) {
    return { error: true, message: "There was an error deleting your lesson" };
  }

  await deleteLessonDB(id);
  return { error: false, message: "Successullly deleted your lesson" };
}

export async function updateLessonOrders(lessonIds: string[]) {
  if (lessonIds.length === 0 || !canUpdateLessons(await getCurrentUser())) {
    return { error: true, message: "Error reordering your sections" };
  }
  await updateLessonOrderDB(lessonIds);
  return { error: false, message: "Successullly reordered your lessons" };
}
