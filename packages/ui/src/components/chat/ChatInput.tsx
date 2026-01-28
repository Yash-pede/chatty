import { Paperclip, Send, Smile } from "lucide-react";
import { useRef, useState } from "react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

import { Button } from "../button.js";
import { Popover, PopoverContent, PopoverTrigger } from "../popover.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip.js";
import { Textarea } from "../textarea.js";

type ChatInputProps = {
  sendMessage: (text: string) => any;
};

export const ChatInput = ({ sendMessage }: ChatInputProps) => {
  const [emojiOpen, setEmojiOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const adjustHeight = () => {
    const inputEl = inputRef.current;
    if (inputEl) {
      inputEl.style.height = "auto"; 
      inputEl.style.height = `${inputEl.scrollHeight}px`; 
    }
  };

  const handleSend = async () => {
    const inputEl = inputRef.current;
    if (!inputEl) return;

    const text = inputEl.value.trim();
    if (!text) return;

    await sendMessage(text);
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
    <div className="flex items-center gap-2 border-t px-4 py-3 w-full">
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
              setEmojiOpen(true);
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
      <Textarea
        ref={inputRef}
        placeholder="Enter message..."
        rows={1}
        className="flex-1 max-h-40 min-h-10 resize-none overflow-y-auto bg-transparent px-3 py-2 focus-visible:outline-none break-all"
        onChange={adjustHeight}
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
