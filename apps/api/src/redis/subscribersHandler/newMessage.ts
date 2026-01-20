import { Server } from "socket.io";
import { logger } from "@/core/logger.js";

export const handleNewMessageSubscription = (
  io: Server,
  { channel, raw }: { channel: string; raw: string },
) => {
  let message: unknown;
  try {
    message = JSON.parse(raw);
  } catch (err) {
    logger.error({ err, channel }, "Invalid message payload");
    return;
  }

  const conversationId = channel.split(":")[1];
  if (!conversationId) {
    logger.warn({ channel }, "Missing conversationId in channel");
    return;
  }
  // logger.info("message:new" + JSON.stringify(message));
  io.to(`conversation:${conversationId}`).emit("message:new", message);
};
