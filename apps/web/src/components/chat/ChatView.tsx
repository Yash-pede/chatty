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
import { useEffect } from "react";
import { toast } from "sonner";
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/indexdDB";

export default function ChatView({
  conversationData,
}: {
  conversationData: ConversationWithOtherUser;
}) {
  const { socket, isConnected } = useSocket();

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


  // Fetch local messages from indexedDB
  const localMessages = useLiveQuery(() =>
    db.messages
      .where("conversationId")
      .equals(conversationData.conversationId)
      .toArray()) ?? []

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

    const handler = (data: any) => {
      console.log("NEW:MESSAGE", data);
    };

    socket.on("message:new", handler);

    return () => {
      socket.off("message:new", handler);
    };
  }, [socket, isConnected]);



  // TODO: HANDLE if !socket or error then pop message from indexdb and revert to input box
  // TODO: Insert message payload in index db
  const sendMessage = async (payload: InsertMessage) => {
    if (!socket || !isConnected)
      return toast.error("Unable to connect to the server.");
    let addedLocalMsgId: string | undefined
    try {
      socket.emit("message:send", payload);
      addedLocalMsgId = await db.messages.add(payload)
    } catch (error) {
      if (addedLocalMsgId) await db.messages.delete(addedLocalMsgId)
      toast.error("Failed to send message.")
    }
  };


  return (
    <div className="flex h-svh w-full flex-col bg-background">
      <ChatHeader
        name={displayName}
        imageUrl={conversationData.otherUser.imageUrl ?? ""}
      />
      <ChatMessages messages={localMessages} userData={chatUser} />
      <ChatInput
        conversationId={conversationData.conversationId}
        userId={user!.id}
        sendMessage={sendMessage}
      />
    </div>
  );
}
