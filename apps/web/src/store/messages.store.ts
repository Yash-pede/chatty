import { dbPromise } from "@/lib/indexdDB";
import { InsertMessage } from "@repo/db/types";
import { create } from "zustand";

type MessagesStore = {
  messages: InsertMessage[];
  saveMessageIDB: (message: InsertMessage) => Promise<void>;
  getMessagesByConversationIdIDB: (conversationId: string) => Promise<void>;
};

export const useMessageStore = create<MessagesStore>()((set) => ({
  messages: [],
  saveMessageIDB: async (message: InsertMessage) => {
    const db = await dbPromise;
    await db.put("messages", message);
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },
  getMessagesByConversationIdIDB: async (conversationId: string) => {
    const db = await dbPromise;
    const messages = await db.getAllFromIndex(
      "messages",
      "conversationId",
      conversationId,
    );
    set({ messages });
  },
}));
