CREATE TABLE `user` (
	`userId` text(256) PRIMARY KEY NOT NULL,
	`role` text(256) NOT NULL,
	`firstName` text(256) NOT NULL,
	`lastName` text(256) NOT NULL,
	`email` text(256) NOT NULL,
	`imageUrl` text(512),
	`profileImageUrl` text(512),
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);