import { Server, Socket } from "socket.io";
import { RedisManager } from "@/redis/RedisManager.js";
import { logger } from "@/core/logger.js";

export function registerPresenceEvents(io: Server, socket: Socket) {
  const userId = socket.data.userId;
  const redis = RedisManager.get();

  (async () => {
    try {
      await redis.pub.sadd(`socket:${userId}`, socket.id);
      await redis.pub.set(`presence:${userId}`, "online", "EX", 30);
      io.to(`presence:${userId}`).emit("presence:update", {
        userId,
        status: "online",
      });
    } catch (err) {
      logger.error({ err, userId }, "Failed to register presence");
    }
  })();

  const heartbeat = setInterval(() => {
    void redis.pub
      .expire(`presence:${userId}`, 30)
      .catch((err) =>
        logger.warn({ err, userId }, "Presence heartbeat failed"),
      );
  }, 20_000);

  socket.on("disconnect", async () => {
    clearInterval(heartbeat);

    try {
      await redis.pub.srem(`socket:${userId}`, socket.id);
      const remaining = await redis.pub.scard(`socket:${userId}`);
      if (remaining === 0) {
        await redis.pub.del(`presence:${userId}`);
        io.to(`presence:${userId}`).emit("presence:update", {
          userId,
          status: "offline",
        });
      }
    } catch (err) {
      logger.error({ err, userId }, "Failed to cleanup presence");
    }
  });
}
