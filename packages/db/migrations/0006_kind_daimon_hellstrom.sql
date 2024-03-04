CREATE TABLE `conversationSummary` (
	`id` text PRIMARY KEY NOT NULL,
	`channelId` text NOT NULL,
	`conversationId` text NOT NULL,
	`summaryText` text(500) NOT NULL,
	`summaryEmbedding` blob NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
