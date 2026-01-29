import { api } from "@/lib/axios.ts";
import { ConversationWithOtherUser, Message } from "@repo/db/types";

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

export async function getConversationPresence(conversationId: string) {
  const res = await api.get(`/conversations/${conversationId}/presence`);
  return res.data as Array<{ userId: string; status: "online" | "offline" }>;
}

export async function getConversationMessage(
  conversationId: string,
  messageId: string,
) {
  const res = await api.get(
    `/conversations/${conversationId}/messages/${messageId}`,
  );
  return res.data as Message;
}
