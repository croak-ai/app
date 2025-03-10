import {
  text,
  integer,
  sqliteTable,
  index,
  unique,
  blob,
} from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export const LastKnownStatusEnum = z.enum([
  "ONLINE",
  "OFFLINE",
  "AWAY",
  "DO_NOT_DISTURB",
  "INVISIBLE",
  "MOBILE_ONLINE",
]);
export const user = sqliteTable(
  "user",
  {
    internalId: integer("internalId").primaryKey(),
    userId: text("userId", { length: 256 }).notNull().unique(),
    discordUserId: integer("discordId").unique(),
    role: text("role", { length: 256 }).notNull(),
    firstName: text("firstName", { length: 1024 }),
    lastName: text("lastName", { length: 1024 }),
    fullName: text("fullName", { length: 1024 }),
    email: text("email", { length: 256 }).notNull().unique(),
    imageUrl: text("imageUrl", { length: 10000 }),
    lastKnownStatus: text("lastKnownStatus", {
      enum: LastKnownStatusEnum._def.values,
    }),
    lastKnownStatusConfirmedAt: integer("lastKnownStatusConfirmedAt"),
    lastKnownStatusSwitchedAt: integer("lastKnownStatusSwitchedAt"),
    createdAt: integer("createdAt")
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updatedAt")
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (table) => {
    return {
      emailIdx: index("email_idx").on(table.email),
      userIdIdx: index("userId_idx").on(table.userId),
    };
  },
);

export const workspace = sqliteTable(
  "workspace",
  {
    id: text("id").$defaultFn(createId).primaryKey(),
    name: text("name", { length: 256 }).notNull(),
    slug: text("slug", { length: 256 }).notNull().unique(),
    description: text("description", { length: 512 }).notNull(),
    createdAt: integer("createdAt")
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updatedAt")
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
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
    createdAt: integer("createdAt")
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updatedAt")
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
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
  createdAt: integer("createdAt")
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updatedAt")
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  deletedAt: integer("deletedAt"),
});

export const assistantThread = sqliteTable("assistantThread", {
  id: text("id").$defaultFn(createId).primaryKey(),
  userId: text("userId", { length: 256 }).notNull(),
  threadId: text("threadId", { length: 256 }).notNull(),
  preview: text("preview", { length: 256 }).notNull(),
  createdAt: integer("createdAt")
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updatedAt")
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export const message = sqliteTable("message", {
  id: text("id").$defaultFn(createId).primaryKey(),
  channelId: text("channelId").notNull(),
  userId: text("userId").notNull(),
  message: text("message", { length: 60000 }).notNull(),
  createdAt: integer("createdAt")
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updatedAt")
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  deletedAt: integer("deletedAt"),
});

export const conversationSummary = sqliteTable("conversationSummary", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  channelId: text("channelId").notNull(),
  conversationId: text("conversationId").notNull(),
  summaryText: text("summaryText", { length: 500 }).notNull(),
  summaryEmbedding: text("summaryEmbedding").notNull(),
  createdAt: integer("createdAt")
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updatedAt")
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export const conversationSummaryRef = sqliteTable("conversationSummaryRef", {
  id: text("id").$defaultFn(createId).primaryKey(),
  userId: text("userId").notNull(),
  conversationSummaryId: integer("conversationSummaryId").notNull(),
  createdAt: integer("createdAt")
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updatedAt")
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export const conversation = sqliteTable("conversation", {
  id: text("id").$defaultFn(createId).primaryKey(),
  channelId: text("channelId").notNull(),
  summary: text("summary", { length: 10000 }),
  createdAt: integer("createdAt")
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updatedAt")
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export const unGroupedMessage = sqliteTable("unGroupedMessage", {
  messageId: text("messageId")
    .references(() => message.id, { onDelete: "cascade" })
    .primaryKey(),
  createdAt: integer("createdAt")
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export const conversationNeedingSummary = sqliteTable(
  "conversationNeedsSummary",
  {
    conversationId: text("conversationId")
      .references(() => conversation.id, { onDelete: "cascade" })
      .primaryKey(),
    createdAt: integer("createdAt")
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
);

export const conversationMessage = sqliteTable(
  "conversationMessage",
  {
    id: text("id").$defaultFn(createId).primaryKey(),
    messageId: text("messageId")
      .notNull()
      .references(() => message.id, { onDelete: "cascade" }),
    conversationId: text("conversationId")
      .notNull()
      .references(() => conversation.id, { onDelete: "cascade" }),
    createdAt: integer("createdAt")
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updatedAt")
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (t) => ({
    unq: unique().on(t.messageId, t.conversationId),
  }),
);

export const meeting = sqliteTable("meeting", {
  id: text("id").$defaultFn(createId).primaryKey(),
  name: text("name", { length: 256 }).notNull().unique(),
  description: text("description", { length: 512 }).notNull(),
  recurringMeetingId: text("recurringMeetingId"),
  scheduledStart: integer("scheduledStartAt").notNull(),
  scheduledEnd: integer("scheduledEndAt").notNull(),
  startedAt: integer("startedAt"),
  endedAt: integer("endedAt"),
  createdAt: integer("createdAt")
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updatedAt")
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  deletedAt: integer("deletedAt"),
});

export const recurringMeeting = sqliteTable("recurringMeeting", {
  id: text("id").$defaultFn(createId).primaryKey(),
  name: text("name", { length: 256 }).notNull().unique(),
  daysOfWeek: text("daysOfWeek"), // "MONDAY", "TUESDAY", "WEDNESDAY", etc., applicable if weekly. Comma-separated for multiple days.
  scheduledStart: integer("timeOfDay"), // integer from 0 to 2359, applicable if daily
  scheduledDurationInMinutes: integer("durationInMinutes").notNull(),
  until: integer("until"), // Unix timestamp indicating when the recurrence should end
  createdAt: integer("createdAt")
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updatedAt")
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  deletedAt: integer("deletedAt"),
});

export const meetingMessage = sqliteTable("meetingMessage", {
  id: text("id").$defaultFn(createId).primaryKey(),
  meetingId: text("meetingId").notNull(),
  userId: text("userId").notNull(),
  message: text("message", { length: 60000 }).notNull(),
  createdAt: integer("createdAt")
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updatedAt")
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  deletedAt: integer("deletedAt"),
});

export const meetingTranscriptedMessage = sqliteTable(
  "meetingTranscriptedMessage",
  {
    id: text("id").$defaultFn(createId).primaryKey(),
    meetingId: text("meetingId").notNull(),
    userId: text("userId").notNull(),
    message: text("message", { length: 60000 }).notNull(),
    createdAt: integer("createdAt")
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updatedAt")
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    deletedAt: integer("deletedAt"),
  },
);

export const meetingMember = sqliteTable("meetingMember", {
  id: text("id").$defaultFn(createId).primaryKey(),
  bIsHost: integer("bIsHost").notNull().default(0),
  bIsRequiredToAttend: integer("bIsRequiredToAttend").notNull().default(1),
  meetingId: text("meetingId").notNull(),
  userId: text("userId").notNull(),
  createdAt: integer("createdAt")
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updatedAt")
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  deletedAt: integer("deletedAt"),
});

export const insertUserSchema = createInsertSchema(user);
export const selectUserSchema = createSelectSchema(user);

export const insertMessageSchema = createInsertSchema(message);
export const selectMessageSchema = createSelectSchema(message);

export const insertRecurringMeetingSchema = createInsertSchema(
  recurringMeeting,
  {},
);
