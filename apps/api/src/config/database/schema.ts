import {
  pgTable,
  text,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  uuid,
  integer,
  index,
  primaryKey,
  serial,
} from "drizzle-orm/pg-core";

/* ======================================================
   ENUMS
====================================================== */

export const userRoleEnum = pgEnum("user_role", [
  "user",
  "agent",
  "moderator",
  "admin",
]);

export const conversationTypeEnum = pgEnum("conversation_type", [
  "direct",
  "group",
  "support",
]);

export const messageTypeEnum = pgEnum("message_type", [
  "text",
  "image",
  "file",
  "system",
]);

export const flagReasonEnum = pgEnum("flag_reason", [
  "spam",
  "harassment",
  "abuse",
  "other",
]);

export const flagStatusEnum = pgEnum("flag_status", [
  "open",
  "reviewed",
  "resolved",
]);

/* ======================================================
   USERS (IDENTITY)
====================================================== */

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(), // Clerk userId
    email: text("email").notNull().unique(),
    username: text("username").unique(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    hasImage: boolean("has_image").default(false),
    imageUrl: text("image_url"),
    locked: boolean("locked").default(false).notNull(),
    banned: boolean("banned").default(false).notNull(),
    deleted: boolean("deleted").default(false).notNull(),

    publicMetadata: jsonb("public_metadata").default({}),
    privateMetadata: jsonb("private_metadata").default({}),

    lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
    lastSignInAt: timestamp("last_sign_in_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => ({
    emailIdx: index("users_email_idx").on(t.email),
    userNameIDX: index("users_username_idx").on(t.username),
  }),
);

/* ======================================================
   RBAC — ROLES
====================================================== */

export const roles = pgTable("roles", {
  id: serial().primaryKey(),
  name: userRoleEnum("name").notNull().unique(), // user | agent | moderator | admin
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ======================================================
   RBAC — PERMISSIONS
====================================================== */

export const permissions = pgTable("permissions", {
  id: serial().primaryKey(),
  key: text("key").notNull().unique(),
  // examples:
  // message.send
  // message.delete
  // conversation.close
  // user.ban
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ======================================================
   RBAC — ROLE → PERMISSIONS
====================================================== */

export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: integer("role_id")
      .references(() => roles.id, { onDelete: "cascade" })
      .notNull(),

    permissionId: integer("permission_id")
      .references(() => permissions.id, { onDelete: "cascade" })
      .notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.roleId, t.permissionId] }),
  }),
);

/* ======================================================
   RBAC — USER → ROLES (multi-role support)
====================================================== */

export const userRoles = pgTable(
  "user_roles",
  {
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    roleId: integer("role_id")
      .references(() => roles.id, { onDelete: "cascade" })
      .notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.roleId] }),
  }),
);

/* ======================================================
   CONVERSATIONS (ROOMS)
====================================================== */

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    type: conversationTypeEnum("type").notNull(),
    name: text("name"), // group/support only

    createdBy: text("created_by")
      .references(() => users.id)
      .notNull(),

    assignedAgentId: text("assigned_agent_id").references(() => users.id),

    isClosed: boolean("is_closed").default(false).notNull(),

    // Cached for fast conversation list
    lastMessageId: uuid("last_message_id"),
    lastMessagePreview: text("last_message_preview"),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }),

    metadata: jsonb("metadata").default({}),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    typeIdx: index("conversations_type_idx").on(t.type),
    lastMessageIdx: index("conversations_last_message_idx").on(t.lastMessageAt),
    agentIdIdx: index("agentId_idx").on(t.assignedAgentId),
  }),
);

/* ======================================================
   CONVERSATION PARTICIPANTS (ABAC CORE)
====================================================== */

export const conversationParticipants = pgTable(
  "conversation_participants",
  {
    conversationId: uuid("conversation_id")
      .references(() => conversations.id, { onDelete: "cascade" })
      .notNull(),

    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    role: text("role").default("member"), // owner | admin | member
    muted: boolean("muted").default(false).notNull(),

    lastReadMessageId: uuid("last_read_message_id"),
    lastReadAt: timestamp("last_read_at", { withTimezone: true }),

    unreadCount: integer("unread_count").default(0).notNull(), // cache only

    notificationsEnabled: boolean("notifications_enabled")
      .default(true)
      .notNull(),

    joinedAt: timestamp("joined_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.conversationId, t.userId] }),
    userIdx: index("conversation_participants_user_idx").on(t.userId),
  }),
);

/* ======================================================
   MESSAGES (SOURCE OF TRUTH)
====================================================== */

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    conversationId: uuid("conversation_id")
      .references(() => conversations.id, { onDelete: "cascade" })
      .notNull(),

    senderId: text("sender_id")
      .references(() => users.id)
      .notNull(),

    // Optimistic UI support
    clientMessageId: text("client_message_id"),

    type: messageTypeEnum("type").default("text").notNull(),
    content: jsonb("content").notNull(),

    replyToId: uuid("reply_to_id"),

    isEdited: boolean("is_edited").default(false).notNull(),
    isDeleted: boolean("is_deleted").default(false).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    conversationIdx: index("messages_conversation_idx").on(t.conversationId),
    createdAtIdx: index("messages_created_at_idx").on(t.createdAt),
    clientIdx: index("messages_client_idx").on(t.clientMessageId),
  }),
);

/* ======================================================
   DIRECT CHAT RECEIPTS (NO GROUPS)
====================================================== */

export const messageReceipts = pgTable(
  "message_receipts",
  {
    messageId: uuid("message_id")
      .references(() => messages.id, { onDelete: "cascade" })
      .notNull(),

    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    readAt: timestamp("read_at", { withTimezone: true }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.messageId, t.userId] }),
  }),
);

/* ======================================================
   BLOCKING
====================================================== */

export const blocks = pgTable(
  "blocks",
  {
    blockerId: text("blocker_id")
      .references(() => users.id)
      .notNull(),

    blockedId: text("blocked_id")
      .references(() => users.id)
      .notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.blockerId, t.blockedId] }),
  }),
);

/* ======================================================
   FLAGS / REPORTS
====================================================== */

export const flags = pgTable(
  "flags",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    reporterId: text("reporter_id")
      .references(() => users.id)
      .notNull(),

    targetType: text("target_type").notNull(), // message | user | conversation
    targetId: text("target_id").notNull(),

    reason: flagReasonEnum("reason").notNull(),
    status: flagStatusEnum("status").default("open").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    statusIdx: index("flags_status_idx").on(t.status),
  }),
);

/* ======================================================
   AUDIT LOGS
====================================================== */

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial().primaryKey(),

    actorId: text("actor_id"),
    action: text("action").notNull(),

    resource: text("resource").notNull(),
    resourceId: text("resource_id").notNull(),

    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    resourceIdx: index("audit_logs_resource_idx").on(t.resource, t.resourceId),
  }),
);
