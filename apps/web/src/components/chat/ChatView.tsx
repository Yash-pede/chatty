import { useEffect, useMemo, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { ChatUser, ConversationWithOtherUser } from "@repo/db/types";
import { ChatHeader } from "@repo/ui/components/chat/ChatHeader";
import {
  ChatMessages,
  ChatMessagesRef,
} from "@repo/ui/components/chat/ChatMessages"; // Import UI component
import { ChatInput } from "@repo/ui/components/chat/ChatInput";
import { usePresenceSubscription } from "@/hooks/usePresenceSubscription";
import { useMessageStore } from "@/store/messages.store";
import { useMessagesSubscription } from "@/hooks/useMessagesSubscription.ts";
import { useSendMessage } from "@/hooks/useSendMessage.ts"; // Import Store

export default function ChatView({
  conversationData,
}: {
  conversationData: ConversationWithOtherUser;
}) {
  useMessagesSubscription(conversationData.conversationId);
  const { user } = useUser();
  const { presence } = usePresenceSubscription(conversationData.conversationId);
  const chatListRef = useRef<ChatMessagesRef>(null);

  // 2. Send Message Hook
  const sendMessageRaw = useSendMessage(conversationData.conversationId);

  // 3. Wrapper Handler
  const handleSendMessage = async (text: string) => {
    // A. Force Scroll to bottom immediately (Optimistic UX)
    chatListRef.current?.scrollToBottom(true);

    // B. Send the message
    await sendMessageRaw(text);

    // C. Optional: Scroll again slightly later to ensure sticky state
    setTimeout(() => chatListRef.current?.scrollToBottom(true), 50);
  };

  // 1. Extract Store State & Actions
  const {
    messages,
    isLoading,
    hasMoreOlderMessages,
    initConversation,
    loadOlderMessages,
    failedIds,
  } = useMessageStore();

  // 2. Initial Sync on Mount (or when ID changes)
  useEffect(() => {
    initConversation(conversationData.conversationId);
  }, [conversationData.conversationId]);

  // 3. Create the Load More Handler
  // This wrapper function ensures we pass the correct ID
  const handleLoadMore = async () => {
    await loadOlderMessages(conversationData.conversationId);
  };

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

      <ChatMessages
        messages={messages}
        userData={chatUser!}
        isLoading={isLoading}
        hasMore={hasMoreOlderMessages}
        onLoadMore={handleLoadMore}
        failedIds={failedIds}
      />

      <ChatInput sendMessage={handleSendMessage} />
    </div>
  );
}
