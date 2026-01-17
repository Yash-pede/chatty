// File: components/chat/ChatInput.tsx

import { Paperclip, Send, Smile } from "lucide-react";
import { useRef, useState } from "react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

import { Button } from "../button.js";
import { Input } from "../input.js";
import { Popover, PopoverContent, PopoverTrigger } from "../popover.js";
import { InsertMessage } from "@repo/db/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip.js";

type ChatInputProps = {
  userId: string;
  conversationId: string;
  sendMessage: (payload: InsertMessage) => any;
};

export const ChatInput = ({
  userId,
  conversationId,
  sendMessage,
}: ChatInputProps) => {
  const [emojiOpen, setEmojiOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSend = async () => {
    const inputEl = inputRef.current;
    if (!inputEl) return;

    const text = inputEl.value.trim();
    if (!text) return;

    const payload: InsertMessage = {
      senderId: userId,
      conversationId,
      clientMessageId: crypto.randomUUID(),
      type: "text",
      content: { text },
    };

    await sendMessage(payload);
    inputEl.value = "";
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
    <div className="flex items-center gap-2 border-t px-4 py-3">
      {/* Emoji Picker */}
      <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
        <PopoverTrigger asChild>
          <Button size="icon" variant="ghost">
            <Smile className="h-4 w-4" />
          </Button>
        </PopoverTrigger>

        <PopoverContent side="top" align="start" className="p-0 w-auto">
          {/*@ts-ignore*/}
          <EmojiPicker
            height={380}
            width={320}
            skinTonesDisabled
            onEmojiClick={(emoji: EmojiClickData) => {
              handleEmojiClick(emoji);
              // setEmojiOpen(false); // optional UX
            }}
          />
        </PopoverContent>
      </Popover>

      {/* Attachment */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="icon" variant="ghost">
            <Paperclip className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Coming Soon</p>
        </TooltipContent>
      </Tooltip>

      {/* Input */}
      <Input
        ref={inputRef}
        placeholder="Enter message..."
        className="flex-1"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />

      {/* Send */}
      <Button size="icon" onClick={handleSend}>
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};
