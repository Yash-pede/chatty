import { create } from "zustand";
import { db } from "@/lib/dexie";
import { Message } from "@repo/db/types";
import { getPaginatedMessages } from "@/dbInteractions/queries/message.queries.ts";

type MessagesStore = {
  messages: Message[];
  isLoading: boolean;
  hasMoreOlderMessages: boolean;

  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => Promise<void>;
  initConversation: (conversationId: string) => Promise<void>;
  loadOlderMessages: (conversationId: string) => Promise<void>;
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

export const useMessageStore = create<MessagesStore>()((set, get) => ({
  messages: [],
  isLoading: false,
  hasMoreOlderMessages: true,

  setMessages: (messages) => set({ messages }),

  addMessage: async (message: Message) => {
    const { clientMessageId } = message;

    // --- 1. DEXIE UPDATE (Disk) ---

    // Check if we have an optimistic message to replace.
    // Logic: If I sent it, I stored it with id === clientMessageId
    if (clientMessageId) {
      const optimisticMsg = await db.messages.get(clientMessageId);

      if (optimisticMsg) {
        // FOUND IT! We have a temp message with this ID.
        // 1. Delete the temporary record (id: "temp-uuid")
        await db.messages.delete(clientMessageId);
        console.log(`[Store] Replaced optimistic message: ${clientMessageId}`);
      }
    }

    // 2. Save the REAL record (id: "real-uuid")
    await db.messages.put(message);

    // --- 2. ZUSTAND UPDATE (Memory / UI) ---

    set((state) => {
      // Helper to merge and sort
      const map = new Map<string, Message>();

      // A. Add existing messages to Map
      state.messages.forEach((m) => map.set(m.id, m));

      // B. Handle Replacement Logic
      if (clientMessageId && map.has(clientMessageId)) {
        // If the map has the temp ID, DELETE it from the map
        map.delete(clientMessageId);
      }

      // C. Add the new Real Message
      map.set(message.id, message);

      // D. Convert back to array & Sort
      return {
        messages: Array.from(map.values()).sort(
          (a, b) => a.sequence - b.sequence,
        ),
      };
    });
  },

  initConversation: async (conversationId: string) => {
    // 1. Instant Load from Dexie
    const localHistory = await db.messages
      .where("conversationId")
      .equals(conversationId)
      .reverse()
      .limit(50)
      .toArray();

    const localLatest = localHistory[0];

    // Show what we have immediately
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
      if (localLatest) {
        // --- PROBE FORWARD (Warm Sync) ---
        const catchUpResponse = await getPaginatedMessages(
          conversationId,
          50,
          "forward",
          localLatest.sequence,
        );

        if (!catchUpResponse.pageInfo.hasMore) {
          // Scenario 1: Small Gap
          const newMessages = catchUpResponse.items;
          if (newMessages.length > 0) {
            await db.messages.bulkPut(newMessages);

            // FIX: Use mergeMessages to prevent duplicates
            set((state) => ({
              messages: mergeMessages(state.messages, newMessages),
              isLoading: false,
            }));
          } else {
            set({ isLoading: false });
          }
        } else {
          // Scenario 2: Huge Gap -> Jump
          console.log("Huge gap detected. Jumping to latest.");
          const latestResponse = await getPaginatedMessages(
            conversationId,
            50,
            "backward",
          );
          const latestMessages = latestResponse.items.reverse();
          await db.messages.bulkPut(latestMessages);

          set({
            messages: latestMessages, // Replace completely
            hasMoreOlderMessages: true,
            isLoading: false,
          });
        }
      } else {
        // --- Scenario 3: COLD START ---
        const response = await getPaginatedMessages(
          conversationId,
          50,
          "backward",
        );
        const msgs = response.items.reverse();
        await db.messages.bulkPut(msgs);

        set({
          messages: msgs, // Safe to replace as it was empty
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

    // 1. Dexie Check
    const localOlder = await db.messages
      .where("conversationId")
      .equals(conversationId)
      .and((m) => m.sequence < oldestSeq)
      .reverse()
      .limit(LIMIT)
      .toArray();

    let newBatch = localOlder.reverse();

    // 2. API Check
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
      // FIX: Use mergeMessages to prevent duplicates
      set((state) => ({
        messages: mergeMessages(state.messages, newBatch),
        isLoading: false,
      }));
    } else {
      set({ isLoading: false });
    }
  },
}));
