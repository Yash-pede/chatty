import { Server, Socket } from "socket.io";
import { getConversationParticipantsByConversationId } from "@/modules/conversations/conversations.service.js";

export function registerConversationEvents(io: Server, socket: Socket) {
  const userId = socket.data.userId;

  socket.on("conversation:join", async (conversationId: string) => {
    // TODO: ABAC check should happen here
    // logger.info("Joining conversation:" + socket.id + conversationId);
    const participants =
      await getConversationParticipantsByConversationId(conversationId);
    socket.join(`conversation:${conversationId}`);
    participants.forEach((participant) => {
      if (userId === participant.userId) return;
      socket.join(`presence:${participant.userId}`);
    });
  });

  // REMEMBER: not leaving to show dots in conversatino card
  socket.on("conversation:leave", (conversationId: string) => {
    socket.leave(`conversation:${conversationId}`);
  });
}
