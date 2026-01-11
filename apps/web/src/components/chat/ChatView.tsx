import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
  CheckCheck,
  FileText,
  MoreVertical,
  Paperclip,
  Phone,
  Play,
  Send,
  Smile,
  Video,
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { ConversationWithOtherUser } from "@repo/db/types";

/* -------------------------------------------------------------------------- */
/*                               MOCK CONSTANTS                               */
/* -------------------------------------------------------------------------- */

const CURRENT_USER_ID = "me";

const CHAT_USER = {
  id: "user_1",
  name: "Jacquenetta Slowgrave",
  avatar: "",
  online: true,
};

const MESSAGES = [
  {
    id: "1",
    senderId: CHAT_USER.id,
    type: "text",
    content: "Hey, are you online right now?",
    time: "05:18 PM",
  },
  {
    id: "2",
    senderId: CURRENT_USER_ID,
    type: "text",
    content: "Yes, I am. What’s up?",
    time: "05:18 PM",
    delivered: true,
  },
  {
    id: "3",
    senderId: CHAT_USER.id,
    type: "text",
    content:
      "I wanted to confirm something before I send the files. They’re pretty important, and I don’t want to mess anything up.",
    time: "05:19 PM",
  },
  {
    id: "4",
    senderId: CURRENT_USER_ID,
    type: "text",
    content:
      "No worries at all. Take your time. I just want to make sure everything is correct before we proceed.",
    time: "05:19 PM",
    delivered: true,
  },
  {
    id: "5",
    senderId: CHAT_USER.id,
    type: "text",
    content:
      "Alright, just so you know — these documents contain contract details, invoices, and a couple of sensitive reports. Please handle them carefully.",
    time: "05:20 PM",
  },
  {
    id: "6",
    senderId: CURRENT_USER_ID,
    type: "text",
    content:
      "Understood. I know how important this file is to you. You can trust me 🙂\n\nI’ll review everything and get back to you if I notice anything unusual.",
    time: "05:20 PM",
    delivered: true,
  },
  {
    id: "7",
    senderId: CHAT_USER.id,
    type: "video",
    thumbnail: "/video-thumb.jpg",
    duration: "2:42",
    time: "05:21 PM",
  },
  {
    id: "8",
    senderId: CHAT_USER.id,
    type: "text",
    content:
      "This video explains the overall flow and background. Watch it first before opening the documents — it’ll give you better context.",
    time: "05:21 PM",
  },
  {
    id: "9",
    senderId: CURRENT_USER_ID,
    type: "text",
    content:
      "Got it. I’ll watch the video first and then go through the files step by step.",
    time: "05:22 PM",
    delivered: true,
  },
  {
    id: "10",
    senderId: CHAT_USER.id,
    type: "file",
    fileName: "Important_Contract_Documents_Final_Reviewed_Version_v3_2026.pdf",
    size: "50 KB",
    time: "05:23 PM",
  },
  {
    id: "11",
    senderId: CURRENT_USER_ID,
    type: "file",
    fileName: "Internal_Notes_and_Observations_After_Initial_Review.txt",
    size: "12 KB",
    time: "05:24 PM",
    delivered: true,
  },
  {
    id: "12",
    senderId: CHAT_USER.id,
    type: "text",
    content:
      "Perfect. Please let me know if you find anything that needs clarification or correction. Some of the clauses are intentionally detailed.",
    time: "05:24 PM",
  },
  {
    id: "13",
    senderId: CURRENT_USER_ID,
    type: "text",
    content:
      "Sure. I’ll send you a detailed breakdown once I’m done. Might take a bit of time because I want to be thorough.",
    time: "05:25 PM",
    delivered: true,
  },
  {
    id: "14",
    senderId: CHAT_USER.id,
    type: "text",
    content:
      "That’s totally fine. Accuracy matters more than speed here. Thanks for taking this seriously.",
    time: "05:25 PM",
  },
  {
    id: "15",
    senderId: CURRENT_USER_ID,
    type: "text",
    content:
      "Absolutely. I’ll ping you once everything is reviewed and organized properly.",
    time: "05:26 PM",
    delivered: true,
  },
];

/* -------------------------------------------------------------------------- */
/*                                 COMPONENT                                  */
/* -------------------------------------------------------------------------- */

export default function ChatView({
  conversationData,
}: {
  conversationData: ConversationWithOtherUser;
}) {
  const displayName =
    conversationData.otherUser.firstName ??
    conversationData.otherUser.username ??
    "Unknown";

  return (
    <div className="flex h-svh w-full flex-col bg-background">
      <ChatHeader
        name={displayName}
        imageUrl={conversationData.otherUser.imageUrl ?? ""}
      />
      <ChatMessages />
      <ChatInput />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  HEADER                                    */
/* -------------------------------------------------------------------------- */

function ChatHeader({ imageUrl, name }: { imageUrl: string; name: string }) {
  return (
    <div className="flex items-center justify-between border-b px-4 py-3">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={imageUrl} />
          <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex flex-col">
          <span className="font-medium leading-none">{name}</span>
          <span className="text-xs text-green-500">{"Online"}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <IconButton icon={Video} />
        <IconButton icon={Phone} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconButton icon={MoreVertical} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View profile</DropdownMenuItem>
            <DropdownMenuItem>Clear chat</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Block user
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                MESSAGES                                    */
/* -------------------------------------------------------------------------- */
function ChatMessages() {
  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-6">
      {MESSAGES.map((message) => {
        const isMe = message.senderId === CURRENT_USER_ID;

        return (
          <div
            key={message.id}
            className={cn(
              "flex w-fit max-w-[75%] flex-col gap-1 rounded-lg px-4 py-3 text-sm",
              "break-words whitespace-pre-wrap",
              isMe ? "ml-auto bg-primary text-primary-foreground" : "bg-muted",
            )}
          >
            {/* TEXT MESSAGE */}
            {message.type === "text" && (
              <p className="leading-relaxed">{message.content}</p>
            )}

            {/* VIDEO MESSAGE */}
            {message.type === "video" && (
              <div className="relative w-64 overflow-hidden rounded-md">
                <div className="flex h-40 items-center justify-center bg-black/70">
                  <Play className="h-10 w-10 text-white" />
                </div>
                <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1 text-xs text-white">
                  {message.duration}
                </span>
              </div>
            )}

            {/* FILE MESSAGE */}
            {message.type === "file" && (
              <div className="flex min-w-0 items-center gap-3 rounded-md border bg-background text-foreground p-3">
                <FileText className="h-8 w-8 shrink-0 text-primary" />

                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">
                    {message.fileName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {message.size}
                  </span>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto shrink-0 bg-foreground text-foreground"
                >
                  Download
                </Button>
              </div>
            )}

            {/* TIME + DELIVERY */}
            <div className="flex items-center justify-end gap-1 text-[10px] opacity-70">
              <span>{message.time}</span>
              {isMe && message.delivered && <CheckCheck />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   INPUT                                    */
/* -------------------------------------------------------------------------- */

function ChatInput() {
  return (
    <div className="flex items-center gap-2 border-t px-4 py-3">
      <IconButton icon={Smile} />
      <IconButton icon={Paperclip} />

      <Input placeholder="Enter message..." className="flex-1" />

      <Button size="icon">
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              REUSABLE UI                                   */
/* -------------------------------------------------------------------------- */

function IconButton({ icon: Icon }: { icon: any }) {
  return (
    <Button size="icon" variant="ghost">
      <Icon className="h-4 w-4" />
    </Button>
  );
}
