import { InsertUser } from "./user.type.js";
import { userDao } from "@/modules/user/user.dao.js";
import { BadRequestError } from "@/core/errors/AppError.js";

export const createUser = async (data: InsertUser & { role: string }) => {
  const roles = await userDao.getAllRoles();
  const role =
    roles.find((role) => role.name === data.role) ??
    roles.find((role) => role.name === "user");
  if (!role || role.id) throw new BadRequestError("Invalid role");
  await userDao.setUserRole(role.id, data.id);
  await userDao.updateClerkPublicMetadata(data.id, role.name);
  return await userDao.createUser(data);
};

export const updateUser = async (data: InsertUser & { role: string }) => {
  return await userDao.updateUser(data);
};

export const deleteUser = async (data: InsertUser & { role: string }) => {
  return await userDao.deleteUser(data.id);
};
