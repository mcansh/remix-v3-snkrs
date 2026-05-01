import { generateSalt, hash, toBase64 } from "@brielov/crypto"
import { decode } from "decode-formdata"
import * as s from "remix/data-schema"
import { email, minLength } from "remix/data-schema/checks"
import * as f from "remix/data-schema/form-data"
import type { Controller } from "remix/fetch-router"
import { redirect } from "remix/response/redirect"
import { Session } from "remix/session"

import { Document } from "#app/components/document.tsx"
import { RestfulForm } from "#app/components/restful-form.tsx"
import { schema } from "#app/db/index.ts"
import { env } from "#app/env.ts"
import { render } from "#app/lib/html.tsx"
import { getUserByEmail } from "#app/models/user.ts"
import { routes } from "#app/routes.ts"

let registerSchema = f.object({
	email: f.field(s.string().pipe(email())),
	username: f.field(s.string()),
	password: f.field(s.string().pipe(minLength(8))),
	confirm_password: f.field(s.string().pipe(minLength(8))),
	given_name: f.field(s.string()),
	family_name: f.field(s.string()),
})

export const registerHandlers = {
	actions: {
		async action({ get }) {
			let session = get(Session)
			let formData = get(FormData)
			const salt = generateSalt()

			let decoded = decode(formData)

			let result = s.parseSafe(registerSchema, decoded)

			if (result.success === false) {
				console.error(result.issues)
				return redirect(routes.auth.register.index.href())
			}

			// Check if user already exists
			if (await getUserByEmail(result.value.email)) {
				session.set("error", "An account with this email already exists.")
				return redirect(routes.auth.register.index.href())
			}

			if (result.value.password !== result.value.confirm_password) {
				console.error("Passwords do not match")
				return redirect(routes.auth.register.index.href())
			}

			let passwordHash = await hash(result.value.password, salt)
			let createdUsers = await env.db
				.insert(schema.users)
				.values({
					email: result.value.email,
					family_name: result.value.family_name,
					given_name: result.value.given_name,
					username: result.value.username,
					password: toBase64(passwordHash),
					password_salt: toBase64(salt),
				})
				.returning()

			let createdUser = createdUsers.at(0)

			if (!createdUser) {
				console.error("Failed to create user")
				return redirect(routes.auth.register.index.href())
			}

			session.set("userId", createdUser.id)

			return redirect(
				routes.showcase.user.href({ username: createdUser.username }),
			)
		},
		index() {
			return render(
				<Document head={<title>Hello, World!</title>}>
					<h1>Hello, World!</h1>

					<RestfulForm
						method="post"
						action={routes.auth.register.action.href()}
					>
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
	},
} satisfies Controller<typeof routes.auth.register>
