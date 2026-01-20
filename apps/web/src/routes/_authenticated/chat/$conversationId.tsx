import { createFileRoute } from "@tanstack/react-router";
import { getConversation } from "@/dbInteractions/queries/conversation.queries.ts";
import ChatView from "@/components/chat/ChatView.tsx";

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

  // const { socket, isConnected } = useSocket();
  // useEffect(() => {
  //   if (!socket || !isConnected) return;
  //   socket.on(
  //     `presence:${conversationData.data.otherUser[0].userId}`,
  //     (payload) => {
  //       console.log("Received presence", payload);
  //     },
  //   );
  // }, []);

  // console.log("PRESENCE", JSON.stringify(data, null, 2), isLoading);

  return <ChatView conversationData={conversationData.data} />;
}
