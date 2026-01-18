import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { toast } from "sonner";

import {
  ChatUser,
  ConversationWithOtherUser,
  InsertMessage,
  MessagesFetchResponse,
} from "@repo/db/types";

import { ChatHeader } from "@repo/ui/components/chat/ChatHeader";
import { ChatInput } from "@repo/ui/components/chat/ChatInput";
import { ChatMessages } from "@repo/ui/components/chat/ChatMessages";

import { useSocket } from "@/lib/sockets/SocketProvider";
import { getPaginatedMessages } from "@/dbInteractions/queries/message.queries.ts";
import { db } from "@/lib/indexdDB";
import { useLiveQuery } from "dexie-react-hooks";

const PAGE_SIZE = 30;

export default function ChatView({
  conversationData,
}: {
  conversationData: ConversationWithOtherUser;
}) {
  const { user } = useUser();
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();

  const conversationId = conversationData.conversationId;

  /* ----------------------------------------
     USER
  ---------------------------------------- */
  const chatUser: ChatUser = {
    id: user?.id ?? "",
    firstName: user?.firstName ?? null,
    lastName: user?.lastName ?? null,
    username: user?.username ?? null,
    imageUrl: user?.imageUrl ?? null,
  };

  /* ----------------------------------------
     INTERSECTION OBSERVER (TOP SENTINEL)
  ---------------------------------------- */
  const { ref: topRef, inView } = useInView({
    rootMargin: "100px",
    threshold: 0,
  });

  /* ----------------------------------------
     PAGINATED FETCH (OLDER MESSAGES)
  ---------------------------------------- */
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery<MessagesFetchResponse>({
      queryKey: ["messages", conversationId],
      queryFn: ({ pageParam }) =>
        getPaginatedMessages(conversationId, pageParam, PAGE_SIZE),
      initialPageParam: undefined,
      getNextPageParam: (lastPage) =>
        lastPage.pageInfo.hasMore ? lastPage.pageInfo.nextCursor : undefined,
      enabled: !!conversationId,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    });

  /* ----------------------------------------
     FETCH WHEN USER SCROLLS UP
  ---------------------------------------- */
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  /* ----------------------------------------
     SAVE FETCHED MESSAGES TO INDEXEDDB
  ---------------------------------------- */
  useEffect(() => {
    if (!data) return;

    const allMessages = data.pages.flatMap((p) => p.items);

    (async () => {
      await db.transaction("rw", db.messages, async () => {
        for (const msg of allMessages) {
          await db.messages.put(msg);
        }
      });
    })();
  }, [data]);

  /* ----------------------------------------
     READ FROM INDEXEDDB (UI SOURCE)
  ---------------------------------------- */
  const localMessages =
    useLiveQuery(() =>
      db.messages
        .where("conversationId")
        .equals(conversationId)
        .sortBy("sequence"),
    ) ?? [];

  /* ----------------------------------------
     SOCKET JOIN / LEAVE
  ---------------------------------------- */
  useEffect(() => {
    if (!socket || !isConnected) return;
    socket.emit("conversation:join", conversationId);
    return () => socket.emit("conversation:leave", conversationId);
  }, [socket, isConnected, conversationId]);

  /* ----------------------------------------
     SOCKET: NEW MESSAGE
  ---------------------------------------- */
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handler = async (message: any) => {
      await db.messages.put(message);

      queryClient.setQueryData(["messages", conversationId], (old: any) => {
        if (!old) return old;
        const firstPage = old.pages[0];
        return {
          ...old,
          pages: [
            {
              ...firstPage,
              items: [...firstPage.items, message],
            },
            ...old.pages.slice(1),
          ],
        };
      });
    };

    socket.on("message:new", handler);
    return () => socket.off("message:new", handler);
  }, [socket, isConnected, conversationId, queryClient]);

  /* ----------------------------------------
     SEND MESSAGE
  ---------------------------------------- */
  const sendMessage = async (payload: InsertMessage) => {
    if (!socket || !isConnected) {
      toast.error("Unable to connect");
      return;
    }

    let localId: string | undefined;

    try {
      socket.emit("message:send", payload);
      localId = await db.messages.add(payload);
    } catch {
      if (localId) await db.messages.delete(localId);
      toast.error("Failed to send message");
    }
  };

  const displayName =
    conversationData.otherUser.firstName ??
    conversationData.otherUser.username ??
    "Unknown";

  const fetchOlderMessages = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  /* ----------------------------------------
     RENDER
  ---------------------------------------- */
  return (
    <div className="flex h-svh w-full flex-col bg-background">
      <ChatHeader
        name={displayName}
        imageUrl={conversationData.otherUser.imageUrl ?? ""}
      />

      {/* TOP SENTINEL */}
      <div ref={topRef} />

      <ChatMessages
        messages={localMessages}
        userData={chatUser}
        isFetchingMore={isFetchingNextPage}
        onTopReached={fetchOlderMessages}
      />

      <ChatInput
        conversationId={conversationId}
        userId={user!.id}
        sendMessage={sendMessage}
      />
    </div>
  );
}
