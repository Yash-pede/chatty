import { conversationsDao } from "@/modules/conversations/conversations.dao.js";
import {
  InsertConversation,
  InsertConversationParticipants,
} from "@repo/db/types";
import { ApiError } from "@/core/errors/AppError.js";
import { getMessages } from "@/modules/messages/messages.service.js";
import { RedisManager } from "@/redis/RedisManager.js";

export const createConversationWithParticipants = async (
  data: InsertConversation,
  participants: Array<{ userId: string; role: string }>,
) => {
  const conversation = await conversationsDao.createConversation(data);
  for (const participant of participants) {
    await createConversationParticipants({
      userId: participant.userId,
      role: participant.role,
      conversationId: conversation.id,
    });
  }
  return conversation;
};

export const createConversationParticipants = async (
  data: InsertConversationParticipants,
) => {
  return conversationsDao.createConversationParticipant(data);
};

export const getConversationsByUserIdWithParticipants = async (
  userId: string,
) => {
  //TODO: GET conversation with other users by conversatino type === direct | group
  return conversationsDao.getConversationsByUserIdWithParticipants(userId);
};

export const getConversationById = async (
  conversationId: string,
  currentUserId: string,
) => {
  const [conversation] = await conversationsDao.getConversationById(
    conversationId,
    currentUserId,
  );
  return conversation;
};

export const getConversationParticipantsByConversationId = async (
  conversationId: string,
): Promise<Array<{ userId: string }>> => {
  return conversationsDao.getConversationParticipantsByConversationId(
    conversationId,
  );
};

export const getConversationMessages = async (
  conversationId: string,
  userId: string,
  limit: number,
  cursor?: number,
  direction: "forward" | "backward" = "forward",
) => {
  const participant = await conversationsDao.getConversatioParticipant(
    conversationId,
    userId,
  );
  if (participant.length === 0) {
    throw new ApiError("User is not part of the conversation", 403);
  }

  const messages = await getMessages(
    conversationId,
    limit + 1,
    direction,
    cursor,
  );
  const hasMore = messages.length > limit;
  const items = hasMore ? messages.slice(0, limit) : messages;
  const nextCursor =
    items.length > 0
      ? direction === "forward"
        ? items[items.length - 1].sequence
        : items[0].sequence
      : null;
  return {
    items,
    pageInfo: {
      hasMore,
      nextCursor,
    },
  };
};

export const getConversationMemberIds = async (
  conversationId: string,
): Promise<string[]> => {
  const redis = RedisManager.get().pub;
  const cacheKey = `conversation:${conversationId}:members`;

  // 1. Try to get from Cache
  const cachedMembers = await redis.smembers(cacheKey);

  if (cachedMembers && cachedMembers.length > 0) {
    return cachedMembers;
  }

  // 2. Cache Miss: Fetch from DB
  const rows =
    await conversationsDao.getConversationParticipantsByConversationId(
      conversationId,
    );

  // Flatten to string array
  const userIds = rows.map((r) => r.userId);

  // 3. Store in Redis (if we found members)
  if (userIds.length > 0) {
    const pipeline = redis.pipeline();

    // SADD accepts an array in ioredis
    pipeline.sadd(cacheKey, userIds);

    // Set Expiry: 1 hour (3600s).
    // 60 hours (3600*60) is usually too long for permissions cache.
    pipeline.expire(cacheKey, 3600);

    await pipeline.exec();
  }

  return userIds;
};