import { cn } from "../../lib/utils.js";
import { format } from "date-fns";
import { Message, MessageContentType } from "@repo/db/types";
import { Button } from "../button.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu.js";
import {
  AlertCircle,
  CheckCheck,
  Copy,
  FileText,
  MoreVertical,
  Play,
  Reply,
  Trash2,
} from "lucide-react";

interface ChatMessageItemProps {
  message: Message;
  isMe: boolean;
  isFailed?: boolean;
  onRetry?: () => void;
  onReply: (message: Message) => void;
  onScrollToReply?: (id: string) => void;
  repliedToMessage?: Message;
  isHighlighted?: boolean;
}

export const ChatMessageItem = ({
  message,
  isMe,
  isFailed,
  onRetry,
  onReply,
  onScrollToReply,
  repliedToMessage,
  isHighlighted,
}: ChatMessageItemProps) => {
  const content = message.content as MessageContentType;

  const handleCopy = () => {
    if (message.type === "text" && content.text) {
      navigator.clipboard.writeText(content.text);
    }
  };

  const getMessagePreviewText = (msg: Message) => {
    if (msg.type === "text") return (msg.content as any).text;
    return `[${msg.type}]`;
  };

  return (
    <div
      className={cn(
        "flex w-fit max-w-[75%] flex-col items-end gap-1 rounded-lg px-4 py-3 text-sm my-1",
        "wrap-break-word whitespace-pre-wrap break-all",
        isMe ? "ml-auto bg-primary text-primary-foreground" : "bg-muted",
        isFailed && "bg-destructive",
      )}
    >
      <div
        className={cn(
          "flex max-w-[75%] flex-col",
          isMe ? "items-end" : "items-start",
        )}
      >
        {/* --- MAIN BUBBLE CONTAINER --- */}
        <div
          className={cn(
            "relative flex flex-col gap-1 rounded-xl px-3 py-2 text-sm shadow-sm transition-all duration-500",
            isMe
              ? "bg-primary text-primary-foreground rounded-tr-none"
              : "bg-muted text-foreground rounded-tl-none",
            isFailed &&
              "border-2 border-destructive bg-destructive/10 text-destructive",
            isHighlighted &&
              "ring-2 ring-yellow-400 bg-yellow-400/20 text-foreground",
          )}
        >
          {/* 1. REPLIED MESSAGE BUBBLE (Inside) */}
          {repliedToMessage && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (onScrollToReply) onScrollToReply(repliedToMessage.id);
              }}
              className={cn(
                "mb-1 flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs opacity-90 cursor-pointer hover:opacity-100 transition-opacity",
                isMe ? "bg-primary-foreground/20" : "bg-background/50",
              )}
            >
              <div
                className={cn(
                  "h-6 w-1 rounded-full",
                  isMe ? "bg-primary-foreground" : "bg-primary",
                )}
              />
              <div className="flex flex-col overflow-hidden leading-tight">
                <span className="font-bold opacity-80 text-[10px]">
                  Reply to:
                </span>
                <span className="truncate max-w-[150px] opacity-70">
                  {getMessagePreviewText(repliedToMessage)}
                </span>
              </div>
            </div>
          )}

          {/* 2. MAIN CONTENT */}
          <div className="min-w-[60px]">
            {/* TEXT */}
            {message.type === "text" && (
              <p className="leading-relaxed whitespace-pre-wrap break-words">
                {content.text}
              </p>
            )}

            {/* VIDEO PLACEHOLDER */}
            {message.type === "image" && (
              <div className="flex h-40 w-64 items-center justify-center rounded bg-black/10">
                <Play className="h-10 w-10 opacity-50" />
              </div>
            )}

            {/* FILE PLACEHOLDER */}
            {message.type === "file" && (
              <div className="flex items-center gap-2 rounded bg-background/20 p-2">
                <FileText className="h-5 w-5" />
                <span className="underline truncate max-w-[200px]">
                  {"File"}
                </span>
              </div>
            )}
          </div>

          {/* 3. FOOTER (Time + Status) */}
          <div className="mt-0.5 flex items-center justify-end gap-1 text-[10px] opacity-70">
            <span>{format(new Date(message.createdAt), "p")}</span>
            {isMe && (
              <>
                {isFailed ? (
                  <AlertCircle className="h-3 w-3 text-destructive" />
                ) : (
                  <CheckCheck className="h-3 w-3" />
                )}
              </>
            )}
          </div>

          {/* 4. DROPDOWN MENU (The 3 Dots) */}
          {/* Only visible on group-hover or when open */}
          <div
            className={cn(
              "absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity",
              isMe ? "-left-8" : "-right-8",
            )}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full hover:bg-muted data-[state=open]:opacity-100"
                >
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isMe ? "end" : "start"}>
                <DropdownMenuItem onClick={handleCopy}>
                  <Copy className="mr-2 h-4 w-4" />
                  <span>Copy</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onReply(message)}>
                  <Reply className="mr-2 h-4 w-4" />
                  <span>Reply</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* RETRY TEXT (Outside Bubble) */}
        {isFailed && isMe && onRetry && (
          <button
            onClick={onRetry}
            className="mt-1 text-xs text-destructive underline hover:text-destructive/80 self-end"
          >
            Retry Send
          </button>
        )}
      </div>
    </div>
  );
};
