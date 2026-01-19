import { db } from "@/lib/dexie";
import { Message } from "@repo/db/types";
import { create } from "zustand";

type MessagesStore = {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  saveMessageIDB: (message: Message) => Promise<void>;
  bulkSaveMessagesIDB: (messages: Message[]) => Promise<void>;
  getMessagesByConversationIdIDB: (
    conversationId: string,
  ) => Promise<Message[]>;
  replaceOptimisticMessage: (
    clientMessageId: string,
    updatedMessage: Message,
  ) => Promise<void>;
};

export const useMessageStore = create<MessagesStore>()((set) => ({
  messages: [],
  setMessages: (messages: Message[]) => set({ messages }),

  saveMessageIDB: async (message: Message) => {
    await db.messages.put(message as Message);
  },

  bulkSaveMessagesIDB: async (messages: Message[]) => {
    await db.messages.bulkPut(messages as Message[]);
  },

  getMessagesByConversationIdIDB: async (conversationId: string) => {
    return db.messages
      .where("conversationId")
      .equals(conversationId)
      .toArray()
      .then((message) => message.sort((a, b) => a.sequence - b.sequence));
  },

  replaceOptimisticMessage: async (
    clientMessageId: string,
    updatedMessage: Message,
  ) => {
    await db.messages
      .where("clientMessageId")
      .equals(clientMessageId)
      .modify(updatedMessage);

    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.clientMessageId === clientMessageId ? updatedMessage : msg,
      ),
    }));
  },
}));
