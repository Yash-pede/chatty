import { ConversationWithOtherUser } from "@repo/db/types";
import { ChatHeader } from "@repo/ui/components/chat/ChatHeader";
import { usePresenceSubscription } from "@/hooks/usePresenceSubscription.ts";
import { useMemo } from "react";
import { useConversationsSubscription } from "@/hooks/useConversationsSubscription.ts";

export default function ChatView({
  conversationData,
}: {
  conversationData: ConversationWithOtherUser;
}) {
  useConversationsSubscription(conversationData.conversationId);
  const { presence } = usePresenceSubscription(conversationData.conversationId);
  const displayName = useMemo(
    () => conversationData.otherUser.firstName ?? "",
    [conversationData],
  );
  return (
    <div className="flex h-svh w-full flex-col bg-background">
      <ChatHeader
        name={displayName}
        imageUrl={conversationData.otherUser.imageUrl ?? ""}
        onlineStatus={presence[conversationData.otherUser.id] ?? "offline"}
      />
      {/*<ChatMessages messages={messages} userData={chatUser!} />*/}
      {/*<ChatInput*/}
      {/*  conversationId={conversationData.conversationId}*/}
      {/*  userId={user!.id}*/}
      {/*  sendMessage={sendMessage}*/}
      {/*/>*/}
    </div>
  );
}
