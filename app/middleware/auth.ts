import { createCredentialsAuthProvider } from "remix/auth";
import {
    auth,
    createSessionAuthScheme,
    requireAuth as requireAuthenticated,
} from "remix/auth-middleware";
import { redirect } from "remix/response/redirect";

import { authenticateUser, getUserById } from "#app/models/user.ts";
import { routes } from "#app/routes.ts";
import type { AuthIdentity, AuthSession } from "#app/utils/auth-session.ts";
import { normalizeEmail, parseAuthSession } from "#app/utils/auth-session.ts";
import * as s from "remix/data-schema";
import * as f from "remix/data-schema/form-data";

const loginSchema = f.object({
	email: f.field(s.defaulted(s.string(), "")),
	password: f.field(s.defaulted(s.string(), "")),
})

export function loadAuth() {
	return auth({
		schemes: [
			createSessionAuthScheme<AuthIdentity, AuthSession>({
				read(session) {
					return parseAuthSession(session.get("auth"))
				},
				async verify(value) {
					let user = await getUserById(value.userId)

					if (user == null) {
						return null
					}

					return { user }
				},
			}),
		],
	})
}

export const passwordProvider = createCredentialsAuthProvider({
	parse(context) {
		let result = s.parse(loginSchema, context.get(FormData))

		return {
			email: normalizeEmail(result.email),
			password: result.password,
		}
	},
	async verify(input) {
		return await authenticateUser(input.email, input.password)
	},
})

export const requireAuth = requireAuthenticated<AuthIdentity>({
	onFailure() {
		return redirect(routes.auth.login.index.href())
	},
})

export function getPostAuthRedirect(
	url: URL,
	fallback = routes.home.index.href(),
): string {
	return getSafeReturnTo(url.searchParams.get("returnTo")) ?? fallback
}

export function getReturnToQuery(url: URL): { returnTo?: string } {
	let returnTo = getSafeReturnTo(url.searchParams.get("returnTo"))
	return returnTo ? { returnTo } : {}
}

function getSafeReturnTo(returnTo: string | null): string | null {
	if (returnTo == null || returnTo === "") {
		return null
	}

	let isSafePath =
		returnTo.startsWith("/") && returnTo.startsWith("//") === false
	return isSafePath ? returnTo : null
}
