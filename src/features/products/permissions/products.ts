import { UserRole } from "@/drizzle/schema";

export function canCreateProducts({
  role,
}: {
  role: UserRole | undefined;
}) {
  return role === "admin";
}

export function canUpdateProducts({
  role,
}: {
  role: UserRole | undefined;
}) {
  return role === "admin";
}

export function canDeleteProducts({
  role,
}: {
  role: UserRole | undefined;
}) {
  return role === "admin";
}
