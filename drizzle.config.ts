import { defineConfig } from "drizzle-kit"
import { z } from "zod/mini"

let envSchema = z.object({
	DATABASE_URL: z.url({ pattern: /^postgresql:\/\// }),
})

let env = envSchema.parse(process.env)

export default defineConfig({
	out: "./drizzle",
	schema: "./app/db/schema.ts",
	dialect: "postgresql",
	casing: "snake_case",
	dbCredentials: { url: env.DATABASE_URL },
})
