import {
  Conversation,
  InsertConversation,
  InsertConversationParticipants,
} from "@repo/db/types";
import { conversationParticipants, conversations } from "@repo/db/schema";
import { logger } from "@/core/logger.js";
import db from "@/config/db.drizzle.js";
import { desc, eq } from "drizzle-orm";

export const conversationsDao = {
  createConversation: async (
    data: InsertConversation,
  ): Promise<Conversation> => {
    logger.info(`Creating conversation ${data}`);
    const [conversation] = await db
      .insert(conversations)
      .values(data)
      .returning();

    return conversation!;
  },
  createConversationParticipant: async (
    data: InsertConversationParticipants,
  ) => {
    logger.info("Creating conversation participant participant");
    return db.insert(conversationParticipants).values(data);
  },
  getConversationsByUserId: async (userId: string) => {
    return db
      .select({
        conversationId: conversations.id,
        type: conversations.type,
        name: conversations.name,
        isClosed: conversations.isClosed,

        lastMessagePreview: conversations.lastMessagePreview,
        lastMessageAt: conversations.lastMessageAt,

        unreadCount: conversationParticipants.unreadCount,
        muted: conversationParticipants.muted,
        notificationsEnabled: conversationParticipants.notificationsEnabled,

        assignedAgentId: conversations.assignedAgentId,
        joinedAt: conversationParticipants.joinedAt,
      })
      .from(conversationParticipants)
      .innerJoin(
        conversations,
        eq(conversations.id, conversationParticipants.conversationId),
      )
      .where(eq(conversationParticipants.userId, userId))
      .orderBy(desc(conversations.lastMessageAt))
      .limit(50);
  },
};
