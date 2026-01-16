import { Messages } from "@/constants";
import { useUser } from "@clerk/clerk-react";
import {
  ChatUser,
  ConversationWithOtherUser,
  sendMessage,
} from "@repo/db/types";
import { ChatHeader } from "@repo/ui/components/chat/ChatHeader";
import { ChatInput } from "@repo/ui/components/chat/ChatInput";
import { ChatMessages } from "@repo/ui/components/chat/ChatMessages";
import { useSocket } from "@/lib/sockets/SocketProvider.tsx";
import { toast } from "sonner";

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

  // TODO: HANDLE if !socket or error then pop message from indexdb and revert to input box
  // TODO: Insert message payload in index db
  const sendMessage = (payload: sendMessage) => {
    if (!socket || !isConnected)
      return toast.error("Unable to connect to the server.");
    socket.emit("message:new", payload);
  };
  return (
    <div className="flex h-svh w-full flex-col bg-background">
      <ChatHeader
        name={displayName}
        imageUrl={conversationData.otherUser.imageUrl ?? ""}
      />
      <ChatMessages messages={Messages} userData={chatUser} />
      <ChatInput
        conversationId={conversationData.conversationId}
        userId={user!.id}
        sendMessageMutation={sendMessage}
      />
    </div>
  );
}
