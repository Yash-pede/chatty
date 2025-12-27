import { InsertUser } from "@/modules/user/user.type.js";
import db from "@/config/db.drizzle.js";
import { users } from "@/config/database/schema.js";
import { eq } from "drizzle-orm";

export const userDao = {
  createUser: async (data: InsertUser) => {
    return db.insert(users).values(data);
  },
  updateUser: async (data: InsertUser) => {
    return db.update(users).set(data).where(eq(users.id, data.id));
  },
  deleteUser: async (userId: string) => {
    return db.update(users).set({ deleted: true }).where(eq(users.id, userId));
  },
};
