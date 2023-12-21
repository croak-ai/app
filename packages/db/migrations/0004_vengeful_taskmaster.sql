
ALTER TABLE workspace ADD `slug` text(256) NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `workspace_slug_unique` ON `workspace` (`slug`);

