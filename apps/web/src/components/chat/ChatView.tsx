import { Messages } from "@/constants";
import { useUser } from "@clerk/clerk-react";
import {
  ChatUser,
  ConversationWithOtherUser,
  sentMessage,
} from "@repo/db/types";
import { ChatHeader } from "@repo/ui/components/chat/ChatHeader";
import { ChatInput } from "@repo/ui/components/chat/ChatInput";
import { ChatMessages } from "@repo/ui/components/chat/ChatMessages";
import { sendMessage } from "@/queries/message.queries";
import { useParams } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";

export default function ChatView({
  conversationData,
}: {
  conversationData: ConversationWithOtherUser;
}) {
  const displayName =
    conversationData.otherUser.firstName ??
    conversationData.otherUser.username ??
    "Unknown";

  const { user } = useUser();
  const { conversationId } = useParams({ strict: false });
  const chatUser: ChatUser = {
    id: user?.id ?? "",
    firstName: user?.firstName ?? null,
    lastName: user?.lastName ?? null,
    username: user?.username ?? null,
    imageUrl: user?.imageUrl ?? null,
  };

  const { mutateAsync } = useMutation({
    mutationFn: (messagePayload: sentMessage) => sendMessage(messagePayload),
  });

  return (
    <div className="flex h-svh w-full flex-col bg-background">
      <ChatHeader
        name={displayName}
        imageUrl={conversationData.otherUser.imageUrl ?? ""}
      />
      <ChatMessages messages={Messages} userData={chatUser} />
      <ChatInput
        userId={user!.id}
        conversationId={conversationId!}
        sendMessageMutation={mutateAsync}
      />
    </div>
  );
}
