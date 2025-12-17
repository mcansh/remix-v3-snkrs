import { createCookie } from "@remix-run/cookie"
import { createCookieSessionStorage } from "@remix-run/session/cookie-storage"
import type { z, treeifyError } from "zod/mini"

import { registerSchema } from "../routes/auth/register.js"

/**
 * Session cookie configuration for the bookstore demo.
 * Uses secure defaults with a 30-day expiration.
 */
export let sessionCookie = createCookie("session", {
	secrets: ["s3cr3t-k3y-for-d3mo"],
	httpOnly: true,
	sameSite: "Lax",
	maxAge: 2592000, // 30 days
	path: "/",
	secure: process.env.NODE_ENV === "production",
})

/**
 * Cookie-based session storage.
 * Sessions are stored in the session cookie itself.
 */
export let sessionStorage = createCookieSessionStorage()

export type FlashSessionData = Partial<{
	register?: string
	"register-form-errors"?: ReturnType<
		typeof treeifyError<z.infer<typeof registerSchema>>
	>["properties"]
}>
