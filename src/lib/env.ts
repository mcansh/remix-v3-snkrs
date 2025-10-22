import { env } from "cloudflare:workers"
import { drizzle } from "drizzle-orm/d1"
import * as z from "zod/mini"

import * as schema from "../db/schema"

const envSchema = z.pipe(
	z.object({
		CLOUDINARY_CLOUD_NAME: z.string(),
		CLOUDINARY_UPLOAD_PRESET: z.string(),
		CLOUDINARY_UPLOAD_URL: z.url(),
		CLOUDINARY_URL: z.url({ pattern: /^cloudinary:\/\// }),
		DEFAULT_USER: z.string(),
		SENTRY_DSN: z.string(),
		SESSION_PASSWORD: z.string(),
		// db: z.instanceof(D1Database),
		db: z.any(),
	}),
	z.transform((values) => {
		return {
			...values,
			db: drizzle(values.db, { schema }),
		}
	}),
)

let parsedEnv = envSchema.parse(env)

export { parsedEnv as env }
