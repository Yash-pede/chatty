import { useUser } from "@clerk/clerk-react";
import {
  ChatUser,
  ConversationWithOtherUser,
  InsertMessage,
  Message,
} from "@repo/db/types";
import { ChatHeader } from "@repo/ui/components/chat/ChatHeader";
import { ChatInput } from "@repo/ui/components/chat/ChatInput";
import { ChatMessages } from "@repo/ui/components/chat/ChatMessages";
import { useSocket } from "@/lib/sockets/SocketProvider";
import { toast } from "sonner";
import { useEffect } from "react";
import { useMessageStore } from "@/store/messages.store";
import { getPaginatedMessages } from "@/dbInteractions/queries/message.queries";
import { usePresenceStore } from "@/store/presence.store";
import { useQuery } from "@tanstack/react-query";
import { getConversationPresence } from "@/dbInteractions/queries/conversation.queries";

export default function ChatView({
  conversationData,
}: {
  conversationData: ConversationWithOtherUser;
}) {
  const { socket, isConnected } = useSocket();
  const {
    messages,
    setMessages,
    saveMessageIDB,
    getMessagesByConversationIdIDB,
    replaceOptimisticMessage,
    bulkSaveMessagesIDB,
  } = useMessageStore();
  const { presence, setPresence, } = usePresenceStore()

  const { user } = useUser();

  // Memoize chatUser to prevent unnecessary effect triggers
  const chatUser: ChatUser | null = user
    ? {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      imageUrl: user.imageUrl,
    }
    : null;

  const displayName =
    conversationData.otherUser.firstName ??
    conversationData.otherUser.username ??
    "Unknown";

  // 1. Join/Leave Room
  useEffect(() => {
    if (!socket || !isConnected || !conversationData.conversationId) return;

    socket.emit("conversation:join", conversationData.conversationId);
    return () => {
      socket.emit("conversation:leave", conversationData.conversationId);
    };
  }, [conversationData.conversationId, socket, isConnected]);

  // 2. Handle Incoming Messages (The Critical Part)
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handler = async (data: Message) => {
      // CASE A: It's my own message coming back (Confirmation)
      if (data.senderId === chatUser?.id && data.clientMessageId) {
        // This will swap the temp ID for the real ID in DB and State
        await replaceOptimisticMessage(data.clientMessageId, data);
      }
      // CASE B: It's a message from someone else
      else {
        await saveMessageIDB(data);

        // Use functional state update via the store to avoid closure staleness
        useMessageStore.setState((state) => {
          // Prevent duplicates just in case
          if (state.messages.some((m) => m.id === data.id)) return state;
          return { messages: [...state.messages, data] };
        });
      }
    };


    socket.on("message:new", handler);
    return () => {
      socket.off("message:new", handler);
    };
  }, [
    socket,
    isConnected,
    chatUser?.id,
    replaceOptimisticMessage,
    saveMessageIDB,
  ]);

  useEffect(() => {
    if (!socket) return;

    const presenceHandler = (data: {
      userId: string;
      status: "online" | "offline";
    }) => {
      setPresence(data.userId, data.status);
    };

    socket.on("presence:update", presenceHandler);
    return () => {
      socket.off("presence:update", presenceHandler);
    };
  }, [socket, setPresence]);


  const { data } = useQuery({
    queryKey: ["conversation-presence", conversationData.conversationId],
    queryFn: () => getConversationPresence(conversationData.conversationId),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!data) return;

    data.forEach(({ userId, status }) => {
      setPresence(userId, status);
    });
  }, [data, setPresence]);


  // 3. Initial Load & Sync
  useEffect(() => {
    const loadAndSync = async () => {
      const convId = conversationData.conversationId;

      // A. Load from IDB immediately for speed
      const localMessages = await getMessagesByConversationIdIDB(convId);
      setMessages(localMessages);

      try {
        // B. Fetch fresh data from server
        // Logic check: usually pagination cursor is for *older* messages.
        // If you are syncing *new* messages, this logic depends on your API.
        // Assuming this is "Sync Missing Messages":
        const cursor =
          localMessages.length > 0
            ? localMessages[localMessages.length - 1].sequence
            : undefined;

        const fetchedMessages = await getPaginatedMessages(convId, 30, cursor);
        if (fetchedMessages?.items.length) {
          // Save to DB
          await bulkSaveMessagesIDB(fetchedMessages.items);

          // IMPORTANT: Re-fetch from DB to ensure sorting and consistency
          // This handles the case where fetched items merge with local items
          const updatedMessages = await getMessagesByConversationIdIDB(convId);
          setMessages(updatedMessages);
        }
      } catch (err) {
        console.error("Sync failed", err);
        // Silent fail is often better than toast on load, but toast is okay
      }
    };

    loadAndSync();
  }, [
    conversationData.conversationId,
    getMessagesByConversationIdIDB,
    bulkSaveMessagesIDB,
    setMessages,
  ]);

  const sendMessage = (payload: InsertMessage) => {
    if (!socket || !isConnected)
      return toast.error("Unable to connect to the server.");

    // 1. Emit to server
    socket.emit("message:send", payload);

    // 2. Construct Optimistic Message
    // IMPORTANT: Ensure this temp ID matches the format in replaceOptimisticMessage
    const tempId = `temp-${payload.clientMessageId}`;

    const optimisticMessage: Message = {
      ...payload,
      id: tempId,
      sequence: Date.now(),
      createdAt: new Date(),
      conversationId: conversationData.conversationId, // Ensure this exists
      senderId: user!.id, // Ensure this exists
      clientMessageId: payload.clientMessageId ?? null,
      type: payload.type ?? "text",
      replyToId: payload.replyToId ?? null,
      isEdited: false,
      isDeleted: false,
    };

    // 3. Update Local State & DB
    saveMessageIDB(optimisticMessage);
    setMessages([...messages, optimisticMessage]);
  };



  return (
    <div className="flex h-svh w-full flex-col bg-background">
      <ChatHeader
        name={displayName}
        imageUrl={conversationData.otherUser.imageUrl ?? ""}
        onlineStatus={presence[conversationData.otherUser.id] ?? "offline"}
      />
      <ChatMessages messages={messages} userData={chatUser!} />
      <ChatInput
        conversationId={conversationData.conversationId}
        userId={user!.id}
        sendMessage={sendMessage}
      />
    </div>
  );
}
