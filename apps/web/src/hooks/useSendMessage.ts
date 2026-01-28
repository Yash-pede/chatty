import { useSocket } from "@/lib/sockets/SocketProvider";
import { useMessageStore } from "@/store/messages.store";
import { InsertMessage, Message } from "@repo/db/types";
import { useCallback } from "react";
import { useUser } from "@clerk/clerk-react"; // Assuming you need user info

export const useSendMessage = (conversationId: string) => {
  const { socket } = useSocket();
  const { addMessage } = useMessageStore();
  const { user } = useUser();

  const sendMessage = useCallback(
    async (text: string) => {
      if (!socket || !user) return;

      // 1. Generate ONE ID to rule them all
      const tempId = crypto.randomUUID();

      // 2. Prepare Payload for Server
      const payload: InsertMessage = {
        senderId: user.id,
        conversationId,
        clientMessageId: tempId, // <--- THE CORRELATION ID
        type: "text",
        content: { text },
      };

      // 3. Create Optimistic Message for UI
      // CRITICAL: Set 'id' to 'tempId' so we can find and delete it later
      const optimisticMessage: Message = {
        ...payload,
        id: tempId, // <--- Temporary ID
        createdAt: new Date(),
        updatedAt: new Date(),
        sequence: Date.now(), // Put it at the bottom
        isDeleted: false,
        isEdited: false,
        // You can add a flag to style it differently (e.g. grey text)
        // isOptimistic: true,
      } as Message;

      // 4. Update UI Immediately
      await addMessage(optimisticMessage);

      socket.emit("message:send", payload, (response: any) => {
        if (response?.status === "error") {
          // TODO: HANDLE ERROR message state
          console.error("Failed to send", response);
        } else if (response?.status === "ok") {
          addMessage(response.data);
        }
      });
    },
    [socket, conversationId, user, addMessage],
  );

  return sendMessage;
};
