import * as z from "zod/mini"
import { generateSalt, hash, toBase64 } from "@brielov/crypto"
import type { Controller } from "@remix-run/fetch-router"
import { createRedirectResponse } from "@remix-run/response/redirect"
import { decode } from "decode-formdata"

import { Document } from "#app/components/document.js"
import { RestfulForm } from "#app/components/restful-form.js"
import { db, schema } from "#app/db/index.js"
import { render } from "#app/lib/html.js"
import { getUserByEmail } from "#app/models/user.js"
import { routes } from "#app/routes.js"

export const registerHandlers = {
	async action({ formData, session }) {
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
			return createRedirectResponse(routes.auth.register.index.href())
		}

		let userExists = await getUserByEmail(result.data.email)

		// Check if user already exists
		if (userExists) {
			session.flash("register", "An account with this email already exists.")
			return createRedirectResponse(routes.auth.register.index.href())
		}

		if (result.data.password !== result.data.confirm_password) {
			console.error("Passwords do not match")
			return createRedirectResponse(routes.auth.register.index.href())
		}

		let passwordHash = await hash(result.data.password, salt)
		let createdUsers = await db
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
			session.flash("register", "Something went wrong, please try again.")
			return createRedirectResponse(routes.auth.register.index.href())
		}

		session.set("userId", createdUser.id)

		return createRedirectResponse(
			routes.sneakers.user.href({ user: createdUser.username }),
		)
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
} satisfies Controller<typeof routes.auth.register>
