import { api } from "@/lib/axios.ts";
import { ConversationWithOtherUser } from "@repo/db/types";

export async function getAllUserConversations() {
  const res = await api.get(`/conversations`);
  return res.data as Array<ConversationWithOtherUser>;
}
