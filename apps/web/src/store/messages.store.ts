import { create } from "zustand";
import { db } from "@/lib/dexie";
import { Message } from "@repo/db/types";
import { getPaginatedMessages } from "@/dbInteractions/queries/message.queries.ts";

type MessagesStore = {
  messages: Message[];
  isLoading: boolean;
  hasMoreOlderMessages: boolean;
  failedIds: Set<string>;

  // Actions
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => Promise<void>;
  markMessageFailed: (id: string) => Promise<void>;
  removeMessage: (id: string) => Promise<void>; // <--- NEW FUNCTION
  initConversation: (conversationId: string) => Promise<void>;
  loadOlderMessages: (conversationId: string) => Promise<void>;
  retryMessage: (id: string) => Promise<void>;
};

// --- HELPER: Deduplicate & Sort ---
const mergeMessages = (current: Message[], incoming: Message[]) => {
  const map = new Map<string, Message>();

  // 1. Add current messages
  current.forEach((m) => map.set(m.id, m));

  // 2. Overwrite/Add incoming messages
  incoming.forEach((m) => map.set(m.id, m));

  // 3. Convert back to array and Sort ASC (Oldest -> Newest)
  return Array.from(map.values()).sort((a, b) => a.sequence - b.sequence);
};

export const useMessageStore = create<MessagesStore>()((set, get) => {
  return {
    messages: [],
    isLoading: false,
    hasMoreOlderMessages: true,
    failedIds: new Set(),

    setMessages: (messages) => set({ messages }),

    addMessage: async (message: Message) => {
      const { clientMessageId } = message;

      // --- 1. DEXIE UPDATE (Disk) ---
      if (clientMessageId) {
        const optimisticMsg = await db.messages.get(clientMessageId);
        if (optimisticMsg) {
          await db.messages.delete(clientMessageId);
        }
      }
      await db.messages.put(message);

      // --- 2. ZUSTAND UPDATE (Memory / UI) ---
      set((state) => {
        const map = new Map<string, Message>();
        state.messages.forEach((m) => map.set(m.id, m));

        if (clientMessageId && map.has(clientMessageId)) {
          map.delete(clientMessageId);
        }
        map.set(message.id, message);

        return {
          messages: Array.from(map.values()).sort(
            (a, b) => a.sequence - b.sequence,
          ),
        };
      });
    },

    // --- NEW: Remove Message (Memory + Disk) ---
    removeMessage: async (id: string) => {
      // 1. Delete from Dexie (Disk)
      await db.messages.delete(id);

      // 2. Delete from Zustand (Memory)
      set((state) => {
        const newFailedIds = new Set(state.failedIds);
        newFailedIds.delete(id); // Clean up failed IDs if needed

        return {
          messages: state.messages.filter((m) => m.id !== id),
          failedIds: newFailedIds,
        };
      });
    },

    markMessageFailed: async (id: string) => {
      console.log("Marking message as failed:", id);

      // 1. Delete from Disk IMMEDIATELY
      // This ensures if user refreshes, the failed message is GONE.
      await db.messages.delete(id);

      // 2. Update Zustand (Keep in memory so user sees red error)
      set((state) => ({
        failedIds: new Set(state.failedIds).add(id),
      }));
    },

    retryMessage: async (id: string) => {
      const { messages } = get();
      const msg = messages.find((m) => m.id === id);
      if (!msg) return;

      // Remove from failed list -> turns back to "Sending..."
      set((state) => {
        const newSet = new Set(state.failedIds);
        newSet.delete(id);
        return { failedIds: newSet };
      });
    },

    initConversation: async (conversationId: string) => {
      const localHistory = await db.messages
        .where("conversationId")
        .equals(conversationId)
        .reverse()
        .limit(50)
        .toArray();

      // Filter out huge sequence numbers (Optimistic messages) from "Latest" logic
      // so we don't try to fetch data using a timestamp cursor
      const realLocalLatest = localHistory.find(
        (m) => m.sequence < 1000000000000,
      );

      if (localHistory.length > 0) {
        set({
          messages: localHistory
            .reverse()
            .sort((a, b) => a.sequence - b.sequence),
          isLoading: false,
        });
      } else {
        set({ isLoading: true });
      }

      try {
        if (realLocalLatest) {
          // Warm Sync
          const catchUpResponse = await getPaginatedMessages(
            conversationId,
            50,
            "forward",
            realLocalLatest.sequence,
          );

          if (!catchUpResponse.pageInfo.hasMore) {
            const newMessages = catchUpResponse.items;
            if (newMessages.length > 0) {
              await db.messages.bulkPut(newMessages);
              set((state) => ({
                messages: mergeMessages(state.messages, newMessages),
                isLoading: false,
              }));
            } else {
              set({ isLoading: false });
            }
          } else {
            // Gap Jump
            const latestResponse = await getPaginatedMessages(
              conversationId,
              50,
              "backward",
            );
            const latestMessages = latestResponse.items.reverse();
            await db.messages.bulkPut(latestMessages);
            set({
              messages: latestMessages,
              hasMoreOlderMessages: true,
              isLoading: false,
            });
          }
        } else {
          // Cold Start
          const response = await getPaginatedMessages(
            conversationId,
            50,
            "backward",
          );
          const msgs = response.items.reverse();
          await db.messages.bulkPut(msgs);

          set({
            messages: msgs,
            isLoading: false,
            hasMoreOlderMessages: response.pageInfo.hasMore,
          });
        }
      } catch (err) {
        console.error("Sync failed", err);
        set({ isLoading: false });
      }
    },

    loadOlderMessages: async (conversationId: string) => {
      const { messages, isLoading, hasMoreOlderMessages } = get();
      if (isLoading || !hasMoreOlderMessages || messages.length === 0) return;

      set({ isLoading: true });

      const oldestSeq = messages[0].sequence;
      const LIMIT = 50;

      const localOlder = await db.messages
        .where("conversationId")
        .equals(conversationId)
        .and((m) => m.sequence < oldestSeq)
        .reverse()
        .limit(LIMIT)
        .toArray();

      let newBatch = localOlder.reverse();

      if (newBatch.length < LIMIT) {
        try {
          const res = await getPaginatedMessages(
            conversationId,
            LIMIT,
            "backward",
            oldestSeq,
          );
          const apiOlder = res.items.reverse();

          if (apiOlder.length > 0) await db.messages.bulkPut(apiOlder);

          newBatch = apiOlder;
          set({ hasMoreOlderMessages: res.pageInfo.hasMore });
        } catch (err) {
          console.error("Load older failed", err);
        }
      }

      if (newBatch.length > 0) {
        set((state) => ({
          messages: mergeMessages(state.messages, newBatch),
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }
    },
  };
});
