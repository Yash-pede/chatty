import { CheckCheck, FileText, Play } from "lucide-react";
import { Button } from "../button.js";
import { ChatUser, InsertMessage, MessageContentType } from "@repo/db/types";
import { Item, ItemGroup } from "../item.js";
import { Card } from "../card.js";
import { useEffect, useRef } from "react";
import { cn } from "../../lib/utils.js";

export const ChatMessages = ({
  messages,
  userData,
}: {
  messages: InsertMessage[];
  userData: ChatUser;
}) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-6">
      {messages?.map((message: InsertMessage) => {
        const isMe = message.senderId === userData?.id;
        return (
          <Item
            key={message.id}
            className={cn(
              "flex w-fit max-w-[75%] flex-col items-end gap-1 rounded-lg px-4 py-3 text-sm",
              "wrap-break-word whitespace-pre-wrap",
              isMe ? "ml-auto bg-primary text-primary-foreground" : "bg-muted",
            )}
          >
            {/* TEXT MESSAGE */}
            {message.type === "text" && (
              <Item className="leading-relaxed p-0">
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
              {/* <Item className="p-0 text-xs">
                {" "}
                {message.createdAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Item> */}
              {isMe && <CheckCheck size={18} />}
            </ItemGroup>
          </Item>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};