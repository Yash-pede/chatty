import { InsertMessage } from "@repo/db/types";
import { messagesDao } from "@/modules/messages/messages.dao.js";

export const insertMessage = (data: InsertMessage) => {
  return messagesDao.insertMessage(data);
};

export const getMessages = (
  conversationId: string,
  limit: number,
  direction: "forward" | "backward" = "forward",
  cursor?: number,
) => {
  return messagesDao.getMessages(
    conversationId,
    limit,
    direction === "forward" ? "gt" : "lt",
    cursor,
  );
};

export const getMessage = async (messageId: string) => {
  const [message] = await messagesDao.getMessage(messageId);
  return message;
};
