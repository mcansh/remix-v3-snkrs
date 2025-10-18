PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_settings` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`show_prices` integer DEFAULT false NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_settings`("id", "show_prices", "user_id", "created_at", "updated_at") SELECT "id", "show_prices", "user_id", "created_at", "updated_at" FROM `settings`;--> statement-breakpoint
DROP TABLE `settings`;--> statement-breakpoint
ALTER TABLE `__new_settings` RENAME TO `settings`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_sneakers` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`colorway` text(255) NOT NULL,
	`model` text(255) NOT NULL,
	`image` text(255) NOT NULL,
	`purchase_date` integer,
	`size` integer NOT NULL,
	`purchase_price` integer NOT NULL,
	`retail_price` integer NOT NULL,
	`sold` integer DEFAULT false NOT NULL,
	`sold_date` integer,
	`sold_price` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`brand_id` text NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_sneakers`("id", "colorway", "model", "image", "purchase_date", "size", "purchase_price", "retail_price", "sold", "sold_date", "sold_price", "created_at", "updated_at", "brand_id", "user_id") SELECT "id", "colorway", "model", "image", "purchase_date", "size", "purchase_price", "retail_price", "sold", "sold_date", "sold_price", "created_at", "updated_at", "brand_id", "user_id" FROM `sneakers`;--> statement-breakpoint
DROP TABLE `sneakers`;--> statement-breakpoint
ALTER TABLE `__new_sneakers` RENAME TO `sneakers`;