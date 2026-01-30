import { ArrowLeft, MoreVertical, Phone, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu.js";
import { Button } from "../button.js";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@repo/ui/components/item";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip.js";
import { useState } from "react";
import { UserProfileSheet } from "./UserProfileSheet.js";
import { useRouter } from "@tanstack/react-router";
import { ChatUser } from "@repo/db/types";

export const ChatHeader = ({ onlineStatus, chatWithUser }: { onlineStatus: "online" | "offline", chatWithUser: ChatUser }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const router = useRouter();
    const { firstName, lastName, imageUrl } = chatWithUser;
    return (
        <div className="flex items-center justify-between border-b px-4">
            <Item className="px-0">
                <Button variant={"ghost"} className="md:hidden" onClick={() => router.history.back()}>
                    <ArrowLeft />
                </Button>
                <ItemMedia>
                    <Avatar className="scale-125">
                        <AvatarImage src={imageUrl || ""} />
                        <AvatarFallback>{`${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase()}</AvatarFallback>
                    </Avatar>
                </ItemMedia>
                <ItemContent className="gap-0">
                    <ItemTitle>{firstName}</ItemTitle>
                    <ItemDescription className={`${onlineStatus === "online" ? "text-chart-3" : "text-muted-foreground"}`}>{onlineStatus}</ItemDescription>
                </ItemContent>
            </Item>

            <div className="flex items-center gap-2">
                {/* {[Phone, Video].map((Icon, index) => (
                    <Tooltip key={index}>
                        <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost">
                                <Icon className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {Icon === Phone ? "Call" : "Video Call"}
                        </TooltipContent>
                    </Tooltip>
                ))} */}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>View profile</DropdownMenuItem>
                        {/* <DropdownMenuItem>Clear chat</DropdownMenuItem> */}
                        <DropdownMenuItem disabled className="text-destructive">
                            Block user
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <UserProfileSheet open={isProfileOpen} onOpenChange={setIsProfileOpen} chatWithUser={chatWithUser} onlineStatus={onlineStatus} />
        </div>
    );
}
