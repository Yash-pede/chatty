import { InsertMessage, Message } from "@repo/db/types";
import db from "@/config/db.drizzle.js";
import { messages } from "@repo/db/schema";

export const messagesDao = {
  insertMessage: async (data: InsertMessage): Promise<Message> => {
    const [message] = await db.insert(messages).values(data).returning();

    return message!;
  },
};
