import * as z from "zod/mini";

const envSchema = z.object({
  // DATABASE_URL
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_UPLOAD_PRESET: z.string(),
  CLOUDINARY_UPLOAD_URL: z.url(),
  CLOUDINARY_URL: z.url({ pattern: /^cloudinary:\/\// }),
  DEFAULT_USER: z.string(),
  SENTRY_DSN: z.string(),
  SESSION_PASSWORD: z.string(),
});

export let env = envSchema.parse(import.meta.env);
