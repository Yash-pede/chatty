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
import { useSocket } from "@/lib/sockets/SocketProvider.tsx";
import { toast } from "sonner";
import { useEffect } from "react";
import { useMessageStore } from "@/store/messages.store";
import { getPaginatedMessages } from "@/dbInteractions/queries/message.queries";

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

  const displayName =
    conversationData.otherUser.firstName ??
    conversationData.otherUser.username ??
    "Unknown";

  const { user } = useUser();
  const chatUser: ChatUser = {
    id: user?.id ?? "",
    firstName: user?.firstName ?? null,
    lastName: user?.lastName ?? null,
    username: user?.username ?? null,
    imageUrl: user?.imageUrl ?? null,
  };

  useEffect(() => {
    if (!socket || !isConnected) return;
    if (!conversationData.conversationId) return;

    socket.emit("conversation:join", conversationData.conversationId);

    return () => {
      socket.emit("conversation:leave", conversationData.conversationId);
    };
  }, [conversationData.conversationId, socket, isConnected]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handler = async (data: Message) => {
      if (data.senderId === chatUser?.id && data.clientMessageId) {
        await replaceOptimisticMessage(data.clientMessageId, data);
        return;
      } else {
        await saveMessageIDB(data);
        //TODO: message append without sorting
        useMessageStore.setState((state) => ({
          messages: [...state.messages, data],
        }));
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
    const getMessages = async (conversationId: string) => {
      const localMessages =
        await getMessagesByConversationIdIDB(conversationId);
      setMessages(localMessages);

      try {
        const fetchedMessages = await getPaginatedMessages(
          conversationId,
          30,
          localMessages[localMessages.length - 1].sequence,
        );
        if (!fetchedMessages || !fetchedMessages.items.length) return;
        await bulkSaveMessagesIDB(fetchedMessages.items);
        const updatedMessages =
          await getMessagesByConversationIdIDB(conversationId);

        setMessages(updatedMessages);
      } catch (err) {
        toast.error("Message sync failed");
        console.error(err);
      }
    };

    getMessages(conversationData.conversationId);
  }, [
    bulkSaveMessagesIDB,
    conversationData.conversationId,
    getMessagesByConversationIdIDB,
    setMessages,
  ]);

  // TODO: HANDLE if !socket or error then pop message from indexdb and revert to input box
  // TODO: Insert message payload in index db
  const sendMessage = (payload: InsertMessage) => {
    if (!socket || !isConnected)
      return toast.error("Unable to connect to the server.");
    socket.emit("message:send", payload);
    const optimisticMessage: Message = {
      ...payload,
      id: `temp-${payload.clientMessageId}`,
      sequence: Date.now(), // High sequence so it stays at the bottom
      createdAt: new Date(),

      clientMessageId: payload.clientMessageId ?? null,
      type: payload.type ?? "text",
      replyToId: payload.replyToId ?? null,
      isEdited: false,
      isDeleted: false,
    };

    saveMessageIDB(optimisticMessage);
    setMessages([...messages, optimisticMessage]);
  };
  return (
    <div className="flex h-svh w-full flex-col bg-background">
      <ChatHeader
        name={displayName}
        imageUrl={conversationData.otherUser.imageUrl ?? ""}
      />
      <ChatMessages messages={messages} userData={chatUser} />
      <ChatInput
        conversationId={conversationData.conversationId}
        userId={user!.id}
        sendMessage={sendMessage}
      />
    </div>
  );
}
