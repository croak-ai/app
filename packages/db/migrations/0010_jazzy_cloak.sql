CREATE TABLE `conversationSummaryRef` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`conversationSummaryId` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
