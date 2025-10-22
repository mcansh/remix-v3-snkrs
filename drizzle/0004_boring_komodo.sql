DROP TABLE `brands`;--> statement-breakpoint
DROP TABLE `settings`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_sneakers` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`brand` text NOT NULL,
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
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_sneakers`("id", "brand", "colorway", "model", "image", "purchase_date", "size", "purchase_price", "retail_price", "sold", "sold_date", "sold_price", "created_at", "updated_at", "user_id") SELECT "id", "brand", "colorway", "model", "image", "purchase_date", "size", "purchase_price", "retail_price", "sold", "sold_date", "sold_price", "created_at", "updated_at", "user_id" FROM `sneakers`;--> statement-breakpoint
DROP TABLE `sneakers`;--> statement-breakpoint
ALTER TABLE `__new_sneakers` RENAME TO `sneakers`;--> statement-breakpoint
PRAGMA foreign_keys=ON;