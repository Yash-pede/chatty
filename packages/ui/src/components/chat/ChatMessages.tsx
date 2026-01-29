import { ChatUser, Message } from "@repo/db/types";
import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ChatMessageItem } from "./ChatMessageItem.js";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowDown, Loader2 } from "lucide-react";

// interface for the Ref
export interface ChatMessagesRef {
  scrollToBottom: (smooth?: boolean) => void;
}

interface ChatMessagesProps {
  messages: Message[];
  userData: ChatUser;
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => Promise<void>;
  failedIds: Set<string>;
}

export const ChatMessages = forwardRef<ChatMessagesRef, ChatMessagesProps>(
  ({ messages, userData, isLoading, hasMore, onLoadMore, failedIds }, ref) => {
    const parentRef = useRef<HTMLDivElement>(null);
    const [isFetchingOlder, setIsFetchingOlder] = useState(false);

    // State to track if we should auto-scroll on new messages
    const [shouldStickToBottom, setShouldStickToBottom] = useState(true);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const virtualizer = useVirtualizer({
      count: messages.length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => 60,
      overscan: 5,
    });

    const virtualItems = virtualizer.getVirtualItems();

    // 1. Expose scrollToBottom to Parent (ChatView)
    useImperativeHandle(ref, () => ({
      scrollToBottom: (smooth = false) => {
        if (!parentRef.current) return;

        // Force scroll to end
        virtualizer.scrollToIndex(messages.length - 1, {
          align: "end",
          behavior: smooth ? "smooth" : "auto",
        });

        // Re-enable stickiness
        setShouldStickToBottom(true);
        setShowScrollButton(false);
      },
    }));

    // 2. Smart Auto-Scroll Logic
    useLayoutEffect(() => {
      // Only scroll if we are "stuck" to the bottom
      if (shouldStickToBottom && messages.length > 0) {
        virtualizer.scrollToIndex(messages.length - 1, { align: "end" });
      }
    }, [messages.length, shouldStickToBottom, virtualizer]);

    // 3. Scroll Listener
    const onScroll = async (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;

      // A. Check if user is at the bottom (within 100px)
      const isAtBottom =
        target.scrollHeight - target.scrollTop - target.clientHeight <= 100;

      setShouldStickToBottom(isAtBottom);
      setShowScrollButton(!isAtBottom);

      // B. Load Older Messages (Top)
      if (
        target.scrollTop < 50 &&
        hasMore &&
        !isLoading &&
        !isFetchingOlder &&
        messages.length > 0
      ) {
        setIsFetchingOlder(true);
        const oldHeight = target.scrollHeight;
        const oldTop = target.scrollTop;

        await onLoadMore();

        // Restore scroll position to prevent jumping
        requestAnimationFrame(() => {
          if (parentRef.current) {
            const newHeight = parentRef.current.scrollHeight;
            parentRef.current.scrollTop = oldTop + (newHeight - oldHeight);
          }
          setIsFetchingOlder(false);
        });
      }
    };

    return (
      <div className="flex-1 relative flex flex-col overflow-hidden">
        <div
          ref={parentRef}
          className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth"
          onScroll={onScroll}
        >
          {/* Loading Spinner */}
          {isLoading && messages.length > 0 && (
            <div className="absolute top-2 left-0 w-full flex justify-center z-10">
              <div className="bg-background/80 rounded-full p-1 shadow-sm border">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}

          {/* Initial Loading */}
          {isLoading && messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          <div
            className="relative w-full"
            style={{
              height: `${virtualizer.getTotalSize()}px`,
            }}
          >
            {virtualItems.map((vItem) => {
              const message = messages[vItem.index]!;
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
                    isFailed={failedIds.has(message.id)}
                    onRetry={() => {}}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Scroll to Bottom Button */}
        {showScrollButton && (
          <button
            onClick={() => {
              virtualizer.scrollToIndex(messages.length - 1, {
                align: "end",
                behavior: "smooth",
              });
              setShouldStickToBottom(true);
            }}
            className="absolute bottom-4 right-4 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all z-20"
          >
            <ArrowDown className="h-5 w-5" />
          </button>
        )}
      </div>
    );
  },
);

ChatMessages.displayName = "ChatMessages";
