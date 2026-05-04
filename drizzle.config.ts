import { defineConfig } from "drizzle-kit"
import * as s from "remix/data-schema"

const cloudflare = s.object({
	CLOUDFLARE_ACCOUNT_ID: s.string(),
	CLOUDFLARE_DATABASE_ID: s.string(),
	CLOUDFLARE_D1_TOKEN: s.string(),
})

const env = s.parse(cloudflare, process.env)

export default defineConfig({
	out: "./drizzle",
	schema: "./app/db/schema.ts",
	dialect: "sqlite",
	casing: "snake_case",
	driver: "d1-http",
	dbCredentials: {
		accountId: env.CLOUDFLARE_ACCOUNT_ID,
		databaseId: env.CLOUDFLARE_DATABASE_ID,
		token: env.CLOUDFLARE_D1_TOKEN,
	},
})
