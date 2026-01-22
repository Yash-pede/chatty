import { conversationsDao } from "@/modules/conversations/conversations.dao.js";
import {
  InsertConversation,
  InsertConversationParticipants,
} from "@repo/db/types";
import { BadRequestError } from "@/core/errors/AppError.js";
import { getMessages } from "@/modules/messages/messages.service.js";

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
) => {
  const participant = await conversationsDao.getConversatioParticipant(
    conversationId,
    userId,
  );
  if (participant.length === 0) {
    throw new BadRequestError("User is not part of the conversation", 403);
  }

  const messages = await getMessages(conversationId, limit, cursor);
  const hasMore = messages.length > limit;
  const items = hasMore ? messages.slice(0, limit) : messages;
  const nextCursor = items.length > 0 ? items[items.length - 1].sequence : null;
  return {
    items,
    pageInfo: {
      hasMore,
      nextCursor,
    },
  };
};
