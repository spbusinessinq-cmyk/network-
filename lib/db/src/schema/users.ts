import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  alias: text("alias").notNull(),
  bio: text("bio").notNull().default("Awaiting classification."),
  statusLine: text("status_line").notNull().default("Active."),
  rsrId: text("rsr_id").notNull().unique(),
  role: text("role").notNull().default("Operator"),
  standing: text("standing").notNull().default("Observer"),
  grade: text("grade"),
  cardStyle: text("card_style").notNull().default("steel"),
  accessClass: text("access_class").notNull().default("STANDARD"),
  credentialMeaning: text("credential_meaning").notNull().default(""),
  presence: text("presence").notNull().default("Online"),
  joinDate: text("join_date").notNull(),
  contributionCount: integer("contribution_count").notNull().default(0),
  promotionStatus: text("promotion_status").notNull().default("Not Eligible"),
  reviewStatus: text("review_status").notNull().default("Pending"),
  isFounder: boolean("is_founder").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
