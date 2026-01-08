import { api } from "@/lib/axios.ts";
import { ConversationWithOtherUser } from "@repo/db/types";

export async function getAllUserConversations(userId: string) {
  const res = await api.get(`/conversations/${userId}`);
  return res.data as Array<ConversationWithOtherUser>;
}
