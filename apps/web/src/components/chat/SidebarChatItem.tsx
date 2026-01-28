import {
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/sidebar";
import { Card } from "@repo/ui/components/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { MoreVertical } from "lucide-react";
import { ConversationWithOtherUser } from "@repo/db/types";
import dayjs from "dayjs";
import { useNavigate } from "@tanstack/react-router";

const SidebarChatItem = ({
  conversation,
  onlineStatus,
}: {
  conversation: ConversationWithOtherUser;
  onlineStatus: "online" | "offline";
}) => {
  const navigate = useNavigate();
  return (
    <SidebarMenuItem
      className="group/chat-item"
      onClick={() =>
        navigate({
          to: `/chat/$conversationId`,
          params: { conversationId: conversation.conversationId },
        })
      }
    >
      <SidebarMenuButton className="h-auto p-0">
        <Card className="w-full border-none bg-transparent shadow-none px-3 py-2">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={conversation.otherUser.imageUrl ?? ""} />
                <AvatarFallback>{conversation.otherUser.firstName?.slice(0, 2).toUpperCase() || ""}</AvatarFallback>
              </Avatar>

              {/* Online indicator */}
              <span
                className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ${onlineStatus === "online" && "bg-green-500 ring-2 ring-background"} 
                `}
              />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center justify-between">
                <p className="truncate text-sm font-medium max-w-3/4">
                  {conversation.type === "direct" ? (
                    <>
                      {conversation.otherUser.firstName}
                      {"\u00A0"}
                      {conversation.otherUser.lastName}
                    </>
                  ) : (
                    conversation.name
                  )}{" "}
                </p>
                <span className="text-xs text-muted-foreground">
                  {conversation.lastMessageAt &&
                    dayjs(conversation.lastMessageAt).format("MM-DDThh:mm:")}
                  10 minutes ago
                </span>
              </div>

              <p className="truncate text-xs text-muted-foreground">
                {conversation.lastMessagePreview ??
                  "Send your first message 😊"}{" "}
              </p>
            </div>
          </div>
        </Card>

        {/* Unread badge */}
        <SidebarMenuBadge className=" group-hover/chat-item:hidden">
          8
        </SidebarMenuBadge>

        {/* More action (appears on hover) */}
        <SidebarMenuAction className="hidden group-hover/chat-item:block">
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </SidebarMenuAction>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export default SidebarChatItem;
