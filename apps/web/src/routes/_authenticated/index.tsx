import { createFileRoute } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar.tsx";
import ChatBox from "@/components/chat/ChatBox";
import { messages } from "@/constants";

export const Route = createFileRoute("/_authenticated/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <AppSidebar />
      <main className="flex-1">
        <ChatBox messages={messages} />
      </main>
    </>
  );
}
