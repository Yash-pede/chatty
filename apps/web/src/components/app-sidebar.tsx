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
import { User } from "@repo/db/types";
import { useQuery } from "@tanstack/react-query";
import { getAllUserConversations } from "@/queries/conversation.queries.ts";
import DefaultPending from "@repo/ui/components/layout/DefaultPending";
import { DefaultError } from "@repo/ui/components/layout/DefaultError";

export function AppSidebar({ userData }: { userData: User }) {
  const { setOpenMobile, isMobile } = useSidebar();

  const { error, isPending, data, refetch, isRefetching, isRefetchError } =
    useQuery({
      queryKey: ["conversations", userData.id],
      queryFn: () => getAllUserConversations(),
    });

  useEffect(() => {
    if (isMobile) setOpenMobile(true);
  }, [isMobile, setOpenMobile]);

  if (isPending || isRefetching)
    return (
      <Sidebar variant="floating">
        <DefaultPending className={"h-full w-full"} />
      </Sidebar>
    );

  if (error || isRefetchError || !data)
    return (
      <Sidebar variant="floating">
        <DefaultError error={error} onRetry={refetch} />
      </Sidebar>
    );

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
              {data.map((conversation) => (
                <SidebarChatItem
                  key={conversation.conversationId}
                  conversation={conversation}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <CustomSidebarFooter userData={userData} />
    </Sidebar>
  );
}
