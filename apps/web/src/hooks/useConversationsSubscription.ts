import { useSocket } from "@/lib/sockets/SocketProvider.tsx";
import { useEffect } from "react";

export const useConversationsSubscription = (conversationId: string) => {
  const { socket, isConnected } = useSocket();
  useEffect(() => {
    if (!socket || !isConnected || !conversationId) return;

    socket.emit("conversation:join", conversationId);
    console.log("join", conversationId);
    return () => {
      socket.emit("conversation:leave", conversationId);
    };
  }, [conversationId, socket, isConnected]);
};
