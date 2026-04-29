import { getContext } from "remix/async-context-middleware"
import { createContextKey } from "remix/fetch-router"

import type { User } from "#src/db/schema.ts"

// Storage key for attaching user data to request context
let USER_KEY = createContextKey<User>()

/**
 * Get the current authenticated user from app storage.
 */
export function getCurrentUser(): User {
	return getContext().get(USER_KEY)
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
	getContext().set(USER_KEY, user)
}
