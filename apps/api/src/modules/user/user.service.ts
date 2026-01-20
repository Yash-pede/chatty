import { userDao } from "@/modules/user/user.dao.js";
import { BadRequestError } from "@/core/errors/AppError.js";
import { ClerkUserUpdate, InsertUser } from "@repo/db/types";
import { rolesAndPermissionsDao } from "@/modules/roles_permissions/roles_permissions.dao.js";
import { clerkClient } from "@clerk/express";
import { RedisManager } from "@/redis/RedisManager.js";

export const createUser = async (data: InsertUser & { role: string }) => {
  const roles = await rolesAndPermissionsDao.getAllRoles();

  const targetRole =
    roles.find((r) => r.name === data.role) ||
    roles.find((r) => r.name === "user");

  if (!targetRole)
    throw new BadRequestError("Invalid role configuration in database");

  await userDao.createUser(data);
  await userDao.setUserRole(targetRole.id, data.id);
  const permissions = await rolesAndPermissionsDao.getRolePermissions(
    targetRole.id,
  );
  const permissionIds = permissions.map((p) => p.permissionId);
  const permissionNames = await rolesAndPermissionsDao.getPermissions(
    ...permissionIds,
  );

  await userDao.updateClerkPublicMetadata(data.id, {
    role: targetRole.name,
    permissions: permissionNames.map((p) => p.key),
  });

  return { success: true };
};

export const getUserById = async (id: string) => userDao.getUserById(id);

export const updateUser = async (
  data: Partial<InsertUser> & { id: string },
) => {
  const userData = await getUserById(data.id);
  if (!userData || !userData.id) throw new BadRequestError("Invalid id");
  if (await userDao.getIsUserDeleted(userData.id))
    throw new BadRequestError("User Deleted");
  return userDao.updateUser(userData.id, data);
};

export const deleteUser = async (clerkId: string) =>
  userDao.deleteUser(clerkId);

export const updateClerkUser = async (
  userId: string,
  params: ClerkUserUpdate,
) => {
  return await clerkClient.users.updateUser(userId, params);
};

export const getUserPresence = async (userId: string) => {
  const redis = RedisManager.get();
  const presence = await redis.pub.get(`presence:${userId}`);
  // logger.info(`${userId} is ${presence}`);
  return presence ?? "offline";
};
