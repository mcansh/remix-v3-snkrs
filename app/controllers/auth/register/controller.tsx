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

type RegisterValues = {
	email?: string
	username?: string
	given_name?: string
	family_name?: string
}

type RegisterErrors = {
	email?: string
	username?: string
	password?: string
	confirm_password?: string
	given_name?: string
	family_name?: string
	general?: string
}

function getRegisterFieldErrors(issues: unknown): RegisterErrors {
	if (!Array.isArray(issues)) return { general: "Please check your inputs." }

	let errors: RegisterErrors = {}

	for (let issue of issues) {
		if (typeof issue !== "object" || issue === null) continue

		let path = "path" in issue ? (issue.path as unknown) : null
		let message = "message" in issue ? issue.message : null
		let field = Array.isArray(path) ? path.at(0) : null

		if (typeof field === "string" && typeof message === "string") {
			if (
				field === "email" ||
				field === "username" ||
				field === "password" ||
				field === "confirm_password" ||
				field === "given_name" ||
				field === "family_name"
			) {
				errors[field] = message
			}
		}
	}

	if (
		!errors.email &&
		!errors.username &&
		!errors.password &&
		!errors.confirm_password &&
		!errors.given_name &&
		!errors.family_name
	) {
		errors.general = "Please check your inputs."
	}

	return errors
}

export const register = {
	actions: {
		async action({ get }) {
			let session = get(Session)
			let formData = get(FormData)
			const salt = generateSalt()
			let values: RegisterValues = {
				email: typeof formData.get("email") === "string" ? String(formData.get("email")) : "",
				username:
					typeof formData.get("username") === "string"
						? String(formData.get("username"))
						: "",
				given_name:
					typeof formData.get("given_name") === "string"
						? String(formData.get("given_name"))
						: "",
				family_name:
					typeof formData.get("family_name") === "string"
						? String(formData.get("family_name"))
						: "",
			}

			let decoded = decode(formData)

			let result = s.parseSafe(registerSchema, decoded)

			if (result.success === false) {
				session.flash("formErrors", getRegisterFieldErrors(result.issues))
				session.flash("formValues", values)
				return redirect(routes.auth.register.index.href())
			}

			// Check if user already exists
			if (await getUserByEmail(result.value.email)) {
				session.flash("formErrors", {
					email: "An account with this email already exists.",
				} satisfies RegisterErrors)
				session.flash("formValues", values)
				return redirect(routes.auth.register.index.href())
			}

			if (result.value.password !== result.value.confirm_password) {
				session.flash("formErrors", {
					confirm_password: "Passwords do not match.",
				} satisfies RegisterErrors)
				session.flash("formValues", values)
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
				session.flash("formErrors", {
					general: "Failed to create account. Please try again.",
				} satisfies RegisterErrors)
				session.flash("formValues", values)
				return redirect(routes.auth.register.index.href())
			}

			session.set("auth", { userId: createdUser.id })

			return redirect(
				routes.showcase.user.href({ username: createdUser.username }),
			)
		},
		index({ get }) {
			let session = get(Session)
			let formErrors = session.get("formErrors") as RegisterErrors | undefined
			let formValues = session.get("formValues") as RegisterValues | undefined

			return render(
				<Document head={<title>Create Account</title>}>
					<div class="mx-auto mt-12 w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_40px_oklch(0.2_0.03_250/0.08)]">
						<h1 class="text-2xl font-semibold text-slate-900">Create account</h1>
						<p class="mt-1 text-sm text-slate-600">
							Set up your profile to start tracking your collection.
						</p>

						{typeof formErrors?.general === "string" ? (
							<div class="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
								{formErrors.general}
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
									defaultValue={formValues?.given_name ?? ""}
									class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
								/>
								{formErrors?.given_name ? (
									<span class="text-xs text-rose-700">{formErrors.given_name}</span>
								) : null}
							</label>

							<label class="grid gap-1.5 text-sm text-slate-700" for="family_name">
								Last name
								<input
									id="family_name"
									name="family_name"
									type="text"
									autoComplete="family-name"
									required
									defaultValue={formValues?.family_name ?? ""}
									class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
								/>
								{formErrors?.family_name ? (
									<span class="text-xs text-rose-700">{formErrors.family_name}</span>
								) : null}
							</label>

							<label class="grid gap-1.5 text-sm text-slate-700 md:col-span-2" for="email">
								Email
								<input
									id="email"
									name="email"
									type="email"
									autoComplete="email"
									required
									defaultValue={formValues?.email ?? ""}
									class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
								/>
								{formErrors?.email ? (
									<span class="text-xs text-rose-700">{formErrors.email}</span>
								) : null}
							</label>

							<label class="grid gap-1.5 text-sm text-slate-700 md:col-span-2" for="username">
								Username
								<input
									id="username"
									name="username"
									type="text"
									autoComplete="username"
									required
									defaultValue={formValues?.username ?? ""}
									class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
								/>
								{formErrors?.username ? (
									<span class="text-xs text-rose-700">{formErrors.username}</span>
								) : null}
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
								{formErrors?.password ? (
									<span class="text-xs text-rose-700">{formErrors.password}</span>
								) : null}
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
								{formErrors?.confirm_password ? (
									<span class="text-xs text-rose-700">
										{formErrors.confirm_password}
									</span>
								) : null}
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
