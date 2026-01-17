import {
  Conversation,
  InsertConversation,
  InsertConversationParticipants,
} from "@repo/db/types";
import {
  conversationParticipants,
  conversations,
  users,
} from "@repo/db/schema";
import { logger } from "@/core/logger.js";
import db from "@/config/db.drizzle.js";
import { and, desc, eq, ne } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

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
  getConversationsByUserIdWithParticipants: async (currentUserId: string) => {
    const cpMe = conversationParticipants;
    const cpOther = alias(conversationParticipants, "cp_other");

    return db
      .select({
        conversationId: conversations.id,
        type: conversations.type,
        name: conversations.name,
        isClosed: conversations.isClosed,

        lastMessagePreview: conversations.lastMessagePreview,
        lastMessageAt: conversations.lastMessageAt,

        unreadCount: cpMe.unreadCount,
        muted: cpMe.muted,
        notificationsEnabled: cpMe.notificationsEnabled,
        joinedAt: cpMe.joinedAt,

        assignedAgentId: conversations.assignedAgentId,

        otherUser: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          userName: users.username,
          imageUrl: users.imageUrl,
        },
      })
      .from(cpMe)
      .innerJoin(conversations, eq(conversations.id, cpMe.conversationId))
      .innerJoin(
        cpOther,
        and(
          eq(cpOther.conversationId, conversations.id),
          ne(cpOther.userId, currentUserId),
        ),
      )
      .innerJoin(users, eq(users.id, cpOther.userId))
      .where(eq(cpMe.userId, currentUserId))
      .orderBy(desc(conversations.lastMessageAt))
      .limit(50);
  },
  getConversationById: async (
    conversationId: string,
    currentUserId: string,
  ) => {
    const cpMe = conversationParticipants;
    const cpOther = alias(conversationParticipants, "cp_other");

    return db
      .select({
        conversationId: conversations.id,
        type: conversations.type,
        name: conversations.name,
        isClosed: conversations.isClosed,

        lastMessagePreview: conversations.lastMessagePreview,
        lastMessageAt: conversations.lastMessageAt,

        unreadCount: cpMe.unreadCount,
        muted: cpMe.muted,
        notificationsEnabled: cpMe.notificationsEnabled,
        joinedAt: cpMe.joinedAt,

        assignedAgentId: conversations.assignedAgentId,

        otherUser: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          userName: users.username,
          imageUrl: users.imageUrl,
        },
      })
      .from(conversations)
      .innerJoin(
        cpMe,
        and(
          eq(cpMe.conversationId, conversations.id),
          eq(cpMe.userId, currentUserId),
        ),
      )
      .innerJoin(
        cpOther,
        and(
          eq(cpOther.conversationId, conversations.id),
          ne(cpOther.userId, currentUserId),
        ),
      )
      .innerJoin(users, eq(users.id, cpOther.userId))
      .where(eq(conversations.id, conversationId));
  },
  getConversationParticipantsByConversationId: async (
    conversationId: string,
  ) => {
    return db
      .select({ userId: conversationParticipants.userId })
      .from(conversationParticipants)
      .where(eq(conversationParticipants.conversationId, conversationId));
  },
};
