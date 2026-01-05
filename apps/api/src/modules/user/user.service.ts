import { InsertUser } from "./user.type.js";
import { userDao } from "@/modules/user/user.dao.js";
import { BadRequestError } from "@/core/errors/AppError.js";

export const createUser = async (data: InsertUser & { role: string }) => {
  const roles = await userDao.getAllRoles();

  const targetRole =
    roles.find((r) => r.name === data.role) ||
    roles.find((r) => r.name === "user");

  if (!targetRole)
    throw new BadRequestError("Invalid role configuration in database");

  await userDao.createUser(data);
  await userDao.setUserRole(targetRole.id, data.id);

  await userDao.updateClerkPublicMetadata(data.id, targetRole.name);

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
