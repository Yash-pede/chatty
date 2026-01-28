import { Server, Socket } from "socket.io";
import { RedisManager } from "@/redis/RedisManager.js";
import { InsertMessage } from "@repo/db/types";
import { insertMessage } from "@/modules/messages/messages.service.js";
import { logger } from "@/core/logger.js";

export function registerMessageEvents(io: Server, socket: Socket) {
  const redis = RedisManager.get();
  socket.on("message:send", async (payload: InsertMessage, callback) => {
    try {
      const { conversationId } = payload;

      // logger.info({
      //   event: "message:new",
      //   payload,
      // });
      const insertedMessage = await insertMessage(payload);

      // const membersKey = `conversation:${conversationId}:members`;
      // let members = await redis.pub.smembers(membersKey);
      //
      // if (!members || members.length === 0) {
      //   const rows =
      //     await getConversationParticipantsByConversationId(conversationId);
      //   members = rows.map((r) => r.userId);
      //   await redis.pub.sadd(membersKey, members);
      //   // UPDATE: expire in a min
      //   await redis.pub.expire(membersKey, 3600 * 60);
      // }

      //TODO: UnredCount

      await redis.pub.publish(
        `conversation:${conversationId}`,
        JSON.stringify({ message: insertedMessage, senderSocketId: socket.id }),
      );

      if (callback) {
        callback({ status: "ok", data: insertedMessage });
      }
    } catch (e) {
      logger.error(e);
      if (callback) callback({ status: "error" });
    }
  });
}
