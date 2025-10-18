CREATE TABLE `brands` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`name` text(255) NOT NULL,
	`slug` text(255) NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`show_prices` integer DEFAULT false NOT NULL,
	`user_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sneakers` (
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
	`brand_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`email` text(255) NOT NULL,
	`given_name` text(255) NOT NULL,
	`family_name` text(255) NOT NULL,
	`password` text(255) NOT NULL,
	`username` text(255) NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
