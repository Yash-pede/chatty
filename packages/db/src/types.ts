import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  conversationParticipants,
  conversations,
  conversationTypeEnum,
  users,
} from "./schema.js";

//CONVERSATION
export type Conversation = typeof conversations.$inferSelect;
export type ConversationTypeEnum =
  (typeof conversationTypeEnum.enumValues)[number];
export type InsertConversation = InferInsertModel<typeof conversations>;
export type InsertConversationParticipants = InferInsertModel<
  typeof conversationParticipants
>;
//USERS
export type User = InferSelectModel<typeof users>;
export type InsertUser = InferInsertModel<typeof users>;
