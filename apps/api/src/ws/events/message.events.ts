import { Server, Socket } from "socket.io";
import { RedisManager } from "@/redis/RedisManager.js";
import { InsertMessage } from "@repo/db/types";
import { insertMessage } from "@/modules/messages/messages.service.js";
import { logger } from "@/core/logger.js";
// Import the new function
import { getConversationMemberIds } from "@/modules/conversations/conversations.service.js";

export function registerMessageEvents(io: Server, socket: Socket) {
  const redis = RedisManager.get();

  socket.on("message:send", async (payload: InsertMessage, callback) => {
    try {
      const { conversationId } = payload;

      const insertedMessage = await insertMessage(payload);

      const members = await getConversationMemberIds(conversationId);

      // TODO: Loop through 'members' to increment unread counts in Redis

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
