import { ChatUser, Message } from "@repo/db/types";
import { useLayoutEffect, useRef } from "react";
import { ChatMessageItem } from "@repo/ui/components/chat/ChatMessageItem.js";
import { useVirtualizer } from "@tanstack/react-virtual";

export const ChatMessages = ({
  messages,
  userData,
}: {
  messages: Message[];
  userData: ChatUser;
}) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });
  useLayoutEffect(() => {
    if (messages.length > 0) {
      virtualizer.scrollToIndex(messages.length - 1, { align: "end" });
    }
  }, [messages.length]);

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div ref={parentRef} className="flex-1 overflow-y-auto  px-4 py-6">
      <div
        className="relative w-full"
        style={{
          height: `${virtualizer.getTotalSize()}px`,
        }}
      >
        {virtualItems.map((vItem) => {
          const message: Message = messages[vItem.index]!;
          return (
            <div
              key={vItem.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${vItem.start}px)`,
              }}
              ref={virtualizer.measureElement}
              data-index={vItem.index}
            >
              <ChatMessageItem
                isMe={message.senderId === userData?.id}
                message={message}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
