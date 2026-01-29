import { useEffect } from "react";
import { usePresenceStore } from "@/store/presence.store";
import { useSocket } from "@/lib/sockets/SocketProvider";
import { useQuery } from "@tanstack/react-query";
import { getConversationPresence } from "@/dbInteractions/queries/conversation.queries";

export const usePresenceSubscription = (conversationId: string) => {
  const { setPresence, presence } = usePresenceStore();
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    const presenceHandler = (data: {
      userId: string;
      status: "online" | "offline";
    }) => {
      setPresence(data.userId, data.status);
    };
    socket.on("presence:update", presenceHandler);
    return () => {
      socket.off("presence:update");
    };
  }, [socket, isConnected, setPresence]);

  const { data } = useQuery({
    queryKey: ["conversation-presence", conversationId],
    queryFn: () => getConversationPresence(conversationId),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!data) return;
    data.forEach(({ userId, status }) => setPresence(userId, status));
  }, [data, setPresence]);

  return { presence };
};
