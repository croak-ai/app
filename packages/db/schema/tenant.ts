import { sql } from "drizzle-orm";
import { text, integer, sqliteTable, index } from "drizzle-orm/sqlite-core";

export const workspace = sqliteTable(
  "workspace",
  {
    id: integer("id").primaryKey(),
    name: text("name", { length: 256 }).notNull(),
    slug: text("slug", { length: 256 }).notNull().unique(),
    description: text("description", { length: 512 }).notNull(),
    createdAt: integer("createdAt").notNull(),
    updatedAt: integer("updatedAt").notNull(),
    deletedAt: integer("deletedAt"),
    publicChannelEncryptionId: integer("publicEncryptionId").notNull(),
  },
  (table) => {
    return {
      slugIdx: index("slug_idx").on(table.slug),
    };
  },
);
export const channel = sqliteTable("channel", {
  id: integer("id").primaryKey(),
  name: text("name", { length: 256 }).notNull(),
  description: text("description", { length: 512 }).notNull(),
  workspaceId: integer("workspaceId").notNull(),
  bRequiresWriteAccess: integer("bRequiresWriteAccess").default(0),
  bIsPrivateChannel: integer("bIsPrivateChannel").default(0),
  privateChannelEncryptionId: text("privateEncryptionId", {
    length: 256,
  }),
  createdAt: integer("createdAt").notNull(),
  updatedAt: integer("updatedAt").notNull(),
  deletedAt: integer("deletedAt"),
});

export const channelWriteAccess = sqliteTable("channelWriteAccess", {
  id: integer("id").primaryKey(),
  channelId: integer("channelId").notNull(),
  userId: integer("userId").notNull(),
  createdAt: integer("createdAt").notNull(),
  updatedAt: integer("updatedAt").notNull(),
  deletedAt: integer("deletedAt"),
});

export const workspaceMember = sqliteTable("workspaceMember", {
  id: integer("id").primaryKey(),
  workspaceId: integer("workspaceId").notNull(),
  userId: text("userId").notNull(),
  createdAt: integer("createdAt").notNull(),
  updatedAt: integer("updatedAt").notNull(),
  deletedAt: integer("deletedAt"),
});

/*
 *
 * This table is used to store the encryption keys for messages.
 * The encryption key is encrypted further encrypted with a rotating KEK (key encryption key) provided by third party.
 * This way the third party can rotate the KEK without having to re-encrypt all the messages.
 * Read up on "Envelope Encryption" for more details.
 *
 */
export const dekEncryptionKey = sqliteTable("dekEncryptionKey", {
  id: integer("id").primaryKey(),
  dek: text("key", { length: 256 }).notNull().unique(),
  kekType: text("kekType", { length: 256 }).notNull(),
  kekId: text("kekId", { length: 256 }),
  createdAt: integer("createdAt").notNull(),
  updatedAt: integer("updatedAt").notNull(),
  deletedAt: integer("deletedAt"),
});

/*
 *
 * This table is used to determine which users have access to which encryption keys.
 *
 */
export const dekEncryptionKeyUserAccess = sqliteTable(
  "dekEncryptionKeyUserAccess",
  {
    id: integer("id").primaryKey(),
    dekId: integer("dekId").notNull(),
    userId: text("userId").notNull(),
    createdAt: integer("createdAt").notNull(),
    updatedAt: integer("updatedAt").notNull(),
    deletedAt: integer("deletedAt"),
  },
);
