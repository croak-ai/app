DROP TABLE `conversationSummary`;
--> statement-breakpoint
CREATE TABLE `conversationSummary` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`channelId` text NOT NULL,
	`conversationId` text NOT NULL,
	`summaryText` text(500) NOT NULL,
	`summaryEmbedding` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);