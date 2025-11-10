import * as z from "zod/mini"
import { generateSalt, hash, toBase64 } from "@brielov/crypto"
import type { RouteHandlers } from "@remix-run/fetch-router"
import { redirect } from "@remix-run/fetch-router/response-helpers"
import { decode } from "decode-formdata"

import { Document } from "#src/components/document.tsx"
import { RestfulForm } from "#src/components/restful-form.tsx"
import { schema } from "#src/db/index.ts"
import { env } from "#src/lib/env.ts"
import { render } from "#src/lib/html.tsx"
import { routes } from "#src/routes.ts"
import { getSession, login, setSessionCookie } from "#src/utils/session.ts"

export const registerHandlers = {
	async action({ formData, request }) {
		const salt = generateSalt()

		let registerSchema = z.object({
			email: z.email(),
			username: z.string(),
			password: z.string().check(z.minLength(8)),
			confirm_password: z.string().check(z.minLength(8)),
			given_name: z.string(),
			family_name: z.string(),
		})

		let decoded = decode(formData)

		let result = registerSchema.safeParse(decoded)

		if (!result.success) {
			console.error(result.error)
			return redirect(routes.auth.register.index.href())
		}

		if (result.data.password !== result.data.confirm_password) {
			console.error("Passwords do not match")
			return redirect(routes.auth.register.index.href())
		}

		let passwordHash = await hash(result.data.password, salt)
		let createdUsers = await env.db
			.insert(schema.users)
			.values({
				email: result.data.email,
				family_name: result.data.family_name,
				given_name: result.data.given_name,
				username: result.data.username,
				password: toBase64(passwordHash),
				password_salt: toBase64(salt),
			})
			.returning()

		let createdUser = createdUsers.at(0)

		if (!createdUser) {
			console.error("Failed to create user")
			return redirect(routes.auth.register.index.href())
		}

		let session = getSession(request)
		login(session.sessionId, createdUser)

		let headers = new Headers()
		setSessionCookie(headers, session.sessionId)

		return redirect(routes.home.index.href(), { headers })
	},
	index() {
		return render(
			<Document>
				<title>Hello, World!</title>
				<h1>Hello, World!</h1>

				<RestfulForm method="post" action={routes.auth.register.action.href()}>
					<input type="hidden" name="email" value="logan@mcan.sh" />
					<input type="hidden" name="username" value="logan" />
					<input
						type="hidden"
						name="password"
						value="mypasswordisbetterthanyours"
					/>
					<input
						type="hidden"
						name="confirm_password"
						value="mypasswordisbetterthanyours"
					/>
					<input type="hidden" name="given_name" value="Logan" />
					<input type="hidden" name="family_name" value="McAnsh" />

					<button type="submit">Register</button>
				</RestfulForm>
			</Document>,
		)
	},
} satisfies RouteHandlers<typeof routes.auth.register>
