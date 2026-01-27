import { api } from "@/lib/axios.ts";
import { MessagesFetchResponse } from "@repo/db/types";

export async function getPaginatedMessages(
  conversationId: string,
  limit: number = 50,
  direction: "forward" | "backward" = "forward",
  cursor?: number,
) {
  const res = await api.get(`/conversations/${conversationId}/messages`, {
    params: {
      limit,
      cursor,
      direction,
    },
  });
  return res.data as MessagesFetchResponse;
}
