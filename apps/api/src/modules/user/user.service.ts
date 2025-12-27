import { InsertUser } from "./user.type.js";
import { userDao } from "@/modules/user/user.dao.js";

export const createUser = (data: InsertUser) => {
  return userDao.createUser(data);
};

export const updateUser = (data: InsertUser) => {
  return userDao.updateUser(data);
}

export const deleteUser = (data: InsertUser) => {
  return userDao.deleteUser(data.id);
}
