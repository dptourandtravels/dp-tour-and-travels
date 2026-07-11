CREATE TABLE `agreements` (
	`id` text PRIMARY KEY NOT NULL,
	`car_id` text NOT NULL,
	`party_user_id` text NOT NULL,
	`party_role` text NOT NULL,
	`car_description` text NOT NULL,
	`registration_number` text NOT NULL,
	`owner_name` text NOT NULL,
	`aadhaar_uid` text NOT NULL,
	`rate` integer NOT NULL,
	`issued_by_user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`car_id`) REFERENCES `cars`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`party_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`issued_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
