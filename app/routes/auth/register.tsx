import { generateSalt, hash, toBase64 } from "@brielov/crypto"
import type { Controller } from "@remix-run/fetch-router"
import { createRedirectResponse } from "@remix-run/response/redirect"
import { decode } from "decode-formdata"
import * as z from "zod/mini"

import { Document } from "#app/components/document.js"
import { RestfulForm } from "#app/components/restful-form.js"
import { db, schema } from "#app/db/index.js"
import { render } from "#app/lib/html.js"
import { generateUsername, getUserByEmail } from "#app/models/user.js"
import { routes } from "#app/routes.js"
import type { FlashSessionData } from "#app/utils/session.js"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#app/components/ui/card.js"
import { Label } from "#app/components/ui/label.js"
import { Input } from "#app/components/ui/input.js"
import { Button } from "#app/components/ui/button.js"

export const registerSchema = z.object({
	email: z.email(),
	username: z.string(),
	password: z.string().check(z.minLength(8)),
	confirm_password: z.string().check(z.minLength(8)),
	given_name: z.string().check(z.minLength(1)),
	family_name: z.string().check(z.minLength(1)),
})

export const registerHandlers = {
	async action({ formData, session }) {
		let salt = generateSalt()
		let decoded = decode(formData)
		let result = registerSchema.safeParse(decoded)

		if (!result.success) {
			console.error(result.error)
			session.flash(
				"register-form-errors",
				z.treeifyError(result.error).properties,
			)
			return createRedirectResponse(routes.auth.register.index.href())
		}

		let userExists = await getUserByEmail(result.data.email)

		// Check if user already exists
		if (userExists) {
			session.flash("register-form-errors", {
				email: ["An account with this email already exists."],
			})
			return createRedirectResponse(routes.auth.register.index.href())
		}

		if (result.data.password !== result.data.confirm_password) {
			console.error("Passwords do not match")
			session.flash("register-form-errors", {
				password: ["Passwords do not match"],
				confirm_password: ["Passwords do not match"],
			})
			return createRedirectResponse(routes.auth.register.index.href())
		}

		let passwordHash = await hash(result.data.password, salt)
		let createdUsers = await db
			.insert(schema.users)
			.values({
				email: result.data.email,
				family_name: result.data.family_name,
				given_name: result.data.given_name,
				username: await generateUsername(result.data.username),
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

	index({ session }) {
		let registerError = session.get("register")
		let formErrors = session.get("register-form-errors")
		ensureRegisterFormErrors(formErrors)

		let formAction = routes.auth.register.action.href()

		return render(
			<Document>
				<div className="min-h-screen flex items-center justify-center bg-background p-4">
					<div className="w-full max-w-md">
						<div className="mb-8 text-center">
							<h1 className="font-mono text-4xl font-bold text-foreground mb-2">
								SNEAKER VAULT
							</h1>
							<p className="text-muted-foreground">
								Create your account to start collecting
							</p>
						</div>

						<Card class="border-border bg-card">
							<CardHeader class="space-y-1">
								<CardTitle class="text-2xl font-bold">
									Create an account
								</CardTitle>
								<CardDescription>
									Start building your sneaker collection today
								</CardDescription>
							</CardHeader>

							<CardContent>
								<RestfulForm
									class="space-y-4"
									action={formAction}
									method="POST"
								>
									<div class="space-y-2">
										<Label htmlFor="given_name">First Name</Label>
										<Input
											id="given_name"
											type="text"
											placeholder="John"
											required
											class="bg-secondary border-border"
											name="given_name"
											autoComplete="given-name"
										/>
									</div>
									<div class="space-y-2">
										<Label htmlFor="family_name">Last Name</Label>
										<Input
											id="family_name"
											type="text"
											placeholder="Doe"
											required
											class="bg-secondary border-border"
											name="family_name"
											autoComplete="family-name"
										/>
									</div>
									<div class="space-y-2">
										<Label htmlFor="username">Username</Label>
										<Input
											id="username"
											type="text"
											placeholder="johndoe"
											required
											class="bg-secondary border-border"
											name="username"
											autoComplete="username"
										/>
									</div>
									<div class="space-y-2">
										<Label htmlFor="email">Email</Label>
										<Input
											id="email"
											type="email"
											placeholder="kicks@example.com"
											required
											class="bg-secondary border-border"
											name="email"
											autoComplete="email"
										/>
									</div>
									<div class="space-y-2">
										<Label htmlFor="password">Password</Label>
										<Input
											id="password"
											type="password"
											placeholder="••••••••"
											required
											class="bg-secondary border-border"
											name="password"
											autoComplete="new-password"
										/>
									</div>
									<div class="space-y-2">
										<Label htmlFor="confirm_password">Confirm Password</Label>
										<Input
											id="confirm_password"
											type="password"
											placeholder="••••••••"
											required
											class="bg-secondary border-border"
											name="confirm_password"
											autoComplete="new-password"
										/>
									</div>

									<Button
										type="submit"
										class="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
										// disabled={isLoading}
									>
										{/* {isLoading ? "Creating account..." : "Create account"} */}
										Join now
									</Button>
								</RestfulForm>
							</CardContent>
						</Card>

						<p className="mt-6 text-center text-sm text-muted-foreground">
							Already have an account?{" "}
							<a
								href={routes.auth.login.index.href()}
								className="text-primary hover:underline font-medium"
							>
								Log in
							</a>
						</p>
					</div>
				</div>
			</Document>,
		)
	},
} satisfies Controller<typeof routes.auth.register>

function ensureRegisterFormErrors(
	value: unknown,
): asserts value is FlashSessionData["register-form-errors"] {
	if (
		value !== undefined &&
		(typeof value !== "object" || value === null || Array.isArray(value))
	) {
		throw new Error("Invalid register form errors in flash session")
	}
}
