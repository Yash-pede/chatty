import { InsertUser } from "@/modules/user/user.type.js";
import db from "@/config/db.drizzle.js";
import { roles, userRoles, users } from "@/config/database/schema.js";
import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/express";

export const userDao = {
  getUserById: async (id: string) => {
    return db.query.users.findFirst({
      where: eq(users.id, id),
    });
  },
  createUser: async (data: InsertUser) => {
    return db.insert(users).values(data);
  },
  updateUser: async (userId: string, data: Partial<InsertUser>) => {
    return db.update(users).set(data).where(eq(users.id, userId));
  },
  deleteUser: async (userId: string) => {
    return db.update(users).set({ deleted: true }).where(eq(users.id, userId));
  },
  updateClerkPublicMetadata: async (userId: string, role = "user") => {
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role,
      },
    });
  },
  setUserRole: async (roleId: number, userId: string) => {
    return db.insert(userRoles).values({
      roleId,
      userId,
    });
  },
  getAllRoles: async () => await db.select().from(roles),
  getIsUserDeleted: async (id: string) => {
    const userData = await db
      .select({
        id: users.id,
        deleted: users.deleted,
      })
      .from(users)
      .where(eq(users.id, id));
    return userData[0].deleted;
  },
};
