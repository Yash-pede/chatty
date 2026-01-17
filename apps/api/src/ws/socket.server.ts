import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { clerkSocketAuth } from "@/middlewares/clerk.auth.middleware.js";
import { logger } from "@/core/logger.js";
import { registerMessageEvents } from "@/ws/events/message.events.js";
import { RedisManager } from "@/redis/RedisManager.js";
import { registerConversationEvents } from "@/ws/events/conversation.events.js";
import { setupRedisSubscriber } from "@/ws/redis.subscriber.js";

export class SocketServer {
  private _io: Server | null = null;
  constructor(private readonly path: string) {}

  init(httpServer: HttpServer) {
    if (this._io) {
      throw new Error("Socket.IO already initialized");
    }

    this._io = new Server(httpServer, {
      path: this.path,
      cors: {
        origin: ["*"],
        credentials: true,
      },
    });
    this._io.use(clerkSocketAuth);
    this.registerBaseHandlers();
  }

  private registerBaseHandlers() {
    const redis = RedisManager.get();
    setupRedisSubscriber(this.io);
    this.io.on("connection", (socket) => {
      const userId = socket.data.userId;

      logger.info("WS connected:" + socket.id);

      redis.pub.set(`socket:${userId}`, socket.id);
      redis.pub.set(`presence:${userId}`, "online", "EX", 30);

      registerMessageEvents(this.io, socket);
      registerConversationEvents(this.io, socket);
    });

    this.io.on("disconnect", (socket) => {
      const userId = socket.data.userId;
      redis.pub.srem(`socket:${userId}`, socket.id);
    });
  }

  get io(): Server {
    if (!this._io) {
      throw new Error("Socket.IO not initialized");
    }
    return this._io;
  }
}
