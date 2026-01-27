import { Server, Socket } from "socket.io";
import { getConversationParticipantsByConversationId } from "@/modules/conversations/conversations.service.js";

export function registerConversationEvents(io: Server, socket: Socket) {
  const userId = socket.data.userId;

  socket.on("conversation:join", async (conversationId: string) => {
    // TODO: ABAC check should happen here
    // logger.info("Joining conversation:" + socket.id + conversationId);
    const participantsMap =
      await getConversationParticipantsByConversationId(conversationId);
    // TODO: Handle this in frontend
    const participants = participantsMap.map(
      (participant) => participant.userId,
    );
    if (!participants.includes(userId)) return false;

    socket.join(`conversation:${conversationId}`);
    participants.forEach((p_userId) => {
      if (userId === p_userId) return;
      socket.join(`presence:${p_userId}`);
    });
  });

  // REMEMBER: not leaving to show dots in conversatino card
  socket.on("conversation:leave", (conversationId: string) => {
    socket.leave(`conversation:${conversationId}`);
  });
}
