CREATE TABLE `channel` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text(256) NOT NULL,
	`description` text(256) NOT NULL,
	`workspaceId` integer NOT NULL,
	`bRequiresWriteAccess` integer DEFAULT 0,
	`bIsPrivateChannel` integer DEFAULT 0,
	`privateEncryptionId` text(256),
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer
);
--> statement-breakpoint
CREATE TABLE `channelWriteAccess` (
	`id` integer PRIMARY KEY NOT NULL,
	`channelId` integer NOT NULL,
	`userId` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer
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
	`userId` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer
);
--> statement-breakpoint
CREATE TABLE `workspace` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text(256) NOT NULL,
	`description` text(256) NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer,
	`publicEncryptionId` text(256) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workspaceMember` (
	`id` integer PRIMARY KEY NOT NULL,
	`workspaceId` integer NOT NULL,
	`userId` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer
);
-- --> statement-breakpoint
DROP TABLE `example`;