import { useUser } from "@clerk/clerk-react";
import {
  ChatUser,
  ConversationWithOtherUser,
  InsertMessage,
} from "@repo/db/types";
import { ChatHeader } from "@repo/ui/components/chat/ChatHeader";
import { ChatInput } from "@repo/ui/components/chat/ChatInput";
import { ChatMessages } from "@repo/ui/components/chat/ChatMessages";
import { useSocket } from "@/lib/sockets/SocketProvider.tsx";
import { toast } from "sonner";
import { useEffect } from "react";
import { useMessageStore } from "@/store/messages.store";

export default function ChatView({
  conversationData,
}: {
  conversationData: ConversationWithOtherUser;
}) {
  const { socket, isConnected } = useSocket();
  const { messages, setMessages, saveMessageIDB, replaceOptimisticMessage } = useMessageStore()

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

    const handler = async (data: any) => {
      await replaceOptimisticMessage(data.clientMessageId, data)
    };

    socket.on("message:new", handler);

    return () => {
      socket.off("message:new", handler);
    };
  }, [socket, isConnected]);


  // TODO: HANDLE if !socket or error then pop message from indexdb and revert to input box
  // TODO: Insert message payload in index db
  const sendMessage = (payload: InsertMessage) => {
    if (!socket || !isConnected)
      return toast.error("Unable to connect to the server.");
    socket.emit("message:send", payload);
    const optimisticMessage: InsertMessage = {
      ...payload,
      createdAt: new Date(),
      id: `temp-${payload.clientMessageId}`
    }

    saveMessageIDB(optimisticMessage)
    setMessages([...messages, optimisticMessage])

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
        sendMessageMutation={sendMessage}
      />
    </div>
  );
}
