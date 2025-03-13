import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { relations } from "drizzle-orm";
import { UserCourseAccessTable } from "./userCourseAccess";

export const userRoles = ["admin", "user"] as const;
export type UserRole = (typeof userRoles)[number];
export const userRoleEnum = pgEnum("user_role", userRoles);

export const UserTable = pgTable("users", {
    id,
    clerkUserId: text().notNull().unique(),
    email: text().notNull().unique(),
    name: text().notNull(),
    role: userRoleEnum().notNull().default("user"),
    imageUrl: text(),
    deletedAt: timestamp({ withTimezone: true }),
    createdAt,
    updatedAt,
});

export const UserRelationships = relations(UserTable, ({ many }) => ({
   UserCourseAccessTable: many(UserCourseAccessTable), 
}));