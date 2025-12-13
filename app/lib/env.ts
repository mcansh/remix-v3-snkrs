import * as z from "zod/mini"

const envSchema = z.object({
	CLOUDINARY_CLOUD_NAME: z.string(),
	CLOUDINARY_UPLOAD_PRESET: z.string(),
	CLOUDINARY_UPLOAD_URL: z.url(),
	CLOUDINARY_URL: z.url({ pattern: /^cloudinary:\/\// }),
	DEFAULT_USER: z.string(),
	SENTRY_DSN: z.string(),
	SESSION_PASSWORD: z.string(),
	DATABASE_URL: z.url({ pattern: /^postgres:\/\// }),
})

let parsedEnv = envSchema.parse(process.env)

export { parsedEnv as env }
