import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from "@repo/ui/components/sidebar";
import { Search } from "lucide-react";
import { NewChatDropdown } from "@/components/chat/ChatDropdown.tsx";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@repo/ui/components/input-group";
import { useEffect } from "react";
import SidebarChatItem from "@/components/chat/SidebarChatItem.tsx";
import CustomSidebarFooter from "@/components/chat/SidebarFooter.tsx";

export function AppSidebar() {
  const { setOpenMobile, isMobile } = useSidebar();

  useEffect(() => {
    if (isMobile) setOpenMobile(true);
  }, [isMobile, setOpenMobile]);

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
              <SidebarChatItem />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <CustomSidebarFooter />
    </Sidebar>
  );
}
