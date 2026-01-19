import { InsertMessage, Message } from "@repo/db/types";
import db from "@/config/db.drizzle.js";
import { messages } from "@repo/db/schema";
import { and, desc, eq, lt } from "drizzle-orm";

export const messagesDao = {
  insertMessage: async (data: InsertMessage): Promise<Message> => {
    const [message] = await db.insert(messages).values(data).returning();

    return message!;
  },
  getMessages: async (
    conversationId: string,
    limit: number,
    cursor?: number,
  ) => {
    const whereClause = cursor
      ? and(
          eq(messages.conversationId, conversationId),
          lt(messages.sequence, cursor),
        )
      : eq(messages.conversationId, conversationId);

    return db
      .select({
        id: messages.id,
        sequence: messages.sequence,
        senderId: messages.senderId,
        conversationId: messages.conversationId,
        content: messages.content,
        type: messages.type,
        clientMessageId: messages.clientMessageId,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(whereClause)
      .orderBy(desc(messages.sequence))
      .limit(limit + 1); // 👈 fetch extra row
  },
};
