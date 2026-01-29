import { useSocket } from "@/lib/sockets/SocketProvider";
import { useMessageStore } from "@/store/messages.store";
import { InsertMessage, Message } from "@repo/db/types";
import { useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import { toast } from "sonner";

export const useSendMessage = (conversationId: string) => {
  const { socket } = useSocket();
  const { addMessage, markMessageFailed } = useMessageStore();
  const { user } = useUser();

  const sendMessage = useCallback(
    async (text: string) => {
      if (!socket || !user) return;

      const tempId = `temp-${crypto.randomUUID()}`;

      const payload: InsertMessage = {
        senderId: user.id,
        conversationId,
        clientMessageId: `${tempId}`,
        type: "text",
        content: { text },
      };

      const optimisticMessage: Message = {
        ...payload,
        id: `${tempId}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        sequence: Date.now(),
        isDeleted: false,
        isEdited: false,
      } as Message;

      await addMessage(optimisticMessage);
      socket
        .timeout(5000)
        .emit("message:send", payload, (err: any, response: any) => {
          if (err || response?.status === "error") {
            markMessageFailed(tempId);

            toast.error("Message failed to send");
            return;
          }

          if (response?.status === "ok" && response.data) {
            addMessage(response.data);
          }
        });
    },
    [socket, conversationId, user, addMessage, markMessageFailed],
  );

  return sendMessage;
};
