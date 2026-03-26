import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const roomsTable = pgTable("network_rooms", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  type: text("type").notNull().default("custom"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messagesTable = pgTable("network_messages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").notNull(),
  message: text("message").notNull(),
  responses: text("responses").array().notNull().default([]),
  roomId: integer("room_id"),
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
export type Room = typeof roomsTable.$inferSelect;
