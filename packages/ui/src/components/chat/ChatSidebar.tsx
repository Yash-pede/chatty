import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu.js";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@repo/ui/components/input-group";
import { PlusIcon, SearchIcon } from "lucide-react";

export interface sidebarData {
  id: string;
  type: "direct" | "group" | "support";
  name: string | null;
  createdBy: string;
  assignedAgentId: string | null;
  isClosed: boolean;
  lastMessageId: string;
  lastMessagePreview: string;
  lastMessageAt: string;
  metadata: Record<string, any>;
  createdAt: string;
}

const ChatSidebar = ({ sidebarData }: { sidebarData: sidebarData[] }) => {
  return (
    <main className="w-[27%] border bg-white dark:bg-black dark:text-white m-4 rounded-lg py-8 flex flex-col h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="flex w-full justify-between px-5">
        <h1 className="text-3xl font-bold text-[#27272B] dark:text-white">Chats</h1>

        <DropdownMenu>
          <DropdownMenuTrigger className="border rounded-full p-2 border-gray-300">
            <PlusIcon className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mr-25">
            {["New Chat", "CreateGroup", "Add Contact"].map((item) => (
              <DropdownMenuItem key={item}>{item}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-8 px-5">
        <InputGroup>
          <InputGroupInput placeholder="Chat search..." />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto mt-4">
        {sidebarData.map((item, index) => (
          <div
            key={index}
            className="p-2 relative flex gap-4 border-b cursor-pointer hover:bg-gray-100 rounded px-5"
          >
            {/* DP  */}
            <div className="relative">
              <div className="border rounded-full p-3 size-10 bg-black"></div>
              <div className="bg-green-400 size-3 rounded-full absolute bottom-2 right-0" />
            </div>
            {/* Msg Preview */}
            <div className="flex flex-col w-2/3">
              <h2 className="font-medium text-lg">{item.name ?? "Unnamed"}</h2>
              <p className="text-sm text-gray-500 truncate">
                {item.lastMessagePreview}
              </p>
            </div>
            {/* Time and Unread Count */}
            <div className="absolute right-5 flex flex-col items-end gap-1">
              <p className="text-gray-500 text-xs">
                {new Date(item.lastMessageAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              {index < 3 && (
                <div className="bg-green-400 rounded-full size-6 text-sm text-white flex justify-center items-center">
                  2
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default ChatSidebar;
