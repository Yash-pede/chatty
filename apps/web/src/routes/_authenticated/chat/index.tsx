import { createFileRoute } from "@tanstack/react-router";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@repo/ui/components/empty";
import { Button } from "@repo/ui/components/button";
import { MessageSquareMore, PlusCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/chat/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Empty className="from-muted/50 to-background bg-linear-to-b from-30% flex justify-center items-center h-[calc(100svh-1rem)] my-2">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MessageSquareMore />
        </EmptyMedia>
        <EmptyTitle>Select a Conversation</EmptyTitle>
        <EmptyDescription>
          Your chats will appear here. Start a new conversation to get messaging
          with friends, groups, or agents.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" size="sm">
          <PlusCircle />
          create a conversation
        </Button>
      </EmptyContent>
    </Empty>
  );
}
