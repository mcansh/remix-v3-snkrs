import * as z from "zod/mini"
import { env } from "cloudflare:workers"
import { drizzle } from "drizzle-orm/d1"

import * as schema from "#src/db/schema.ts"

const envSchema = z.object({
	CLOUDINARY_CLOUD_NAME: z.string(),
	CLOUDINARY_UPLOAD_PRESET: z.string(),
	CLOUDINARY_UPLOAD_URL: z.url(),
	CLOUDINARY_URL: z.url({ pattern: /^cloudinary:\/\// }),
	DEFAULT_USER: z.string(),
	SENTRY_DSN: z.string(),
	SESSION_PASSWORD: z.string(),
	db: z.pipe(
		z.custom<D1Database>(),
		z.transform((db) => drizzle(db, { schema })),
	),
})

let parsedEnv = envSchema.parse(env)

export { parsedEnv as env }
