import { api } from "@/lib/axios.ts";
import { ConversationWithOtherUser } from "@repo/db/types";

export async function getAllUserConversations() {
  const res = await api.get(`/conversations`);
  return res.data as {
    success: boolean;
    data: Array<ConversationWithOtherUser>;
  };
}

export async function getConversation(conversationId: string) {
  const res = await api.get(`/conversations/${conversationId}`);
  return res.data as {
    success: boolean;
    data: ConversationWithOtherUser;
  };
}
