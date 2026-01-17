import { conversationsDao } from "@/modules/conversations/conversations.dao.js";
import {
  InsertConversation,
  InsertConversationParticipants,
} from "@repo/db/types";

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
