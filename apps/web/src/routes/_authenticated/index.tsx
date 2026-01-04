import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@repo/ui/components/layout/Navbar";
import { UserButton } from "@clerk/clerk-react";
import MainChatComponent from "@/components/MainChat.tsx";

export const Route = createFileRoute("/_authenticated/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="h-screen flex flex-col">
      <Navbar UserButton={UserButton} />
      <MainChatComponent />
    </div>
  );
}
