import { pgTable, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(), // user_37CJHQep0gx0JqdZCzjSep49jHO
  email: text("email").notNull().unique(),
  username: text("username").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  fullName: text("full_name"),
  imageUrl: text("image_url"),
  hasImage: boolean("has_image").default(false),
  banned: boolean("banned").default(false).notNull(),
  locked: boolean("locked").default(false).notNull(),
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
});
