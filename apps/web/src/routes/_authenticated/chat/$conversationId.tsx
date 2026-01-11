import { createFileRoute } from "@tanstack/react-router";
import ChatView from "@/components/chat/ChatView.tsx";
import { getConversation } from "@/queries/conversation.queries.ts";

export const Route = createFileRoute("/_authenticated/chat/$conversationId")({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    const { conversationId } = params;

    const conversationData = await context.queryClient.ensureQueryData({
      queryKey: ["conversation-data", conversationId],
      queryFn: () => getConversation(conversationId),
    });

    return { conversationData };
  },
});

function RouteComponent() {
  const { conversationData } = Route.useLoaderData();
  console.log("LODA", conversationData.data);
  return <ChatView conversationData={conversationData.data} />;
}
