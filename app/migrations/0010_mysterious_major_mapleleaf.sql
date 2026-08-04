CREATE INDEX `cars_client_id_idx` ON `cars` (`client_id`);--> statement-breakpoint
CREATE INDEX `cars_dealer_id_idx` ON `cars` (`dealer_id`);--> statement-breakpoint
CREATE INDEX `notifications_user_id_idx` ON `notifications` (`user_id`);--> statement-breakpoint
CREATE INDEX `payments_car_id_idx` ON `payments` (`car_id`);