import { cn } from "../../lib/utils.js";
import { format } from "date-fns";
import { Button } from "../button.js";
import { Message, MessageContentType } from "@repo/db/types";
import { Item, ItemGroup } from "../item.js";
import { Card } from "../card.js";
import { CheckCheck, FileText, Play } from "lucide-react";

export const ChatMessageItem = ({
  message,
  isMe,
  isFailed,
  onRetry,
}: {
  message: Message;
  isMe: boolean;
  isFailed: boolean;
  onRetry: () => void;
}) => {
  // console.log("MESSAGE", message,isFailed);
  return (
    <Item
      key={message.id}
      className={cn(
        "flex w-fit max-w-[75%] flex-col items-end gap-1 rounded-lg px-4 py-3 text-sm my-1",
        "wrap-break-word whitespace-pre-wrap",
        isMe ? "ml-auto bg-primary text-primary-foreground" : "bg-muted",
        isFailed && "bg-destructive",
      )}
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
            className="ml-auto shrink-0 text-foreground"
          >
            Download
          </Button>
        </Card>
      )}

      {/* TIME + DELIVERY */}
      <ItemGroup className="flex-row justify-end gap-1">
        <Item className="p-0 text-xs"> {format(message.createdAt, "p")}</Item>
        {isMe && <CheckCheck size={18} />}
      </ItemGroup>
    </Item>
  );
};
