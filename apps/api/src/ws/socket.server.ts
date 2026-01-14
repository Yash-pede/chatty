import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { clerkSocketAuth } from "@/middlewares/clerk.auth.middleware.js";
import { logger } from "@/core/logger.js";
import { registerMessageEvents } from "@/ws/events/message.events.js";

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
    this.io.on("connection", (socket) => {
      logger.info("WS connected:" + socket.id);
      registerMessageEvents(this.io, socket);
    });
  }

  get io(): Server {
    if (!this._io) {
      throw new Error("Socket.IO not initialized");
    }
    return this._io;
  }
}
