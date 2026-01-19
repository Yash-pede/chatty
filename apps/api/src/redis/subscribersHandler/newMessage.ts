import { Server } from "socket.io";

export const handleNewMessageSubscription = (
  io: Server,
  { channel, raw }: { channel: string; raw: string },
) => {
  const message = JSON.parse(raw);
  const conversationId = channel.split(":")[1];
  // logger.info("message:new" + JSON.stringify(message));
  io.to(`conversation:${conversationId}`).emit("message:new", message);
};
