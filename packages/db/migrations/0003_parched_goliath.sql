CREATE TABLE `meeting` (
	`id` text,
	`recurringMeetingId` integer,
	`scheduledAt` integer NOT NULL,
	`startedAt` integer,
	`endedAt` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer
);
--> statement-breakpoint
CREATE TABLE `meetingMessage` (
	`id` integer PRIMARY KEY NOT NULL,
	`meetingId` text NOT NULL,
	`userId` text NOT NULL,
	`message` text(60000) NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer
);
--> statement-breakpoint
CREATE TABLE `meetingParticipant` (
	`id` integer PRIMARY KEY NOT NULL,
	`meetingId` text NOT NULL,
	`userId` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer
);
--> statement-breakpoint
CREATE TABLE `meetingTranscriptedMessage` (
	`id` integer PRIMARY KEY NOT NULL,
	`meetingId` text NOT NULL,
	`userId` text NOT NULL,
	`message` text(60000) NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer
);
--> statement-breakpoint
CREATE TABLE `recurringMeeting` (
	`id` integer PRIMARY KEY NOT NULL,
	`frequency` text(256) NOT NULL,
	`interval` integer NOT NULL,
	`count` integer,
	`until` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer
);
