ALTER TABLE user ADD `lastKnownStatus` text;--> statement-breakpoint
ALTER TABLE user ADD `lastKnownStatusConfirmedAt` integer;--> statement-breakpoint
ALTER TABLE user ADD `lastKnownStatusSwitchedAt` integer;