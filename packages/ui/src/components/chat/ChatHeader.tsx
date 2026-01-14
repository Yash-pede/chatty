import { MoreVertical, Phone, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar.js";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../dropdown-menu.js";
import { Button } from "../button.js";
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemMedia,
    ItemSeparator,
    ItemTitle,
} from "@repo/ui/components/item"

export const ChatHeader = ({ imageUrl, name }: { imageUrl: string; name: string }) => {
    return (
        <div className="flex items-center justify-between border-b px-4">
            <Item>
                <ItemMedia>
                    <Avatar className="scale-125">
                        <AvatarImage src={imageUrl} />
                        <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                </ItemMedia>
                <ItemContent className="gap-0">
                    <ItemTitle>{name}</ItemTitle>
                    <ItemDescription className="text-chart-4">Online</ItemDescription>
                </ItemContent>
            </Item>

            <div className="flex items-center gap-2">
                {[Phone, Video].map(Icon => (
                    <Button size="icon" variant="ghost">
                        <Icon className="h-4 w-4" />
                    </Button>
                ))}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>View profile</DropdownMenuItem>
                        <DropdownMenuItem>Clear chat</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                            Block user
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}