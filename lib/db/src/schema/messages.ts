import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const messagesTable = pgTable("network_messages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").notNull(),
  message: text("message").notNull(),
  responses: text("responses").array().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const signalThreadsTable = pgTable("signal_threads", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  signalId: integer("signal_id").notNull(),
  userId: text("user_id").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messagesTable);
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messagesTable.$inferSelect;
