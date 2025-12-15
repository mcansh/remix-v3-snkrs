import type { Controller } from "@remix-run/fetch-router"

import { Document } from "#app/components/document.js"
import { RestfulForm } from "#app/components/restful-form.js"
import { db, schema } from "#app/db/index.js"
import { render } from "#app/lib/html.js"
import { getUserByEmail } from "#app/models/user.js"
import { routes } from "#app/routes.js"
import { generateSalt, hash, toBase64 } from "@brielov/crypto"
import { createRedirectResponse } from "@remix-run/response/redirect"
import { decode } from "decode-formdata"
import * as z from "zod/mini"

const inputs = [
	{
		name: "given_name",
		label: "First Name",
		type: "text",
		autoComplete: "givenName",
	},
	{
		name: "family_name",
		label: "Last Name",
		type: "text",
		autoComplete: "familyName",
	},
	{
		name: "email",
		label: "Email Address",
		type: "email",
		autoComplete: "email",
	},
	{
		name: "username",
		label: "Username",
		type: "text",
		autoComplete: "username",
	},
	{
		name: "password",
		label: "Password",
		type: "password",
		autoComplete: "new-password",
	},
	{
		name: "confirm_password",
		label: "Confirm Password",
		type: "password",
		autoComplete: "new-password",
	},
] as const

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

		return createRedirectResponse(routes.sneakers.user.href({ user: createdUser.username }))
	},

	index({ session }) {
		let registerError = session.get("register")
		console.log({ registerError })
		return render(
			<Document>
				<div class="flex min-h-full flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
					<div class="sm:mx-auto sm:w-full sm:max-w-md">
						<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
							Join now and start showing off your collection
						</h2>
					</div>

					<div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
						<div class="rounded-lg bg-white px-4 py-8 shadow sm:px-10">
							<RestfulForm method="post" action={routes.auth.register.index.href()}>
								<fieldset class="space-y-6">
									{inputs.map((input) => {
										let error = null

										return (
											<div key={input.name}>
												<label htmlFor="email" class="block text-sm font-medium text-gray-700">
													{input.label}
												</label>
												<div class="mt-1">
													<input
														id={input.name}
														name={input.name}
														type={input.type}
														autoComplete={input.autoComplete}
														class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none aria-invalid:border-red-300 aria-invalid:text-red-900 aria-invalid:placeholder-red-300 aria-invalid:focus:border-red-500 aria-invalid:focus:ring-red-500 sm:text-sm"
														aria-invalid={error ? "true" : undefined}
														aria-errormessage={error ? `${input.name}-error` : undefined}
													/>
													{error ? (
														<div class="mt-2 text-sm text-red-600" id={`${input.name}-error`}>
															<p class="mt-1">{error}</p>
														</div>
													) : null}
												</div>
											</div>
										)
									})}

									<div class="flex items-center justify-between">
										<div class="text-sm">
											<span class="text-gray-900">Already have an account?</span>
										</div>
										<div class="text-sm">
											<a
												href={routes.auth.login.index.href()}
												class="font-medium text-indigo-600 hover:text-indigo-500"
											>
												Sign in
											</a>
										</div>
									</div>
									<div>
										<button
											type="submit"
											class="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
										>
											Join now
										</button>
									</div>
								</fieldset>
							</RestfulForm>
						</div>
					</div>
				</div>
			</Document>,
		)
	},
} satisfies Controller<typeof routes.auth.register>
