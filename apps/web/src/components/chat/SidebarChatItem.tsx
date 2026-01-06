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

const SidebarChatItem = () => {
  return (
    <SidebarMenuItem className="group/chat-item" suppressHydrationWarning>
      <SidebarMenuButton className="h-auto p-0">
        <Card className="w-full border-none bg-transparent shadow-none px-3 py-2">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/avatar.png" />
                <AvatarFallback>JS</AvatarFallback>
              </Avatar>

              {/* Online indicator */}
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center justify-between">
                <p className="truncate text-sm font-medium max-w-3/4">
                  Jacquenetta Slowgrave
                </p>
                <span className="text-xs text-muted-foreground">
                  10 minutes
                </span>
              </div>

              <p className="truncate text-xs text-muted-foreground">
                Great! Looking forward to it. Lorem
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
