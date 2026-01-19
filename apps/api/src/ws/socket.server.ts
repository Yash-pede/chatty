import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { clerkSocketAuth } from "@/middlewares/clerk.auth.middleware.js";
import { logger } from "@/core/logger.js";
import { registerMessageEvents } from "@/ws/events/message.events.js";
import { registerConversationEvents } from "@/ws/events/conversation.events.js";
import { setupRedisSubscriber } from "@/ws/redis.subscriber.js";
import { registerPresenceEvents } from "@/ws/events/presence.events.js";

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
    setupRedisSubscriber(this.io);

    this.io.on("connection", (socket) => {
      registerPresenceEvents(this.io, socket);
      registerMessageEvents(this.io, socket);
      registerConversationEvents(this.io, socket);
    });

    this.io.on("disconnect", (socket) => {
      const userId = socket.data.userId;
      logger.info("WS disconnected", userId);
    });
  }

  get io(): Server {
    if (!this._io) {
      throw new Error("Socket.IO not initialized");
    }
    return this._io;
  }
}
