import { Server } from "socket.io";
import { RedisManager } from "@/redis/RedisManager.js";

export function setupRedisSubscriber(io: Server) {
  const redis = RedisManager.get().sub;

  redis.psubscribe("conversation:*");

  redis.on("pmessage", (_pattern, channel, raw) => {
    const message = JSON.parse(raw);
    const conversationId = channel.split(":")[1];
    // logger.info("message:new" + JSON.stringify(message));
    io.to(`conversation:${conversationId}`).emit("message:new", message);
  });
}
