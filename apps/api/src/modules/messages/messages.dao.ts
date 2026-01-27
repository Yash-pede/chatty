import { InsertMessage, Message } from "@repo/db/types";
import db from "@/config/db.drizzle.js";
import { messages } from "@repo/db/schema";
import { and, asc, desc, eq, gt, lt } from "drizzle-orm";

export const messagesDao = {
  insertMessage: async (data: InsertMessage): Promise<Message> => {
    const [message] = await db.insert(messages).values(data).returning();

    return message!;
  },
  getMessages: async (
    conversationId: string,
    limit: number,
    binaryOperation: "gt" | "lt",
    cursor?: number,
  ) => {
    const isForward = binaryOperation === "gt";
    const orderBy = isForward
      ? asc(messages.sequence)
      : desc(messages.sequence);

    const whereClause = cursor
      ? and(
          eq(messages.conversationId, conversationId),
          isForward
            ? gt(messages.sequence, cursor)
            : lt(messages.sequence, cursor),
        )
      : eq(messages.conversationId, conversationId);

    return db
      .select()
      .from(messages)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit);
  },
};
