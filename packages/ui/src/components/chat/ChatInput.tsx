import { Paperclip, Reply, Send, Smile, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { Message, MessageContentType } from "@repo/db/types";
import { cn } from "@repo/ui/lib/utils";

import { Button } from "../button.js";
import { Popover, PopoverContent, PopoverTrigger } from "../popover.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip.js";

const getPreviewText = (msg: Message) => {
  if (msg.type === "text") return (msg.content as MessageContentType).text;
  return `[${msg.type}]`;
};

type ChatInputProps = {
  sendMessage: (opts: { text: string; replyToId?: string }) => Promise<void>;
  replyingTo: Message | null;
  onCancelReply: () => void;
};

export const ChatInput = ({
  sendMessage,
  replyingTo,
  onCancelReply,
}: ChatInputProps) => {
  const [emojiOpen, setEmojiOpen] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const adjustHeight = () => {
    const textarea = inputRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";

    const newHeight = Math.min(textarea.scrollHeight, 150);
    textarea.style.height = `${newHeight}px`;

    textarea.style.overflowY = newHeight >= 150 ? "auto" : "hidden";
  };

  useEffect(() => {
    if (replyingTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyingTo]);

  const handleSend = async () => {
    const inputEl = inputRef.current;
    if (!inputEl) return;

    const text = inputEl.value.trim();
    if (!text) return;

    await sendMessage({
      text,
      replyToId: replyingTo?.id,
    });

    inputEl.value = "";
    inputEl.style.height = "auto";
    if (replyingTo) onCancelReply();
  };

  const handleEmojiClick = (emoji: EmojiClickData) => {
    const inputEl = inputRef.current;
    if (!inputEl) return;

    const start = inputEl.selectionStart ?? inputEl.value.length;
    const end = inputEl.selectionEnd ?? inputEl.value.length;

    inputEl.value =
      inputEl.value.slice(0, start) + emoji.emoji + inputEl.value.slice(end);

    const cursor = start + emoji.emoji.length;
    inputEl.setSelectionRange(cursor, cursor);

    adjustHeight();
    inputEl.focus();
  };

  return (
    <div className="flex flex-col border-t bg-background">
      {/* --- REPLY PREVIEW BAR --- */}
      {replyingTo && (
        <div className="flex items-center justify-between px-4 py-2 bg-muted/40 border-b border-border/50 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-3 overflow-hidden">
            <Reply className="h-4 w-4 text-primary shrink-0" />
            <div className="flex flex-col border-l-2 border-primary pl-2 py-0.5">
              <span className="text-[10px] font-bold text-primary uppercase">
                Replying to
              </span>
              <span className="text-xs text-muted-foreground truncate max-w-[250px] sm:max-w-[400px]">
                {getPreviewText(replyingTo)}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full hover:bg-background"
            onClick={onCancelReply}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      )}

      {/* --- INPUT AREA --- */}
      {/* Changed items-center -> items-end to keep buttons at bottom when textarea grows */}
      <div className="flex items-end gap-2 px-4 py-3">
        <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground mb-1"
            >
              <Smile className="h-5 w-5" />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            side="top"
            align="start"
            className="p-0 w-auto border-none shadow-none"
          >
            {/*@ts-ignore*/}
            <EmojiPicker
              height={350}
              width={320}
              onEmojiClick={handleEmojiClick}
            />
          </PopoverContent>
        </Popover>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground mb-1"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>File sharing coming soon</p>
          </TooltipContent>
        </Tooltip>

        {/* NATIVE TEXTAREA WITH SHADCN STYLES */}
        <textarea
          ref={inputRef}
          rows={1}
          placeholder={replyingTo ? "Type your reply..." : "Enter message..."}
          onInput={adjustHeight}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className={cn(
            "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",

            "flex-1 min-h-[40px] max-h-[150px]",
            "resize-none overflow-hidden",
            "bg-muted/30 focus-visible:ring-1 focus-visible:ring-primary",
          )}
        />

        <Button
          size="icon"
          onClick={handleSend}
          className="rounded-full h-10 w-10 shrink-0 mb-1"
        >
          <Send className="h-4 w-4 ml-0.5" />
        </Button>
      </div>
    </div>
  );
};
