import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  serial,
  integer,
  decimal,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  phoneNumber: varchar("phone_number", { length: 20 }),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  dietaryPreferences: jsonb("dietary_preferences").$type<string[]>().default([]),
  streakCount: integer("streak_count").default(0),
  avgEatRate: decimal("avg_eat_rate", { precision: 5, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: varchar("image_url", { length: 255 }),
  category: varchar("category", { length: 50 }),
  nutritionalInfo: jsonb("nutritional_info").$type<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>(),
  isAvailable: boolean("is_available").default(true),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  status: varchar("status", { length: 30 }).default("placed"),
  deliveryAddress: text("delivery_address"),
  deliveryTime: timestamp("delivery_time"),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  pledgeConfirmed: boolean("pledge_confirmed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  itemId: integer("item_id").references(() => items.id),
  quantity: integer("quantity").default(1),
});

export const eatRateConfirmations = pgTable("eat_rate_confirmations", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  userId: integer("user_id").references(() => users.id),
  percentageEaten: integer("percentage_eaten"),
  confirmedAt: timestamp("confirmed_at").defaultNow(),
});

export const friends = pgTable("friends", {
  id: serial("id").primaryKey(),
  userId1: integer("user_id_1").references(() => users.id),
  userId2: integer("user_id_2").references(() => users.id),
  status: varchar("status", { length: 20 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  orderId: integer("order_id").references(() => orders.id),
  rating: integer("rating"),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  streakCount: true,
  avgEatRate: true,
  dietaryPreferences: true,
  passwordHash: true,
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertEatRateSchema = createInsertSchema(eatRateConfirmations).omit({
  id: true,
  confirmedAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Item = typeof items.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type EatRateConfirmation = typeof eatRateConfirmations.$inferSelect;
export type Friend = typeof friends.$inferSelect;
export type Feedback = typeof feedback.$inferSelect;
