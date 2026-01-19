import { db } from "@/lib/dexie";
import { InsertMessage, Message } from "@repo/db/types";
import { create } from "zustand";

type MessagesStore = {
  messages: InsertMessage[];
  setMessages: (messages: InsertMessage[]) => void
  saveMessageIDB: (message: InsertMessage) => Promise<void>;
  bulkSaveMessagesIDB: (message: InsertMessage[]) => Promise<void>;
  getMessagesByConversationIdIDB: (conversationId: string) => Promise<InsertMessage[]>;
  replaceOptimisticMessage: (clientMessageId: string, updatedMessage: Message) => Promise<void>
  mergeFetchedMessages: (fetchedMessages: Message[]) => void
};

export const useMessageStore = create<MessagesStore>()((set) => ({
  messages: [],
  setMessages: (messages: InsertMessage[]) => set({ messages }),

  saveMessageIDB: async (message: InsertMessage) => {
    await db.messages.put(message);
  },

  bulkSaveMessagesIDB: async (messages: InsertMessage[]) => {
    await db.messages.bulkPut(messages);
  },

  getMessagesByConversationIdIDB: async (conversationId: string) => {
    const messages = await db.messages.where("conversationId").equals(conversationId).toArray()
    return messages
  },

  replaceOptimisticMessage: async (clientMessageId: string, updatedMessage: Message) => {
    await db.messages.update(`temp-${clientMessageId}`, updatedMessage)
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.clientMessageId === clientMessageId ? updatedMessage : msg
      ),
    }));
  },

  mergeFetchedMessages: (fetchedMessages) =>
    set((state) => {
      const map = new Map<string, InsertMessage>();

      state.messages.forEach((m) => {
        if (m.id) map.set(m.id, m);
      });

      fetchedMessages.forEach((m) => {
        map.set(m.id, m); 
      });

      return {
        messages: Array.from(map.values()).sort(
          (a, b) =>
            new Date(a.createdAt!).getTime() -
            new Date(b.createdAt!).getTime()
        ),
      };
    }),
}));
