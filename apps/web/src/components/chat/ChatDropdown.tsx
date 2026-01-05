import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Button } from "@repo/ui/components/button";
import { Plus } from "lucide-react";

export function NewChatDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" className={"rounded-full"}>
          <Plus />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>New chat</DropdownMenuItem>
        <DropdownMenuItem>Create group</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
