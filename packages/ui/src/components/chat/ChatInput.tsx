import { Paperclip, Reply, Send, Smile, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { Message, MessageContentType } from "@repo/db/types";

import { Button } from "../button.js";
import { Input } from "../input.js";
import { Popover, PopoverContent, PopoverTrigger } from "../popover.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip.js";

// Helper to get text for preview
const getPreviewText = (msg: Message) => {
  if (msg.type === "text") return (msg.content as MessageContentType).text;
  return `[${msg.type}]`;
};

type ChatInputProps = {
  // New signature: Object with text + optional replyToId
  sendMessage: (opts: { text: string; replyToId?: string }) => Promise<void>;

  // New props for Reply state
  replyingTo: Message | null;
  onCancelReply: () => void;
};

export const ChatInput = ({
  sendMessage,
  replyingTo,
  onCancelReply,
}: ChatInputProps) => {
  const [emojiOpen, setEmojiOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // 1. Auto-focus when replying
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

    // 2. Call sendMessage with the object payload
    await sendMessage({
      text,
      replyToId: replyingTo?.id, // Pass the ID if it exists
    });

    inputEl.value = "";

    // 3. Close the reply bar
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
      <div className="flex items-center gap-2 px-4 py-3">
        {/* Emoji Picker */}
        <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
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
              // theme="auto" // If you support dark mode
              onEmojiClick={handleEmojiClick}
            />
          </PopoverContent>
        </Popover>

        {/* Attachment (Disabled) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>File sharing coming soon</p>
          </TooltipContent>
        </Tooltip>

        {/* Text Input */}
        <Input
          ref={inputRef}
          placeholder={replyingTo ? "Type your reply..." : "Enter message..."}
          className="flex-1 bg-muted/30 focus-visible:ring-1 focus-visible:ring-primary"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />

        {/* Send Button */}
        <Button
          size="icon"
          onClick={handleSend}
          className="rounded-full h-10 w-10 shrink-0"
        >
          <Send className="h-4 w-4 ml-0.5" />
        </Button>
      </div>
    </div>
  );
};
