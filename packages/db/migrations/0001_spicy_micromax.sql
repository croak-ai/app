ALTER TABLE `channel` RENAME COLUMN `name` TO `slug`;--> statement-breakpoint
DROP INDEX IF EXISTS `channel_workspaceId_name_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `channel_workspaceId_slug_unique` ON `channel` (`workspaceId`,`slug`);