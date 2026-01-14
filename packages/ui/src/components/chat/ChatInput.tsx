import { Paperclip, Send, Smile } from "lucide-react";
import { Button } from "../button.js";
import { Input } from "../input.js";
import EmojiPicker from "emoji-picker-react";
import { useState } from "react";
import { cn } from "@repo/ui/lib/utils.js";
import { Card } from "../card.js";

export const ChatInput = () => {
    const [showEmojiSelector, setShowEmojiSelector] = useState(false);

    return (
        <div className="relative flex items-center gap-2 border-t px-4 py-3">
            <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowEmojiSelector(!showEmojiSelector)}
            >
                <Smile className="h-4 w-4" />
            </Button>

            <Button size="icon" variant="ghost">
                <Paperclip className="h-4 w-4" />
            </Button>

            <Input placeholder="Enter message..." className="flex-1" />

            <Button size="icon">
                <Send className="h-4 w-4" />
            </Button>

            {/* Emoji Picker */}
            <Card
                className={cn(
                    "absolute p-0 left-4 bottom-[calc(100%+8px)] z-50 transition-all duration-200 ease-out",
                    showEmojiSelector
                        ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                        : "opacity-0 translate-y-3 scale-95 pointer-events-none"
                )}
            >
                <EmojiPicker height={400} width={310} skinTonesDisabled searchDisabled/>
            </Card>
        </div>
    );
};
