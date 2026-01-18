import { api } from "@/lib/axios.ts";
import { MessagesFetchResponse } from "@repo/db/types";

export async function getPaginatedMessages(
  conversationId: string,
  cursor?: number,
  limit?: number,
) {
  const res = await api.get(`/conversations/${conversationId}/messages`, {
    params: {
      cursor,
      limit,
    },
  });
  return res.data as MessagesFetchResponse;
}
