import { useEffect } from "react";
import { usePresenceStore } from "@/store/presence.store";
import { useSocket } from "@/lib/sockets/SocketProvider";
import { useQuery } from "@tanstack/react-query";
import { getConversationPresence } from "@/dbInteractions/queries/conversation.queries";

export const usePresenceSubscription = (conversationId: string) => {
  const { setPresence, presence } = usePresenceStore();
  const { socket, isConnected } = useSocket();

  // 1. Socket Listener
  useEffect(() => {
    if (!socket || !isConnected) return;

    const presenceHandler = (data: {
      userId: string;
      status: "online" | "offline";
    }) => {
      setPresence(data.userId, data.status);
      console.log("presenceDATA", data);
    };
    socket.on("presence:update", presenceHandler);
    return () => {
      socket.off("presence:update", presenceHandler);
    };
  }, [socket, isConnected, setPresence]);

  // 2. Initial Fetch
  const { data } = useQuery({
    queryKey: ["conversation-presence", conversationId],
    queryFn: () => getConversationPresence(conversationId),
    staleTime: 30_000,
  });

  // 3. Sync Fetch to Store
  useEffect(() => {
    if (!data) return;
    data.forEach(({ userId, status }) => setPresence(userId, status));
  }, [data, setPresence]);

  return { presence };
};
