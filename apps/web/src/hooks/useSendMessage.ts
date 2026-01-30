import { useSocket } from "@/lib/sockets/SocketProvider";
import { useMessageStore } from "@/store/messages.store";
import { InsertMessage, Message, MessageType } from "@repo/db/types";
import { useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import { toast } from "sonner";

type SendMessageOptions = {
  text?: string;
  file?: {
    url: string;
    mimeType: string;
    size: number;
    fileName?: string;
  };
  replyToId?: string;
};
export const useSendMessage = (conversationId: string) => {
  const { socket } = useSocket();
  const { addMessage, markMessageFailed } = useMessageStore();
  const { user } = useUser();
  const sendMessage = useCallback(
    async (options: SendMessageOptions) => {
      if (!socket || !user) return;
      const tempId = crypto.randomUUID();

      let type: MessageType = "text";
      let content: any = {};
      if (options.file) {
        content = options.file;
        if (options.file.mimeType.startsWith("image/")) type = "image";
        // else if (options.file.mimeType.startsWith("video/")) type = "video";
        else type = "file";
      } else {
        content = { text: options.text || "" };
        type = "text";
      }

      const payload: InsertMessage = {
        senderId: user.id,
        conversationId,
        clientMessageId: tempId,
        type,
        content,
        replyToId: options.replyToId || null,
      };

      const optimisticMessage = {
        ...payload,
        id: tempId,
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
            console.error("Send error:", err || response);
            markMessageFailed(tempId);
            toast.error("Failed to send message");
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
