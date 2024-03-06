ALTER TABLE `unSummarizedMessage` RENAME COLUMN `channelId` TO `messageId`;--> statement-breakpoint
ALTER TABLE `unSummarizedMessage` DROP COLUMN `userId`;--> statement-breakpoint
ALTER TABLE `unSummarizedMessage` DROP COLUMN `message`;--> statement-breakpoint
ALTER TABLE `unSummarizedMessage` DROP COLUMN `createdAt`;--> statement-breakpoint
ALTER TABLE `unSummarizedMessage` DROP COLUMN `updatedAt`;--> statement-breakpoint
ALTER TABLE `unSummarizedMessage` DROP COLUMN `deletedAt`;