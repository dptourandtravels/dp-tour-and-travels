CREATE TABLE `dealer_stock_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`dealer_id` text NOT NULL,
	`car_make` text NOT NULL,
	`car_model` text NOT NULL,
	`message` text,
	`status` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`dealer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `cars` ADD `dealer_id` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `cars` ADD `lease_start_date` integer;--> statement-breakpoint
ALTER TABLE `cars` ADD `lease_end_date` integer;