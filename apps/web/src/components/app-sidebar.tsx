import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@repo/ui/components/sidebar";
import { Search } from "lucide-react";
import { UserButton } from "@clerk/clerk-react";
import { NewChatDropdown } from "@/components/chat/ChatDropdown.tsx";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@repo/ui/components/input-group";
import { useEffect } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";

export function AppSidebar() {
  const { state, open, setOpen, openMobile, setOpenMobile, isMobile } =
    useSidebar();

  useEffect(() => {
    if (isMobile) setOpenMobile(true);
  }, [isMobile]);

  return (
    <Sidebar variant="floating">
      <SidebarHeader title={"chat"} className={"mt-2"}>
        <div className="w-full flex flex-col gap-4">
          <div className={"flex justify-between items-center"}>
            <h3 className={"text-xl font-bold"}>Chats</h3>
            <NewChatDropdown />
          </div>
          <InputGroup>
            <InputGroupInput placeholder="Chat search..." />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            {/*<InputGroupAddon align="inline-end">12 results</InputGroupAddon>*/}
          </InputGroup>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className={"group/chat-item"}>
                  <Avatar>
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt="@shadcn"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>{" "}
                  CHAT
                  <SidebarMenuBadge className={"group-hover/chat-item:hidden "}>
                    1
                  </SidebarMenuBadge>
                  <SidebarMenuAction
                    className={"group-hover/chat-item:block hidden"}
                  >
                    L
                  </SidebarMenuAction>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <UserButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
