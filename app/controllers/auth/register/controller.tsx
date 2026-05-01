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

export const register = {
	actions: {
		async action({ get }) {
			let session = get(Session)
			let formData = get(FormData)
			const salt = generateSalt()

			let decoded = decode(formData)

			let result = s.parseSafe(registerSchema, decoded)

			if (result.success === false) {
				session.flash("error", "Please fill in all required fields.")
				return redirect(routes.auth.register.index.href())
			}

			// Check if user already exists
			if (await getUserByEmail(result.value.email)) {
				session.set("error", "An account with this email already exists.")
				return redirect(routes.auth.register.index.href())
			}

			if (result.value.password !== result.value.confirm_password) {
				session.flash("error", "Passwords do not match.")
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
				session.flash("error", "Failed to create account. Please try again.")
				return redirect(routes.auth.register.index.href())
			}

			session.set("auth", { userId: createdUser.id })

			return redirect(
				routes.showcase.user.href({ username: createdUser.username }),
			)
		},
		index({ get }) {
			let session = get(Session)
			let error = session.get("error")

			return render(
				<Document head={<title>Create Account</title>}>
					<div class="mx-auto mt-12 w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_40px_oklch(0.2_0.03_250/0.08)]">
						<h1 class="text-2xl font-semibold text-slate-900">Create account</h1>
						<p class="mt-1 text-sm text-slate-600">
							Set up your profile to start tracking your collection.
						</p>

						{typeof error === "string" ? (
							<div class="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
								{error}
							</div>
						) : null}

						<RestfulForm
							method="post"
							action={routes.auth.register.action.href()}
							class="mt-5 grid gap-4 md:grid-cols-2"
						>
							<label class="grid gap-1.5 text-sm text-slate-700" for="given_name">
								First name
								<input
									id="given_name"
									name="given_name"
									type="text"
									autoComplete="given-name"
									required
									class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
								/>
							</label>

							<label class="grid gap-1.5 text-sm text-slate-700" for="family_name">
								Last name
								<input
									id="family_name"
									name="family_name"
									type="text"
									autoComplete="family-name"
									required
									class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
								/>
							</label>

							<label class="grid gap-1.5 text-sm text-slate-700 md:col-span-2" for="email">
								Email
								<input
									id="email"
									name="email"
									type="email"
									autoComplete="email"
									required
									class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
								/>
							</label>

							<label class="grid gap-1.5 text-sm text-slate-700 md:col-span-2" for="username">
								Username
								<input
									id="username"
									name="username"
									type="text"
									autoComplete="username"
									required
									class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
								/>
							</label>

							<label class="grid gap-1.5 text-sm text-slate-700" for="password">
								Password
								<input
									id="password"
									name="password"
									type="password"
									autoComplete="new-password"
									required
									minLength={8}
									class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
								/>
							</label>

							<label class="grid gap-1.5 text-sm text-slate-700" for="confirm_password">
								Confirm password
								<input
									id="confirm_password"
									name="confirm_password"
									type="password"
									autoComplete="new-password"
									required
									minLength={8}
									class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
								/>
							</label>

							<div class="md:col-span-2">
								<button
									type="submit"
									class="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
								>
									Create account
								</button>
							</div>
						</RestfulForm>

						<p class="mt-4 text-sm text-slate-600">
							Already have an account?{" "}
							<a
								href={routes.auth.login.index.href()}
								class="font-medium text-blue-700 no-underline hover:underline"
							>
								Sign in
							</a>
						</p>
					</div>
				</Document>,
			)
		},
	},
} satisfies Controller<typeof routes.auth.register>
