import { createCookie } from "remix/cookie"
import { createCookieSessionStorage } from "remix/session/cookie-storage"

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
})

/**
 * Filesystem-based session storage.
 * Sessions are stored in the app's tmp/sessions directory.
 */
export let sessionStorage = createCookieSessionStorage()
