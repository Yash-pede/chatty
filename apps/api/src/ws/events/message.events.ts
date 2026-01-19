import { Server, Socket } from "socket.io";
import { RedisManager } from "@/redis/RedisManager.js";
import { InsertMessage } from "@repo/db/types";
import { insertMessage } from "@/modules/messages/messages.service.js";
import { getConversationParticipantsByConversationId } from "@/modules/conversations/conversations.service.js";

export function registerMessageEvents(io: Server, socket: Socket) {
  const redis = RedisManager.get();
  socket.on("message:send", async (payload: InsertMessage) => {
    const insertedMessage = await insertMessage(payload);
    const { conversationId } = payload;

    // logger.info({
    //   event: "message:new",
    //   payload,
    // });

    const membersKey = `conversation:${conversationId}:members`;
    let members = await redis.pub.smembers(membersKey);

    if (!members || members.length === 0) {
      const rows =
        await getConversationParticipantsByConversationId(conversationId);
      members = rows.map((r) => r.userId);
      await redis.pub.sadd(membersKey, members);
      // UPDATE: expire in a min
      await redis.pub.expire(membersKey, 3600 * 60);
    }

    //TODO: UnredCount

     await redis.pub.publish(
      `conversation:${conversationId}`,
      JSON.stringify(insertedMessage),
    );
  });
}
