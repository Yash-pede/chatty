import { Server, Socket } from "socket.io";
import { logger } from "@/core/logger.js";

export function registerMessageEvents(io: Server, socket: Socket) {
  socket.on("message:send", async (payload) => {
    const userId = socket.data.userId;

    logger.info({
      event: "message:send",
      userId,
      payload,
    });
  });
}
