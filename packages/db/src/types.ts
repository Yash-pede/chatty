import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { conversationParticipants, conversations, conversationTypeEnum, messages, users } from "./schema.js";

//CONVERSATION
export type Conversation = typeof conversations.$inferSelect;
export type ConversationTypeEnum =
  (typeof conversationTypeEnum.enumValues)[number];
export type InsertConversation = InferInsertModel<typeof conversations>;
export type InsertConversationParticipants = InferInsertModel<
  typeof conversationParticipants
>;

export type ConversationWithOtherUser = {
  conversationId: Conversation["id"];
  type: Conversation["type"];
  name: Conversation["name"];
  isClosed: Conversation["isClosed"];
  lastMessagePreview: Conversation["lastMessagePreview"];
  lastMessageAt: Conversation["lastMessageAt"];
  unreadCount: number | null; // from cpMe.unreadCount
  muted: boolean | null; // from cpMe.muted
  notificationsEnabled: boolean | null; // from cpMe.notificationsEnabled
  joinedAt: Date | null; // from cpMe.joinedAt
  assignedAgentId: string | null; // from conversations.assignedAgentId
  otherUser: Pick<
    User,
    "id" | "firstName" | "lastName" | "username" | "imageUrl"
  >;
};

//USERS
export type User = InferSelectModel<typeof users>;
export type InsertUser = InferInsertModel<typeof users>;
export type ClerkUserUpdate = {
  firstName?: string;
  lastName?: string;
  username?: string;
};
export type ChatUser = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  imageUrl?: string | null;
};

//MESSAGES
export type Message = InferSelectModel<typeof messages>;
export type InsertMessage = InferInsertModel<typeof messages>;
export type MessageContentType = {
  text?: string;
  imageUrl?: string;
  videoUrl?: string;
};