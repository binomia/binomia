CREATE TABLE `searched_users` (
	`id` integer PRIMARY KEY NOT NULL,
	`fullName` text,
	`username` text,
	`email` text,
	`dniNumber` text,
	`profileImageUrl` text,
	`status` text
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer NOT NULL,
	`type` text,
	`status` text,
	`timestamp` integer,
	`data` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `transactions_id_unique` ON `transactions` (`id`);