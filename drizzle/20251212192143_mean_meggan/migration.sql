CREATE TABLE "sneakers" (
	"id" varchar PRIMARY KEY,
	"brand" varchar NOT NULL,
	"colorway" varchar(255) NOT NULL,
	"model" varchar(255) NOT NULL,
	"image" varchar(255) NOT NULL,
	"purchase_date" timestamp with time zone,
	"size" integer NOT NULL,
	"purchase_price" integer NOT NULL,
	"retail_price" integer NOT NULL,
	"sold" boolean DEFAULT false NOT NULL,
	"sold_date" timestamp with time zone,
	"sold_price" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY,
	"email" varchar(255) NOT NULL UNIQUE,
	"given_name" varchar(255) NOT NULL,
	"family_name" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"username" varchar(255) NOT NULL,
	"password_salt" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sneakers" ADD CONSTRAINT "sneakers_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;