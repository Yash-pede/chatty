import db from "@/config/db.drizzle.js";
import { permissions, rolePermissions, roles } from "@repo/db/schema";
import { logger } from "@/core/logger.js";

const ROLE_NAMES = ["user", "agent", "moderator", "admin"] as const;

const PERMISSIONS = [
  { key: "message:send", description: "Send messages" },
  { key: "message:read", description: "Read messages" },
  { key: "message:edit", description: "Edit own messages" },
  { key: "message:delete", description: "Delete messages" },

  { key: "conversation:create", description: "Create conversations" },
  { key: "conversation:close", description: "Close conversations" },
  { key: "conversation:add_member", description: "Add member to conversation" },
  {
    key: "conversation:remove_member",
    description: "Remove member from conversation",
  },

  { key: "user:block", description: "Block another user" },
  { key: "user:ban", description: "Ban a user" },
  { key: "user:unban", description: "Unban a user" },

  { key: "report:review", description: "Review reported content" },

  { key: "support:assign", description: "Assign support conversations" },
  { key: "support:respond", description: "Respond to support conversation" },
] as const;

const ROLE_PERMISSION_MAP: Record<(typeof ROLE_NAMES)[number], string[]> = {
  user: ["message:send", "message:read", "conversation:create", "user:block"],

  agent: ["message:send", "message:read", "user:block", "support:respond"],

  moderator: [
    "message:send",
    "message:read",
    "message:delete",
    "conversation:close",
    "conversation:add_member",
    "conversation:remove_member",
    "user:block",
    "user:ban",
    "user:unban",
    "report:review",
  ],

  admin: PERMISSIONS.map((p) => p.key), // full access
};

async function seedRolesAndPermissions() {
  /* ---------- ROLES ---------- */
  await db
    .insert(roles)
    .values(
      ROLE_NAMES.map((name) => ({
        name,
        description: `${name} role`,
      })),
    )
    .onConflictDoNothing();

  /* ---------- PERMISSIONS ---------- */
  // @ts-ignore
  await db.insert(permissions).values(PERMISSIONS).onConflictDoNothing();

  /* ---------- FETCH IDS ---------- */
  const allRoles = await db.select().from(roles);
  const allPermissions = await db.select().from(permissions);

  const roleIdByName = Object.fromEntries(allRoles.map((r) => [r.name, r.id]));

  const permissionIdByKey = Object.fromEntries(
    allPermissions.map((p) => [p.key, p.id]),
  );

  /* ---------- ROLE → PERMISSIONS ---------- */
  const rolePermissionRows = [];

  for (const roleName of ROLE_NAMES) {
    for (const permKey of ROLE_PERMISSION_MAP[roleName]) {
      rolePermissionRows.push({
        roleId: roleIdByName[roleName],
        permissionId: permissionIdByKey[permKey],
      });
    }
  }

  await db
    .insert(rolePermissions)
    .values(rolePermissionRows)
    .onConflictDoNothing();
}

const main = async () => {
  logger.info("Seeding roles and permissions");
  await seedRolesAndPermissions();
  logger.info("Roles & permissions seeded successfully");
};

main();
