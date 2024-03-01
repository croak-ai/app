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
CREATE TABLE `meetingParticipant` (
	`id` text PRIMARY KEY NOT NULL,
	`meetingId` text NOT NULL,
	`userId` text NOT NULL,
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
CREATE TABLE `nonGroupedMessage` (
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
CREATE UNIQUE INDEX `channel_workspaceId_slug_unique` ON `channel` (`workspaceId`,`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `meeting_name_unique` ON `meeting` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `recurringMeeting_name_unique` ON `recurringMeeting` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `workspace_slug_unique` ON `workspace` (`slug`);--> statement-breakpoint
CREATE INDEX `slug_idx` ON `workspace` (`slug`);