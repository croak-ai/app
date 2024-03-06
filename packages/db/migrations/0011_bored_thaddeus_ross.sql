CREATE TABLE `assistantThread` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text(256) NOT NULL,
	`threadId` text(256) NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
