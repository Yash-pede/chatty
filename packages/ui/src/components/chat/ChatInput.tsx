import { Paperclip, Send, Smile } from "lucide-react";
import { Button } from "../button.js";
import { Input } from "../input.js";

export const ChatInput = () => {
    return (
        <div className="flex items-center gap-2 border-t px-4 py-3">
            {[Smile, Paperclip].map(Icon => (
                <Button size="icon" variant="ghost">
                    <Icon className="h-4 w-4" />
                </Button>
            ))}
            <Input placeholder="Enter message..." className="flex-1" />

            <Button size="icon">
                <Send className="h-4 w-4" />
            </Button>
        </div>
    );
}