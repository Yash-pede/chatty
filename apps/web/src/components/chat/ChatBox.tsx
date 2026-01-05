import { Message } from "@/constants"
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar"
import { Button } from "@repo/ui/components/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@repo/ui/components/card"
import {
    Item,
    ItemContent,
} from "@repo/ui/components/item"
import { Input } from "@repo/ui/components/input"
import { Ellipsis, Mic, Paperclip, Phone, Send, Smile, Video } from "lucide-react"



export default function ChatCard({
    messages,
}: {
    messages: Message[]
}) {
    let myId = "user_001" // Assume this is the current user's ID
    return (
        <Card className="w-full h-screen flex flex-col">
            {/* HEADER */}
            <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" alt="Sandeep Singh" />
                        <AvatarFallback>SS</AvatarFallback>
                    </Avatar>

                    <div>
                        <CardTitle className="text-sm font-medium">
                            Sandeep Singh
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                            Last seen at 7:30 PM
                        </CardDescription>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {[Video, Phone, Ellipsis].map((Icon, index) => (
                        <Button
                            key={index}
                            variant="outline"
                            size="icon"
                            aria-label="action"
                        >
                            <Icon className="h-4 w-4" />
                        </Button>
                    ))}
                </div>
            </CardHeader>

            {/* MESSAGES */}
            <CardContent className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                {messages.map((msg) => {
                    const isMe = msg.senderId === myId

                    return (
                        <Item key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <ItemContent className={`rounded-lg ${isMe ? "bg-green-400 text-white rounded-br-none" : "bg-gray-200 rounded-bl-none"} px-3 py-2 max-w-fit`}>
                                {msg.content.text}
                            </ItemContent>
                        </Item>
                    )
                })}
            </CardContent>


            {/* FOOTER */}
            <CardFooter className="flex items-center gap-2">
                {[Smile, Paperclip].map((Icon, index) => (
                    <Button
                        key={index}
                        variant={"ghost"}
                        size={"icon"}
                    >
                        <Icon className="h-5 w-5" />
                    </Button>
                ))}

                <Input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1"
                />
                {[Mic, Send].map((Icon, index) => (
                    <Button
                        key={index}
                        variant={Icon === Send ? "default" : "ghost"}
                        size="icon"
                    >
                        <Icon className="h-5 w-5" />
                    </Button>
                ))}
            </CardFooter>
        </Card>
    )
}