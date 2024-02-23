CREATE TABLE `nonGroupedMessage` (
	`id` integer PRIMARY KEY NOT NULL,
	`channelId` integer NOT NULL,
	`userId` text NOT NULL,
	`message` text(60000) NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer
);
