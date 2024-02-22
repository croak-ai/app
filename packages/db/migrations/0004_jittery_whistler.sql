CREATE TABLE `conversationMessages` (
	`id` integer PRIMARY KEY NOT NULL,
	`messageId` integer NOT NULL,
	`conversationId` integer NOT NULL
);
--> statement-breakpoint

DROP TABLE `conversation`;
--> statement-breakpoint
ALTER TABLE `message` DROP COLUMN `conversationId`;