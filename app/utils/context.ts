import type { User } from "#app/db/schema.js"
import { getContext } from "@remix-run/async-context-middleware"
import { createStorageKey } from "@remix-run/fetch-router"

// Storage key for attaching user data to request context
let USER_KEY = createStorageKey<User>()

/**
 * Get the current authenticated user from app storage.
 */
export function getCurrentUser(): User {
	return getContext().storage.get(USER_KEY)
}

/**
 * Get the current authenticated user from app storage, or null if not authenticated.
 * Safe to use when running behind loadAuth middleware (not requireAuth).
 */
export function getCurrentUserSafely(): User | null {
	try {
		return getCurrentUser()
	} catch {
		return null
	}
}

/**
 * Set the current authenticated user in app storage.
 */
export function setCurrentUser(user: User): void {
	getContext().storage.set(USER_KEY, user)
}
