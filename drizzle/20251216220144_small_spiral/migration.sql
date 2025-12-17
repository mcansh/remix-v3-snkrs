ALTER TABLE "sneakers" RENAME COLUMN "purchase_date" TO "date";--> statement-breakpoint
ALTER TABLE "sneakers" RENAME COLUMN "purchase_price" TO "price";--> statement-breakpoint
ALTER TABLE "sneakers" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sneakers" ALTER COLUMN "brand" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sneakers" ALTER COLUMN "colorway" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sneakers" ALTER COLUMN "model" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sneakers" ALTER COLUMN "image" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sneakers" ALTER COLUMN "date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "sneakers" ALTER COLUMN "size" SET DATA TYPE numeric(4,2);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "given_name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "family_name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "username" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password_salt" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_username_key" UNIQUE("username");--> statement-breakpoint
ALTER TABLE "sneakers" DROP COLUMN "retail_price";--> statement-breakpoint
ALTER TABLE "sneakers" DROP COLUMN "sold";--> statement-breakpoint
ALTER TABLE "sneakers" DROP COLUMN "sold_date";--> statement-breakpoint
ALTER TABLE "sneakers" DROP COLUMN "sold_price";