CREATE TABLE `channel` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text(256) NOT NULL,
	`description` text(512) NOT NULL,
	`workspaceId` integer NOT NULL,
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
	`bCanManageUsers` integer DEFAULT 0,
	`bCanManageWorkspaces` integer DEFAULT 0,
	`createdAt` integer NOT NULL,
	`deletedAt` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `dekEncryptionKey_key_unique` ON `dekEncryptionKey` (`key`);--> statement-breakpoint
CREATE UNIQUE INDEX `workspace_slug_unique` ON `workspace` (`slug`);--> statement-breakpoint
CREATE INDEX `slug_idx` ON `workspace` (`slug`);