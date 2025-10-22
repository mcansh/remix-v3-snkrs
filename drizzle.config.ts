import { defineConfig } from "drizzle-kit"
import * as z from "zod/mini"

let cloudflare = z.object({
	CLOUDFLARE_ACCOUNT_ID: z.string(),
	CLOUDFLARE_DATABASE_ID: z.string(),
	CLOUDFLARE_D1_TOKEN: z.string(),
})

let env = cloudflare.parse(process.env)

export default defineConfig({
	out: "./drizzle",
	schema: "./src/db/schema.ts",
	dialect: "sqlite",
	driver: "d1-http",
	dbCredentials: {
		accountId: env.CLOUDFLARE_ACCOUNT_ID,
		databaseId: env.CLOUDFLARE_DATABASE_ID,
		token: env.CLOUDFLARE_D1_TOKEN,
	},
})
