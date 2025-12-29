import { InsertUser } from "./user.type.js";
import { userDao } from "@/modules/user/user.dao.js";
import { BadRequestError } from "@/core/errors/AppError.js";

export const createUser = async (data: InsertUser & { role: string }) => {
  await userDao.updateClerkPublicMetadata(data.id, data.role);
  const roles = await userDao.getAllRoles();
  if (!roles.some((role) => role.name === data.role))
    throw new BadRequestError("Invalid role");
  const role = roles.find((role) => role.name === data.role);
  if (!role || role.id) throw new BadRequestError("Invalid role");
  await userDao.setUserRole(role.id, data.id);
  return await userDao.createUser(data);
};

export const updateUser = async (data: InsertUser & { role: string }) => {
  return await userDao.updateUser(data);
};

export const deleteUser = async (data: InsertUser & { role: string }) => {
  return await userDao.deleteUser(data.id);
};
