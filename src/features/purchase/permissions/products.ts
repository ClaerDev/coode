import { UserRole } from "@/drizzle/schema"

export function canRefundPurchases({ role }: { role: UserRole | undefined }) {
  return role === "admin"
}