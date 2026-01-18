import { Conversation, InsertMessage } from "@repo/db/types"
import Dexie, { type EntityTable } from "dexie"

export const db = new Dexie("ChatDatabase") as Dexie & {
  messages: EntityTable<InsertMessage, "id">
  conversations: EntityTable<Conversation, "id">
}

// Schema declaration
db.version(1).stores({
  messages: `
    ++id,
    conversationId,
    createdAt
  `,
  conversations: `
    id,
    updatedAt
  `
})

