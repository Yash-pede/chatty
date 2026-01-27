import { ChatUser, ConversationWithOtherUser } from "@repo/db/types";
import { ChatHeader } from "@repo/ui/components/chat/ChatHeader";
import { usePresenceSubscription } from "@/hooks/usePresenceSubscription.ts";
import { useMemo } from "react";
import { useConversationsSubscription } from "@/hooks/useConversationsSubscription.ts";
import { ChatMessages } from "@repo/ui/components/chat/ChatMessages";
import { useMessageStore } from "@/store/messages.store.ts";
import { useUser } from "@clerk/clerk-react";
import { ChatInput } from "@repo/ui/components/chat/ChatInput";

export default function ChatView({
  conversationData,
}: {
  conversationData: ConversationWithOtherUser;
}) {
  const { user } = useUser();
  useConversationsSubscription(conversationData.conversationId);
  const { messages } = useMessageStore();
  const { presence } = usePresenceSubscription(conversationData.conversationId);
  const displayName = useMemo(
    () => conversationData.otherUser.firstName ?? "",
    [conversationData],
  );
  const chatUser: ChatUser = {
    id: user!.id,
    firstName: user!.firstName,
    lastName: user!.lastName,
    username: user!.username,
    imageUrl: user!.imageUrl,
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
        sendMessage={() => {}}
      />
    </div>
  );
}
