import { useSocket } from "@/lib/sockets/SocketProvider.tsx";
import { useEffect } from "react";
import { useMessageStore } from "@/store/messages.store.ts";
import { Message } from "@repo/db/types";

export const useMessagesSubscription = (conversationId: string) => {
  const { socket, isConnected } = useSocket();
  const { addMessage } = useMessageStore();

  useEffect(() => {
    if (!socket || !isConnected || !conversationId) return;

    socket.emit("conversation:join", conversationId);

    const handleNewMessage = (payload: Message) => {
      if (payload.conversationId === conversationId) {
        console.log("New message received via socket:", payload);
        addMessage(payload);
      }
    };

    socket.on("message:new", handleNewMessage);

    return () => {
      socket.off("message:new", handleNewMessage);

      socket.emit("conversation:leave", conversationId);
    };
  }, [conversationId, socket, isConnected, addMessage]);
};
