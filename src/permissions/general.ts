import { UserRole } from "@/drizzle/schema";

export function canAccessAdminPages({ role }: { role: UserRole | undefined }) {
  return role === "admin";
}
