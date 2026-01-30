import { ChatUser, Message } from "@repo/db/types";
import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChatMessageItem } from "./ChatMessageItem.js";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowDown, Loader2 } from "lucide-react";
import { toast } from "sonner"; // Assuming you use sonner

// Interface for the Ref
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
  onReplyMessage: (message: Message) => void;
}

export const ChatMessages = forwardRef<ChatMessagesRef, ChatMessagesProps>(
  (
    {
      messages,
      userData,
      isLoading,
      hasMore,
      onLoadMore,
      failedIds,
      onReplyMessage,
    },
    ref,
  ) => {
    const parentRef = useRef<HTMLDivElement>(null);
    const [isFetchingOlder, setIsFetchingOlder] = useState(false);
    const [shouldStickToBottom, setShouldStickToBottom] = useState(true);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const [highlightedId, setHighlightedId] = useState<string | null>(null);

    const messageMap = useMemo(
      () => new Map(messages.map((m) => [m.id, m])),
      [messages],
    );
    const messageIndexMap = useMemo(
      () => new Map(messages.map((m, i) => [m.id, i])),
      [messages],
    );

    const virtualizer = useVirtualizer({
      count: messages.length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => 80,
      overscan: 5,
    });

    const virtualItems = virtualizer.getVirtualItems();

    const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleScrollToReply = (replyId: string) => {
      const index = messageIndexMap.get(replyId);

      if (index !== undefined) {
        virtualizer.scrollToIndex(index, {
          align: "center",
          behavior: "smooth",
        });

        setHighlightedId(replyId);
        if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
        highlightTimeoutRef.current = setTimeout(() => setHighlightedId(null), 2000);
      } else {
        toast.info("Original message is too old to view right now.");
      }
    };

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
      };
    }, []);

    useImperativeHandle(ref, () => ({
      scrollToBottom: (smooth = false) => {
        if (!parentRef.current || messages.length === 0) return;
        virtualizer.scrollToIndex(messages.length - 1, {
          align: "end",
          behavior: smooth ? "smooth" : "auto",
        });
        setShouldStickToBottom(true);
        setShowScrollButton(false);
      },
    }));

    useLayoutEffect(() => {
      if (shouldStickToBottom && messages.length > 0) {
        virtualizer.scrollToIndex(messages.length - 1, { align: "end" });
      }
    }, [messages.length, shouldStickToBottom, virtualizer]);

    const onScroll = async (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const isAtBottom =
        target.scrollHeight - target.scrollTop - target.clientHeight <= 100;

      setShouldStickToBottom(isAtBottom);
      setShowScrollButton(!isAtBottom);

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
          {/* Top Loading Spinner */}
          {isLoading && messages.length > 0 && (
            <div className="absolute top-2 left-0 w-full flex justify-center z-10">
              <div className="bg-background/80 rounded-full p-1 shadow-sm border">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}

          {/* Empty State / Initial Load */}
          {isLoading && messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Virtual List */}
          <div
            className="relative w-full"
            style={{ height: `${virtualizer.getTotalSize()}px` }}
          >
            {virtualItems.map((vItem) => {
              const message = messages[vItem.index]!;

              // Find the parent message object if replyToId exists
              const parentMessage = message.replyToId
                ? messageMap.get(message.replyToId)
                : undefined;

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
                    onReply={onReplyMessage}
                    repliedToMessage={parentMessage}
                    onScrollToReply={handleScrollToReply}
                    isHighlighted={highlightedId === message.id}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Scroll To Bottom Fab */}
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
