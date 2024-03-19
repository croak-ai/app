CREATE TABLE `channel` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text(256) NOT NULL,
	`description` text(512) NOT NULL,
	`workspaceId` text NOT NULL,
	`channelType` text(256) NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer
);
--> statement-breakpoint
CREATE TABLE `conversation` (
	`id` text PRIMARY KEY NOT NULL,
	`channelId` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `conversationMessage` (
	`id` text PRIMARY KEY NOT NULL,
	`messageId` text NOT NULL,
	`conversationId` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `conversationSummary` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`channelId` text NOT NULL,
	`conversationId` text NOT NULL,
	`summaryText` text(500) NOT NULL,
	`summaryEmbedding` blob NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `conversationSummaryRef` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`conversationSummaryId` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `meeting` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text(256) NOT NULL,
	`description` text(512) NOT NULL,
	`recurringMeetingId` text,
	`scheduledStartAt` integer NOT NULL,
	`scheduledEndAt` integer NOT NULL,
	`startedAt` integer,
	`endedAt` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer
);
--> statement-breakpoint
CREATE TABLE `meetingMember` (
	`id` text PRIMARY KEY NOT NULL,
	`bIsHost` integer DEFAULT 0 NOT NULL,
	`bIsRequiredToAttend` integer DEFAULT 1 NOT NULL,
	`meetingId` text NOT NULL,
	`userId` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer
);
--> statement-breakpoint
CREATE TABLE `meetingMessage` (
	`id` text PRIMARY KEY NOT NULL,
	`meetingId` text NOT NULL,
	`userId` text NOT NULL,
	`message` text(60000) NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer
);
--> statement-breakpoint
CREATE TABLE `meetingTranscriptedMessage` (
	`id` text PRIMARY KEY NOT NULL,
	`meetingId` text NOT NULL,
	`userId` text NOT NULL,
	`message` text(60000) NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer
);
--> statement-breakpoint
CREATE TABLE `message` (
	`id` text PRIMARY KEY NOT NULL,
	`channelId` text NOT NULL,
	`userId` text NOT NULL,
	`message` text(60000) NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer
);
--> statement-breakpoint
CREATE TABLE `recurringMeeting` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text(256) NOT NULL,
	`daysOfWeek` text,
	`timeOfDay` integer,
	`durationInMinutes` integer NOT NULL,
	`until` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer
);
--> statement-breakpoint
CREATE TABLE `testTable` (
	`id` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE `unSummarizedMessage` (
	`id` text PRIMARY KEY NOT NULL,
	`messageId` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user` (
	`internalId` integer PRIMARY KEY NOT NULL,
	`userId` text(256) NOT NULL,
	`role` text(256) NOT NULL,
	`firstName` text(1024),
	`lastName` text(1024),
	`fullName` text(1024),
	`email` text(256) NOT NULL,
	`imageUrl` text(10000),
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workspace` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text(256) NOT NULL,
	`slug` text(256) NOT NULL,
	`description` text(512) NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer
);
--> statement-breakpoint
CREATE TABLE `workspaceMember` (
	`id` text PRIMARY KEY NOT NULL,
	`workspaceId` text NOT NULL,
	`userId` text NOT NULL,
	`bCanManageChannels` integer DEFAULT 0,
	`bCanManageWorkspaceMembers` integer DEFAULT 0,
	`bCanManageWorkspaceSettings` integer DEFAULT 0,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer
);
--> statement-breakpoint

CREATE VIRTUAL TABLE user_fts USING fts5(firstName, lastName, fullName, email, content="user", content_rowid="internalId");
--> statement-breakpoint

CREATE TRIGGER user_ai AFTER INSERT ON user BEGIN
    INSERT INTO user_fts(rowid, firstName, lastName, fullName, email) VALUES (new.internalId, new.firstName, new.lastName, new.fullName, new.email);
END;    
--> statement-breakpoint

CREATE TRIGGER user_ad AFTER DELETE ON user BEGIN
    INSERT INTO user_fts(user_fts, rowid, firstName, lastName, fullName, email) VALUES('delete', old.internalId, old.firstName, old.lastName, old.fullName, old.email);
END;
--> statement-breakpoint

CREATE TRIGGER user_au AFTER UPDATE ON user BEGIN
    INSERT INTO user_fts(user_fts, rowid, firstName, lastName, fullName, email) VALUES('delete', old.internalId, old.firstName, old.lastName, old.fullName, old.email);
    INSERT INTO user_fts(rowid, firstName, lastName, fullName, email) VALUES (new.internalId, new.firstName, new.lastName, new.fullName, new.email);
END;
--> statement-breakpoint

CREATE UNIQUE INDEX `channel_workspaceId_slug_unique` ON `channel` (`workspaceId`,`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `meeting_name_unique` ON `meeting` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `recurringMeeting_name_unique` ON `recurringMeeting` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_userId_unique` ON `user` (`userId`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `user` (`email`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `user` (`userId`);--> statement-breakpoint
CREATE UNIQUE INDEX `workspace_slug_unique` ON `workspace` (`slug`);--> statement-breakpoint
CREATE INDEX `slug_idx` ON `workspace` (`slug`);