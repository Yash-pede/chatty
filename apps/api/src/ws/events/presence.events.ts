import { Server, Socket } from "socket.io";
import { RedisManager } from "@/redis/RedisManager.js";

export function registerPresenceEvents(io: Server, socket: Socket) {
  const userId = socket.data.userId;
  const redis = RedisManager.get();

  (async () => {
    // logger.info("Registering presence events" + userId);
    await redis.pub.sadd(`socket:${userId}`, socket.id);
    await redis.pub.set(`presence:${userId}`, "online", "EX", 30);

    io.to(`presence:${userId}`).emit("presence:update", {
      userId,
      status: "online",
    });
  })();

  const heartbeat = setInterval(() => {
    redis.pub.expire(`presence:${userId}`, 30);
  }, 20_000);

  socket.on("disconnect", async () => {
    clearInterval(heartbeat);

    await redis.pub.srem(`socket:${userId}`, socket.id);

    const remaining = await redis.pub.scard(`socket:${userId}`);
    if (remaining === 0) {
      await redis.pub.del(`presence:${userId}`);

      io.to(`presence:${userId}`).emit("presence:update", {
        userId,
        status: "offline",
      });
    }
  });
}
