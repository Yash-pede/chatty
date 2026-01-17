import { InsertMessage } from "@repo/db/types";
import { messagesDao } from "@/modules/messages/messages.dao.js";

export const insertMessage = (data: InsertMessage) => {
  return messagesDao.insertMessage(data);
};
