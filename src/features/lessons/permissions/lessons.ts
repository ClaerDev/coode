import { LessonTable, UserRole } from "@/drizzle/schema";
import { eq, or } from "drizzle-orm";

export function canCreateLessons({ role }: { role: UserRole | undefined }) {
  return role === "admin";
}

export function canUpdateLessons({ role }: { role: UserRole | undefined }) {
  return role === "admin";
}

export function canDeleteLessons({ role }: { role: UserRole | undefined }) {
  return role === "admin";
}
export const wherePublicLessons = or(
  eq(LessonTable.status, "public"),
  eq(LessonTable.status, "preview")
);
