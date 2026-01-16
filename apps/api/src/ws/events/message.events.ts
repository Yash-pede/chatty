import { Server, Socket } from "socket.io";
import { logger } from "@/core/logger.js";
import { RedisManager } from "@/redis/RedisManager.js";
import { InsertMessage } from "@repo/db/types";

export function registerMessageEvents(io: Server, socket: Socket) {
  const redis = RedisManager.get();
  socket.on("message:new", async (payload: InsertMessage) => {
    const userId = socket.data.userId;
    logger.info({
      event: "message:new",
      userId,
      payload,
    });

    await redis.pub.publish(
      // `channel:conversation:${payload.conversationId}`,
      "message:new",
      JSON.stringify(payload),
    );
  });
}
