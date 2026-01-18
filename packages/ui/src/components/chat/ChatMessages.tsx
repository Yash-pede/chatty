import { CheckCheck, FileText, Loader2, Play } from "lucide-react";
import { Button } from "../button.js";
import { ChatUser, InsertMessage, MessageContentType } from "@repo/db/types";
import { Item, ItemGroup } from "../item.js";
import { Card } from "../card.js";
import { useEffect, useLayoutEffect, useRef } from "react";
import { cn } from "../../lib/utils.js";
import { useInView } from "react-intersection-observer";

type Props = {
  messages: InsertMessage[];
  userData: ChatUser;
  isLoading: boolean;
  isFetchingMore: boolean;
  onTopReached: () => void;
};

export const ChatMessages = ({
  messages,
  userData,
  isLoading,
  isFetchingMore,
  onTopReached,
}: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  /* ----------------------------------------
     INTERSECTION OBSERVER (CORRECT)
  ---------------------------------------- */
  const { ref: topSentinelRef, inView } = useInView({
    root: containerRef.current, // 🔥 THIS IS THE FIX
    threshold: 0,
  });

  /* ----------------------------------------
     TRIGGER PAGINATION (SAFE)
  ---------------------------------------- */
  useEffect(() => {
    if (inView && !isFetchingMore) {
      onTopReached();
    }
  }, [inView, isFetchingMore, onTopReached]);

  /* ----------------------------------------
     SCROLL PRESERVATION
  ---------------------------------------- */
  const prevScrollHeightRef = useRef(0);
  const prevMessageCountRef = useRef(0);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (messages.length > prevMessageCountRef.current) {
      const diff = container.scrollHeight - prevScrollHeightRef.current;
      container.scrollTop += diff;
    }

    prevMessageCountRef.current = messages.length;
  }, [messages]);

  /* ----------------------------------------
     AUTO SCROLL FOR NEW MESSAGES
  ---------------------------------------- */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      120;

    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  /* ----------------------------------------
     TRACK HEIGHT BEFORE FETCH
  ---------------------------------------- */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    prevScrollHeightRef.current = container.scrollHeight;
  }, [isFetchingMore]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-1 flex-col overflow-y-auto px-4 py-6"
    >
      {/* 🔥 TOP SENTINEL (INSIDE SCROLL CONTAINER) */}
      <div ref={topSentinelRef} />

      {isFetchingMore && (
        <div className="mb-4 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      <div className="flex flex-col gap-4">
        {messages.map((message) => {
          const isMe = message.senderId === userData.id;

          return (
            <Item
              key={message.id}
              className={cn(
                "flex w-fit max-w-[75%] flex-col gap-1 rounded-lg px-4 py-3 text-sm",
                "break-words whitespace-pre-wrap",
                isMe
                  ? "ml-auto items-end bg-primary text-primary-foreground"
                  : "bg-muted",
              )}
            >
              {message.type === "text" && (
                <Item className="p-0 leading-relaxed">
                  {(message.content as MessageContentType)?.text}
                </Item>
              )}

              {message.type === "image" && (
                <Card className="flex h-40 w-64 items-center justify-center border-0 bg-foreground">
                  <Play className="h-10 w-10 text-background" />
                </Card>
              )}

              {message.type === "file" && (
                <Card className="flex items-center gap-3 p-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <Button size="sm" variant="outline">
                    Download
                  </Button>
                </Card>
              )}

              {isMe && (
                <ItemGroup className="flex justify-end">
                  <CheckCheck size={16} />
                </ItemGroup>
              )}
            </Item>
          );
        })}
      </div>

      <div ref={bottomRef} />
    </div>
  );
};
