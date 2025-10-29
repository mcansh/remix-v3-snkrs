import type { Middleware } from "@remix-run/fetch-router"
import { createStorageKey, redirect } from "@remix-run/fetch-router"

import type { User } from "../db/schema.ts"
import { getUserById } from "../models/user.ts"
import { routes } from "../routes.ts"
import { getSession, getUserIdFromSession } from "../utils/session.ts"

// Storage keys for attaching data to request context
export const USER_KEY = createStorageKey<User>()
export const SESSION_ID_KEY = createStorageKey<string>()

/**
 * Middleware that optionally loads the current user if authenticated.
 * Does not redirect if not authenticated.
 * Attaches user (if any) and sessionId to context.storage.
 */
export let loadAuth: Middleware = async ({ request, storage }) => {
	let session = getSession(request)
	let userId = getUserIdFromSession(session.sessionId)

	// Always set session ID for cart/guest functionality
	storage.set(SESSION_ID_KEY, session.sessionId)

	// Only set USER_KEY if user is authenticated
	if (userId) {
		let user = await getUserById(userId)
		if (user) storage.set(USER_KEY, user)
	}
}

/**
 * Middleware that requires a user to be authenticated.
 * Redirects to login if not authenticated.
 * Attaches user and sessionId to context.storage.
 */
export let requireAuth: Middleware = async ({ request, storage, url }) => {
	let session = getSession(request)

	let userId = getUserIdFromSession(session.sessionId)
	if (!userId) {
		let redirectUrl = routes.auth.login.index.href()
		redirectUrl += `?returnTo=${encodeURIComponent(url.href)}`
		return redirect(redirectUrl)
	}

	let user = await getUserById(userId)
	if (!user) {
		let redirectUrl = routes.auth.login.index.href()
		redirectUrl += `?returnTo=${encodeURIComponent(url.href)}`
		return redirect(redirectUrl)
	}

	storage.set(USER_KEY, user)
	storage.set(SESSION_ID_KEY, session.sessionId)
}
