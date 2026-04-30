import * as s from "remix/data-schema"
import { env as cf_env } from "cloudflare:workers"
import { drizzle } from "drizzle-orm/d1"
import { url } from "remix/data-schema/checks"

import * as schema from "#app/db/schema.ts"

const envSchema = s.object({
	CLOUDINARY_CLOUD_NAME: s.string(),
	CLOUDINARY_UPLOAD_PRESET: s.string(),
	CLOUDINARY_UPLOAD_URL: s.string().pipe(url()),
	CLOUDINARY_URL: s.string().pipe(url()),
	DEFAULT_USER: s.string(),
	SENTRY_DSN: s.string().pipe(url()),
	SESSION_PASSWORD: s.string(),
})

let parsedEnv = s.parseSafe(envSchema, cf_env)

if (parsedEnv.success === false) {
	console.error(parsedEnv.issues)
	throw new Error("Failed to parse environment variables")
}

export let env = {
	...parsedEnv.value,
	db: drizzle(cf_env.db, { schema }),
}
