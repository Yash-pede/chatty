import { sidebarChatData } from "@/constants/data";
import Chatbox from "@repo/ui/components/chat/Chatbox";
import ChatSidebar from "@repo/ui/components/chat/ChatSidebar";

const MainChatComponent = () => {
  return (
    <main className="flex flex-1 bg-[#FBFBFB] dark:bg-black">
      <ChatSidebar sidebarData={sidebarChatData} />
      <Chatbox />
    </main>
  );
};

export default MainChatComponent;
