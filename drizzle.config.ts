import { defineConfig } from "drizzle-kit"
import * as z from "zod/mini"

let cloudflare = z.pipe(
	z.object({
		CLOUDFLARE_ACCOUNT_ID: z.string(),
		CLOUDFLARE_DATABASE_ID: z.string(),
		CLOUDFLARE_TOKEN: z.string(),
	}),
	z.transform((input) => {
		return {
			ACCOUNT_ID: input.CLOUDFLARE_ACCOUNT_ID,
			DATABASE_ID: input.CLOUDFLARE_DATABASE_ID,
			ACCESS_TOKEN: input.CLOUDFLARE_TOKEN,
		}
	}),
)

let env = cloudflare.parse(process.env)

export default defineConfig({
	out: "./drizzle",
	schema: "./src/db/schema.ts",
	dialect: "sqlite",
	driver: "d1-http",
	dbCredentials: {
		accountId: env.ACCOUNT_ID,
		databaseId: env.DATABASE_ID,
		token: env.ACCESS_TOKEN,
	},
})
