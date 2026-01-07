import db from "@/config/db.drizzle.js";
import { permissions, rolePermissions, roles } from "@repo/db/schema";
import { eq, inArray } from "drizzle-orm";

export const rolesAndPermissionsDao = {
  getAllRoles: async () => await db.select().from(roles),
  getRolePermissions: async (roleId: number) =>
    await db
      .select()
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, roleId)),
  getPermissions: async (...permissionIds: number[]) => {
    if (permissionIds.length == 0) return [];
    return db
      .select()
      .from(permissions)
      .where(inArray(permissions.id, permissionIds));
  },
};
