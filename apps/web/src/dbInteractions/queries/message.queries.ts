import { api } from "@/lib/axios"
import { Message } from "@repo/db/types"

export const getMessagesFromServer = async (conversationId: string, limit: number) => {
    const res = await api.get(`conversations/${conversationId}/messages?limit=${limit}`)
    return res.data as {
        items: Message[],
        pageInfo: {
            hasMore: boolean,
            nextCursor: number
        }
    }
}