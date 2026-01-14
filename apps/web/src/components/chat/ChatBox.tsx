import { Messages } from "@/constants";
import { useUser } from "@clerk/clerk-react";
import { ConversationWithOtherUser } from "@repo/db/types";
import { ChatHeader } from "@repo/ui/components/chat/ChatHeader";
import { ChatInput } from "@repo/ui/components/chat/ChatInput";
import { ChatMessages } from "@repo/ui/components/chat/ChatMessages";
import { ChatUser } from "@repo/db/types";

export default function ChatBox({
  conversationData,
}: {
  conversationData: ConversationWithOtherUser;
}) {
  const displayName =
    conversationData.otherUser.firstName ??
    conversationData.otherUser.username ??
    "Unknown";
    
  const { user } = useUser()
  const chatUser: ChatUser = {
    id: user?.id ?? "",
    firstName: user?.firstName ?? null,
    lastName: user?.lastName ?? null,
    username: user?.username ?? null,
    imageUrl: user?.imageUrl ?? null,
  };

  return (
    <div className="flex h-svh w-full flex-col bg-background">
      <ChatHeader
        name={displayName}
        imageUrl={conversationData.otherUser.imageUrl ?? ""}
      />
      <ChatMessages messages={Messages} userData={chatUser} />
      <ChatInput />
    </div>
  );
}

