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

export const getAllUserConversations = async (userId: string) => {
  return conversationsDao.getConversationsByUserId(userId);
};
