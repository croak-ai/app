CREATE TABLE `channel` (
	`id` integer PRIMARY KEY NOT NULL,
	`slug` text(256) NOT NULL,
	`description` text(512) NOT NULL,
	`workspaceId` integer NOT NULL,
	`channelType` text(256) NOT NULL,
	`bRequiresWriteAccess` integer DEFAULT 0,
	`bIsPrivateChannel` integer DEFAULT 0,
	`privateEncryptionId` text(256),
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer
);
--> statement-breakpoint
CREATE TABLE `channelAccess` (
	`id` integer PRIMARY KEY NOT NULL,
	`channelId` integer NOT NULL,
	`userId` text NOT NULL,
	`bCanRead` integer DEFAULT 0,
	`bCanWrite` integer DEFAULT 0,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer
);
--> statement-breakpoint
CREATE TABLE `conversation` (
	`id` integer PRIMARY KEY NOT NULL,
	`channelId` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `conversationMessage` (
	`id` integer PRIMARY KEY NOT NULL,
	`messageId` integer NOT NULL,
	`conversationId` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `dekEncryptionKey` (
	`id` integer PRIMARY KEY NOT NULL,
	`key` text(256) NOT NULL,
	`kekType` text(256) NOT NULL,
	`kekId` text(256),
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer
);
--> statement-breakpoint
CREATE TABLE `dekEncryptionKeyUserAccess` (
	`id` integer PRIMARY KEY NOT NULL,
	`dekId` integer NOT NULL,
	`userId` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer
);
--> statement-breakpoint
CREATE TABLE `meeting` (
	`id` text,
	`recurringMeetingId` integer,
	`scheduledAt` integer NOT NULL,
	`startedAt` integer,
	`endedAt` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer
);
--> statement-breakpoint
CREATE TABLE `meetingMessage` (
	`id` integer PRIMARY KEY NOT NULL,
	`meetingId` text NOT NULL,
	`userId` text NOT NULL,
	`message` text(60000) NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer
);
--> statement-breakpoint
CREATE TABLE `meetingParticipant` (
	`id` integer PRIMARY KEY NOT NULL,
	`meetingId` text NOT NULL,
	`userId` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer
);
--> statement-breakpoint
CREATE TABLE `meetingTranscriptedMessage` (
	`id` integer PRIMARY KEY NOT NULL,
	`meetingId` text NOT NULL,
	`userId` text NOT NULL,
	`message` text(60000) NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer
);
--> statement-breakpoint
CREATE TABLE `message` (
	`id` integer PRIMARY KEY NOT NULL,
	`channelId` integer NOT NULL,
	`userId` text NOT NULL,
	`message` text(60000) NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer
);
--> statement-breakpoint
CREATE TABLE `nonGroupedMessage` (
	`id` integer PRIMARY KEY NOT NULL,
	`channelId` integer NOT NULL,
	`userId` text NOT NULL,
	`message` text(60000) NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer
);
--> statement-breakpoint
CREATE TABLE `recurringMeeting` (
	`id` integer PRIMARY KEY NOT NULL,
	`frequency` text(256) NOT NULL,
	`interval` integer NOT NULL,
	`count` integer,
	`until` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer
);
--> statement-breakpoint
CREATE TABLE `user` (
	`userId` text(256) PRIMARY KEY NOT NULL,
	`role` text(256) NOT NULL,
	`firstName` text(256),
	`lastName` text(256),
	`email` text(256) NOT NULL,
	`imageUrl` text(10000),
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workspace` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text(256) NOT NULL,
	`slug` text(256) NOT NULL,
	`description` text(512) NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer,
	`publicEncryptionId` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workspaceMember` (
	`id` integer PRIMARY KEY NOT NULL,
	`workspaceId` integer NOT NULL,
	`userId` text NOT NULL,
	`bCanManageChannels` integer DEFAULT 0,
	`bCanManageWorkspaceMembers` integer DEFAULT 0,
	`bCanManageWorkspaceSettings` integer DEFAULT 0,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `channel_workspaceId_slug_unique` ON `channel` (`workspaceId`,`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `dekEncryptionKey_key_unique` ON `dekEncryptionKey` (`key`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `workspace_slug_unique` ON `workspace` (`slug`);--> statement-breakpoint
CREATE INDEX `slug_idx` ON `workspace` (`slug`);