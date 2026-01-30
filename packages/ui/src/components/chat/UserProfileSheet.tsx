import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/components/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar.js";
import { Item, ItemDescription, ItemTitle } from "../item.js";
import { Button } from "../button.js";
import { Mail, User, UserX } from "lucide-react";
import { Separator } from "../separator.js";
import { ChatUser } from "@repo/db/types";
import { Badge } from "../badge.js";

export function UserProfileSheet({
  open,
  onOpenChange,
  chatWithUser,
  onlineStatus
}: {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  chatWithUser: ChatUser
  onlineStatus: "online" | "offline"
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col h-full p-0 gap-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="text-base font-semibold">User Profile</SheetTitle>
        </SheetHeader>

        <Item className="flex-col flex-1 overflow-y-auto">
          <Avatar className="size-28 border-4 border-background shadow-2xl transition-transform duration-300 hover:scale-105">
            <AvatarImage src={chatWithUser.imageUrl || ""} />
            <AvatarFallback className="text-2xl">{`${chatWithUser.firstName?.[0] || ""}${chatWithUser.lastName?.[0] || ""}`.toUpperCase()}</AvatarFallback>
          </Avatar>

          <ItemTitle className="text-lg md:text-2xl font-bold mt-4">{chatWithUser.firstName} {chatWithUser.lastName}</ItemTitle>
          <ItemDescription>
            <Badge variant={onlineStatus === "offline" ? "secondary" : "default"}>{onlineStatus}</Badge>
          </ItemDescription>

          <Separator />
          <Item className="flex-col items-start w-full gap-1">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <User className="size-4" />
              <ItemTitle className="text-xs font-bold uppercase">username</ItemTitle>
            </div>
            <ItemDescription className="text-foreground text-sm pl-6">
              {chatWithUser.username}
            </ItemDescription>
          </Item>
          <Item className="flex-col items-start w-full gap-1">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Mail className="size-4" />
              <ItemTitle className="text-xs font-bold uppercase">Email Address</ItemTitle>
            </div>
            <ItemDescription className="text-foreground text-sm pl-6">
              {chatWithUser.email}
            </ItemDescription>
          </Item>

        </Item>

        <Button
          variant="destructive"
          disabled
          className="m-4 flex items-center justify-center gap-2 h-11 font-medium hover:bg-destructive/90 transition-colors"
        >
          <UserX className="size-4" />
          Block User
        </Button>
      </SheetContent>
    </Sheet>
  );
}
