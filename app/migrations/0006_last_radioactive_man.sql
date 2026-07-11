CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`doc_type` text NOT NULL,
	`file_name` text NOT NULL,
	`r2_key` text NOT NULL,
	`uploaded_at` integer NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `documents_client_doc_type_unique` ON `documents` (`client_id`,`doc_type`);--> statement-breakpoint
ALTER TABLE `payments` ADD `method` text;