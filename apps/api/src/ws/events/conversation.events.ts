import { Server, Socket } from "socket.io";

export function registerConversationEvents(io: Server, socket: Socket) {
  socket.on("conversation:join", async (conversationId: string) => {
    // TODO: ABAC check should happen here
    // logger.info("Joining conversation:" + socket.id + conversationId);
    socket.join(`conversation:${conversationId}`);
  });

  socket.on("conversation:leave", (conversationId: string) => {
    socket.leave(`conversation:${conversationId}`);
  });
}
