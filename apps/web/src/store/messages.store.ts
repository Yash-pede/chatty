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
};

export const useMessageStore = create<MessagesStore>()((set) => ({
  messages: [],
  setMessages: (messages: InsertMessage[]) => set({ messages }),
  saveMessageIDB: async (message: InsertMessage) => {
    await db.messages.add(message);
  },
  bulkSaveMessagesIDB: async (messages: InsertMessage[]) => {
    await db.messages.bulkAdd(messages);
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
  }
}));
