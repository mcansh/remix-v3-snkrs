import type { User } from "#app/db/schema.ts";
import { getContext } from "remix/async-context-middleware";
import type { AuthState } from "remix/auth-middleware";
import { Auth } from "remix/auth-middleware";
import type { AuthIdentity } from "./auth-session";

export function getCurrentUser(): User {
	let auth = getCurrentAuth()

	if (!auth.ok) {
		throw new Error(
			"Expected an authenticated user. Make sure requireAuth() runs before this code.",
		)
	}

	return auth.identity.user
}

export function getCurrentUserSafely(): User | null {
	let auth = getCurrentAuth()

	return auth.ok ? auth.identity.user : null
}

function getCurrentAuth(): AuthState<AuthIdentity> {
	return getContext().get(Auth) as AuthState<AuthIdentity>
}
