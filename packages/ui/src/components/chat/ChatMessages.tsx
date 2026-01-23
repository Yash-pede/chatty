import { CheckCheck, FileText, Play } from "lucide-react";
import { Button } from "../button.js";
import { ChatUser, Message, MessageContentType } from "@repo/db/types";
import { Item, ItemGroup } from "../item.js";
import { Card } from "../card.js";
import { useEffect, useLayoutEffect, useRef } from "react";
import { cn } from "../../lib/utils.js";
import { format } from "date-fns";

export const ChatMessages = ({
  messages,
  userData,
  ChatTopElement,
}: {
  messages: Message[];
  userData: ChatUser;
  ChatTopElement: (node?: Element | null | undefined) => void
}) => {
  const chatRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const isInitialMount = useRef(true);

  const prevStateRef = useRef({
    scrollTop: 0,
    scrollHeight: 0,
    messageCount: 0,
  });

  // Snapshot BEFORE render
  useLayoutEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    prevStateRef.current = {
      scrollTop: el.scrollTop,
      scrollHeight: el.scrollHeight,
      messageCount: messages.length,
    };
  }, [messages.length]);

  // Adjust scroll AFTER render
  useLayoutEffect(() => {
    const el = chatRef.current;
    if (!el) return;

    const prev = prevStateRef.current;
    const newScrollHeight = el.scrollHeight;

    // First mount → scroll to bottom
    if (isInitialMount.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      isInitialMount.current = false;
      return;
    }

    // Older messages prepended → keep scroll stable
    if (messages.length > prev.messageCount && el.scrollTop < 50) {
      // Don't scroll to bottom, just maintain position
      el.scrollTop = prev.scrollTop + (newScrollHeight - prev.scrollHeight);
      return;
    }

    // New message added by me → scroll bottom
    if (messages.length > prev.messageCount) {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        return;
    }

  }, [messages, userData?.id]);

  // Prevent exact top scroll
  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;

    const handler = () => {
      if (el.scrollTop < 2) el.scrollTop = 2;
    };

    el.addEventListener("scroll", handler);
    return () => el.removeEventListener("scroll", handler);
  }, []);




  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-6" ref={chatRef}>
      {messages?.map((message: Message, index) => {
        const isMe = message.senderId === userData?.id;
        return (
          <Item
            key={message.id}
            className={cn(
              "flex w-fit max-w-[75%] flex-col items-end gap-1 rounded-lg px-4 py-3 text-sm",
              "wrap-break-word whitespace-pre-wrap",
              isMe ? "ml-auto bg-primary text-primary-foreground" : "bg-muted",
            )}
            ref={index === 0 ? ChatTopElement : undefined}
          >
            {/* TEXT MESSAGE */}
            {message.type === "text" && (
              <Item
                className={cn(
                  "p-0 leading-relaxed",
                  isMe ? "text-right" : "text-left w-full",
                )}
              >
                {(message.content as MessageContentType)?.text}
              </Item>
            )}

            {/* VIDEO MESSAGE */}
            {message.type === "image" && (
              <Card className="border-0 h-40 w-64 items-center justify-center bg-foreground">
                <Play className="h-10 w-10 text-background" />
              </Card>
            )}

            {/* FILE MESSAGE */}
            {message.type === "file" && (
              <Card className="flex-row p-3">
                <FileText className="h-8 w-8 shrink-0 text-primary" />
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto shrink-0 bg-ba text-foreground"
                >
                  Download
                </Button>
              </Card>
            )}

            {/* TIME + DELIVERY */}
            <ItemGroup className="flex-row justify-end gap-1">
              <Item className="p-0 text-xs">
                {" "}
                {format(message.createdAt, "p")}
              </Item>
              {isMe && <CheckCheck size={18} />}
            </ItemGroup>
          </Item>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};
