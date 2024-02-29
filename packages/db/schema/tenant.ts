import {
  text,
  integer,
  sqliteTable,
  index,
  unique,
} from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";

export const user = sqliteTable("user", {
  userId: text("userId", { length: 256 }).primaryKey(),
  role: text("role", { length: 256 }).notNull(),
  firstName: text("firstName", { length: 256 }),
  lastName: text("lastName", { length: 256 }),
  email: text("email", { length: 256 }).notNull().unique(),
  imageUrl: text("imageUrl", { length: 10000 }),
  createdAt: integer("createdAt").notNull(),
  updatedAt: integer("updatedAt").notNull(),
});

export const workspace = sqliteTable(
  "workspace",
  {
    id: text("id").$defaultFn(createId).primaryKey(),
    name: text("name", { length: 256 }).notNull(),
    slug: text("slug", { length: 256 }).notNull().unique(),
    description: text("description", { length: 512 }).notNull(),
    createdAt: integer("createdAt").notNull(),
    updatedAt: integer("updatedAt").notNull(),
    deletedAt: integer("deletedAt"),
  },
  (table) => {
    return {
      slugIdx: index("slug_idx").on(table.slug),
    };
  },
);
export const channel = sqliteTable(
  "channel",
  {
    id: text("id").$defaultFn(createId).primaryKey(),
    slug: text("slug", { length: 256 }).notNull(),
    description: text("description", { length: 512 }).notNull(),
    workspaceId: text("workspaceId").notNull(),
    channelType: text("channelType", { length: 256 }).notNull(),
    createdAt: integer("createdAt").notNull(),
    updatedAt: integer("updatedAt").notNull(),
    deletedAt: integer("deletedAt"),
  },
  (t) => ({
    unq: unique().on(t.workspaceId, t.slug),
  }),
);

export const workspaceMember = sqliteTable("workspaceMember", {
  id: text("id").$defaultFn(createId).primaryKey(),
  workspaceId: text("workspaceId").notNull(),
  userId: text("userId").notNull(),
  bCanManageChannels: integer("bCanManageChannels").default(0),
  bCanManageWorkspaceMembers: integer("bCanManageWorkspaceMembers").default(0),
  bCanManageWorkspaceSettings: integer("bCanManageWorkspaceSettings").default(
    0,
  ),
  createdAt: integer("createdAt").notNull(),
  updatedAt: integer("updatedAt").notNull(),
  deletedAt: integer("deletedAt"),
});

export const message = sqliteTable("message", {
  id: text("id").$defaultFn(createId).primaryKey(),
  channelId: text("channelId").notNull(),
  userId: text("userId").notNull(),
  message: text("message", { length: 60000 }).notNull(),
  createdAt: integer("createdAt").notNull(),
  updatedAt: integer("updatedAt").notNull(),
  deletedAt: integer("deletedAt"),
});

export const unSummarizedMessage = sqliteTable("unSummarizedMessage", {
  id: text("id").$defaultFn(createId).primaryKey(),
  messageId: text("messageId").notNull(),
});

export const conversation = sqliteTable("conversation", {
  id: text("id").$defaultFn(createId).primaryKey(),
  channelId: text("channelId").notNull(),
  createdAt: integer("createdAt").notNull(),
  updatedAt: integer("updatedAt").notNull(),
});

export const conversationMessage = sqliteTable("conversationMessage", {
  id: text("id").$defaultFn(createId).primaryKey(),
  messageId: text("messageId").notNull(),
  conversationId: text("conversationId").notNull(),
});

export const meeting = sqliteTable("meeting", {
  id: text("id").$defaultFn(createId).primaryKey(),
  recurringMeetingId: text("recurringMeetingId"),
  scheduledAt: integer("scheduledAt").notNull(),
  startedAt: integer("startedAt"),
  endedAt: integer("endedAt"),
  createdAt: integer("createdAt").notNull(),
  updatedAt: integer("updatedAt").notNull(),
  deletedAt: integer("deletedAt"),
});

export const recurringMeeting = sqliteTable("recurringMeeting", {
  id: text("id").$defaultFn(createId).primaryKey(),
  frequency: text("frequency", { length: 256 }).notNull(),
  interval: integer("interval").notNull(),
  count: integer("count"),
  until: integer("until"),
  createdAt: integer("createdAt").notNull(),
  updatedAt: integer("updatedAt").notNull(),
  deletedAt: integer("deletedAt"),
});

export const meetingParticipant = sqliteTable("meetingParticipant", {
  id: text("id").$defaultFn(createId).primaryKey(),
  meetingId: text("meetingId").notNull(),
  userId: text("userId").notNull(),
  createdAt: integer("createdAt").notNull(),
  updatedAt: integer("updatedAt").notNull(),
  deletedAt: integer("deletedAt"),
});

export const meetingMessage = sqliteTable("meetingMessage", {
  id: text("id").$defaultFn(createId).primaryKey(),
  meetingId: text("meetingId").notNull(),
  userId: text("userId").notNull(),
  message: text("message", { length: 60000 }).notNull(),
  createdAt: integer("createdAt").notNull(),
  updatedAt: integer("updatedAt").notNull(),
  deletedAt: integer("deletedAt"),
});

export const meetingTranscriptedMessage = sqliteTable(
  "meetingTranscriptedMessage",
  {
    id: text("id").$defaultFn(createId).primaryKey(),
    meetingId: text("meetingId").notNull(),
    userId: text("userId").notNull(),
    message: text("message", { length: 60000 }).notNull(),
    createdAt: integer("createdAt").notNull(),
    updatedAt: integer("updatedAt").notNull(),
    deletedAt: integer("deletedAt"),
  },
);
