CREATE TABLE `brands` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`name` text(255) NOT NULL,
	`slug` text(255) NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `brands_name_unique` ON `brands` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `brands_slug_unique` ON `brands` (`slug`);--> statement-breakpoint
ALTER TABLE `sneakers` ADD `brand_id` text REFERENCES brands(id) ON DELETE RESTRICT;--> statement-breakpoint
CREATE INDEX `sneakers_brand_id_idx` ON `sneakers` (`brand_id`);
--> statement-breakpoint
INSERT INTO `brands` (`id`, `name`, `slug`, `created_at`, `updated_at`)
SELECT lower(hex(randomblob(16))), MIN(`brand`) as `name`, `brand_slug`, strftime('%s','now') * 1000, strftime('%s','now') * 1000
FROM `sneakers`
GROUP BY `brand_slug`;
--> statement-breakpoint
UPDATE `sneakers`
SET `brand_id` = (
	SELECT `brands`.`id`
	FROM `brands`
	WHERE `brands`.`slug` = `sneakers`.`brand_slug`
);
