import { InsertUser } from "./user.type.js";
import { userDao } from "@/modules/user/user.dao.js";
import { BadRequestError } from "@/core/errors/AppError.js";

const cleanUpdateData = (data: Partial<InsertUser>) => {
  return Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined),
  );
};

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

export const updateUser = async (
  data: Partial<InsertUser> & { id: string },
) => {
  const filteredData = cleanUpdateData(data);

  const { id, ...updateFields } = filteredData;

  return await userDao.updateUser(id as string, updateFields);
};

export const deleteUser = async (clerkId: string) => {
  return await userDao.deleteUser(clerkId);
};
