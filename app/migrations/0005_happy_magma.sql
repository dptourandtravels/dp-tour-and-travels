CREATE TABLE `car_requirements` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` text NOT NULL,
	`created_at` integer NOT NULL,
	`closed_at` integer
);
--> statement-breakpoint
CREATE TABLE `client_intake_applications` (
	`id` text PRIMARY KEY NOT NULL,
	`car_requirement_id` text NOT NULL,
	`client_user_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`car_make` text NOT NULL,
	`car_model` text NOT NULL,
	`message` text,
	`accepted_terms_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`car_requirement_id`) REFERENCES `car_requirements`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`client_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `dealer_applications` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`message` text,
	`created_at` integer NOT NULL
);
