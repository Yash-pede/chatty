import { api } from "@/lib/axios.ts";
import { MessagesFetchResponse } from "@repo/db/types";

export async function getPaginatedMessages(
  conversationId: string,
  limit?: number,
  cursor?: number,
) {
  const res = await api.get(`/conversations/${conversationId}/messages`, {
    params: {
      limit,
      cursor,
    },
  });
  return res.data as MessagesFetchResponse;
}
