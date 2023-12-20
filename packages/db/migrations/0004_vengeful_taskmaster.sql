
ALTER TABLE workspace ADD `slug` text(256) NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `workspace_slug_unique` ON `workspace` (`slug`);

DROP TABLE 'dekEncryptionKey';

CREATE TABLE `dekEncryptionKey` (
	`id` integer PRIMARY KEY NOT NULL,
	`key` text(256) NOT NULL,
	`kekType` text(256) NOT NULL,
	`kekId` text(256),
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer
);