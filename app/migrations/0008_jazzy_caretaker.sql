ALTER TABLE `car_requirements` ADD `color` text;--> statement-breakpoint
ALTER TABLE `car_requirements` ADD `quantity` integer;--> statement-breakpoint
ALTER TABLE `dealer_stock_requests` ADD `quantity` integer DEFAULT 1 NOT NULL;