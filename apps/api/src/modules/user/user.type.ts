import { users } from "@/config/database/schema.js";

export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;