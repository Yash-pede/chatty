import { useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { ChatUser, ConversationWithOtherUser, Message } from "@repo/db/types";
import { ChatHeader } from "@repo/ui/components/chat/ChatHeader";
import {
  ChatMessages,
  ChatMessagesRef,
} from "@repo/ui/components/chat/ChatMessages";
import { ChatInput } from "@repo/ui/components/chat/ChatInput";
import { usePresenceSubscription } from "@/hooks/usePresenceSubscription";
import { useMessageStore } from "@/store/messages.store";
import { useMessagesSubscription } from "@/hooks/useMessagesSubscription.ts";
import { useSendMessage } from "@/hooks/useSendMessage.ts";

export default function ChatView({
  conversationData,
}: {
  conversationData: ConversationWithOtherUser;
}) {
  useMessagesSubscription(conversationData.conversationId);
  const { user } = useUser();
  const { presence } = usePresenceSubscription(conversationData.conversationId);
  const chatListRef = useRef<ChatMessagesRef>(null);

  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const sendMessageRaw = useSendMessage(conversationData.conversationId);

  const handleSendMessage = async ({
    text,
    replyToId,
  }: {
    text: string;
    replyToId?: string;
  }) => {
    chatListRef.current?.scrollToBottom(true);

    await sendMessageRaw({ text, replyToId });

    setTimeout(() => chatListRef.current?.scrollToBottom(true), 50);

    setReplyingTo(null);
  };

  const {
    messages,
    isLoading,
    hasMoreOlderMessages,
    initConversation,
    loadOlderMessages,
    failedIds,
  } = useMessageStore();

  useEffect(() => {
    initConversation(conversationData.conversationId);

    // setReplyingTo(null);
  }, [conversationData.conversationId]);

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
    <div className="flex h-[100dvh] w-full flex-col bg-background">
      <ChatHeader
        name={displayName}
        imageUrl={conversationData.otherUser.imageUrl ?? ""}
        onlineStatus={presence[conversationData.otherUser.id] ?? "offline"}
      />

      <ChatMessages
        ref={chatListRef}
        messages={messages}
        userData={chatUser!}
        isLoading={isLoading}
        hasMore={hasMoreOlderMessages}
        onLoadMore={handleLoadMore}
        failedIds={failedIds}
        onReplyMessage={(msg) => setReplyingTo(msg)}
      />

      <ChatInput
        sendMessage={handleSendMessage}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />
    </div>
  );
}
