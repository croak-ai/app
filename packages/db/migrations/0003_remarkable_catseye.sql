CREATE TABLE `user` (
	`user_id` integer PRIMARY KEY NOT NULL,
	`role` text(256) NOT NULL,
	`first_name` text(256) NOT NULL,
	`last_name` text(256) NOT NULL,
	`email` text(256) NOT NULL,
	`image_url` text(512),
	`profile_image_url` text(512),
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);