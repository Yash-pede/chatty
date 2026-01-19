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
import { getMessagesFromServer } from "@/dbInteractions/queries/message.queries";

export default function ChatView({
  conversationData,
}: {
  conversationData: ConversationWithOtherUser;
}) {
  const { socket, isConnected } = useSocket();
  const { messages, setMessages, saveMessageIDB, getMessagesByConversationIdIDB, replaceOptimisticMessage, bulkSaveMessagesIDB, mergeFetchedMessages } = useMessageStore()

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

  const getMessages = async (conversationId: string) => {
    const localMessages = await getMessagesByConversationIdIDB(conversationId)
    setMessages(localMessages)

    try {
      const fetchedMessages = await getMessagesFromServer(conversationId, 50)
      if (!fetchedMessages || fetchedMessages.items.length === 0) return
      await bulkSaveMessagesIDB(fetchedMessages.items)
      mergeFetchedMessages(fetchedMessages.items)
    } catch (err) {
      toast.error("Message sync failed")
    }
  }


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
      if (data.senderId === chatUser?.id) {
        await replaceOptimisticMessage(data.clientMessageId, data);
        return;
      } else {
        await saveMessageIDB(data)
        useMessageStore.setState((state) => ({
          messages: [...state.messages, data].sort(
            (a, b) =>
              new Date(a.createdAt).getTime() -
              new Date(b.createdAt).getTime()
          ),
        }));
      }
    }

    socket.on("message:new", handler);

    return () => {
      socket.off("message:new", handler);
    };
  }, [socket, isConnected]);

  useEffect(() => {
    getMessages(conversationData.conversationId)
  }, [conversationData.conversationId])



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
