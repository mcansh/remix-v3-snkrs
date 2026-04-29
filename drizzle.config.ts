import * as s from "remix/data-schema"
import { defineConfig } from "drizzle-kit"

let cloudflare = s.object({
	CLOUDFLARE_ACCOUNT_ID: s.string(),
	CLOUDFLARE_DATABASE_ID: s.string(),
	CLOUDFLARE_D1_TOKEN: s.string(),
})

let env = s.parse(cloudflare, process.env)

export default defineConfig({
	out: "./drizzle",
	schema: "./src/db/schema.ts",
	dialect: "sqlite",
	casing: "snake_case",
	driver: "d1-http",
	dbCredentials: {
		accountId: env.CLOUDFLARE_ACCOUNT_ID,
		databaseId: env.CLOUDFLARE_DATABASE_ID,
		token: env.CLOUDFLARE_D1_TOKEN,
	},
})
