CREATE TABLE `unSummarizedMessage` (
	`id` text PRIMARY KEY NOT NULL,
	`channelId` text NOT NULL,
	`userId` text NOT NULL,
	`message` text(60000) NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer
);
