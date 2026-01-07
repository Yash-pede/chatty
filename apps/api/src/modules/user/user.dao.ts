import db from "@/config/db.drizzle.js";
import { userRoles, users } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/express";
import { InsertUser } from "@repo/db/types";

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
  updateClerkPublicMetadata: async (
    userId: string,
    params: { role: string; permissions: string[] },
    ...args: any[]
  ) => {
    const { role = "user", permissions = [] } = params;
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role,
        permissions,
        ...args,
      },
    });
  },
  setUserRole: async (roleId: number, userId: string) => {
    return db.insert(userRoles).values({
      roleId,
      userId,
    });
  },
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
