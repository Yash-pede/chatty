import { Server } from "socket.io";
import { logger } from "@/core/logger.js";
import { Message } from "@repo/db/types";

export const handleNewMessageSubscription = (
  io: Server,
  { channel, raw }: { channel: string; raw: string },
) => {
  let payload: { message: Message; senderSocketId?: string };

  try {
    payload = JSON.parse(raw);
  } catch (err) {
    logger.error(
      { err, raw, channel },
      "Redis subscription received invalid JSON",
    );
    return;
  }

  const { message, senderSocketId } = payload;

  if (!message || !message.conversationId) {
    logger.warn({ payload }, "Redis payload missing message data");
    return;
  }

  const conversationId = channel.split(":")[1];

  if (!conversationId) {
    logger.warn({ channel }, "Missing conversationId in channel");
    return;
  }

  const broadcast = io.to(`conversation:${conversationId}`);

  if (senderSocketId) {
    broadcast.except(senderSocketId);
  }

  broadcast.emit("message:new", message);
};
