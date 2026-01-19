import { Server } from "socket.io";
import { RedisManager } from "@/redis/RedisManager.js";
import { handleNewMessageSubscription } from "@/redis/subscribersHandler/newMessage.js";

export function setupRedisSubscriber(io: Server) {
  const redis = RedisManager.get().sub;

  redis.psubscribe("conversation:*");

  redis.on("pmessage", (_pattern, channel, raw) => {
    if (channel.startsWith("conversation:"))
      handleNewMessageSubscription(io, { channel, raw });
  });
}
