import { dbPromise } from "@/lib/indexdDB";
import { InsertMessage } from "@repo/db/types";

export async function saveMessageIDB(message: InsertMessage) {
  const db = await dbPromise;
  await db.put("messages", message);
}

export async function getMessagesByConversationIdIDB(conversationId: string) {
  const db = await dbPromise;
  return db.getAllFromIndex("messages", "conversationId", conversationId);
}