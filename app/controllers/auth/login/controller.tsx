import * as s from "remix/data-schema"
import { email } from "remix/data-schema/checks"
import * as f from "remix/data-schema/form-data"
import type { Controller } from "remix/fetch-router"
import { redirect } from "remix/response/redirect"
import { Session } from "remix/session"

import { Document } from "#app/components/document.tsx"
import { RestfulForm } from "#app/components/restful-form.tsx"
import { render } from "#app/lib/html.tsx"
import { getPostAuthRedirect } from "#app/middleware/auth.ts"
import { authenticateUser } from "#app/models/user.ts"
import { routes } from "#app/routes.ts"
import { getCurrentUserSafely } from "#app/utils/context.ts"
import { completeAuth } from "remix/auth"

let loginSchema = f.object({
	email: f.field(s.string().pipe(email())),
	password: f.field(s.string()),
	return_to: f.field(s.optional(s.string())),
})

export const login = {
	middleware: [],
	actions: {
		async action(context) {
			let formData = context.get(FormData)
			let returnToFromForm = formData.get("return_to")
			let returnTo =
				typeof returnToFromForm === "string" && returnToFromForm.length > 0
					? returnToFromForm
					: routes.home.index.href()

			let result = s.parseSafe(loginSchema, formData)

			if (result.success === false) {
				let session = context.get(Session)
				session.flash("error", "Please enter a valid email and password.")
				return redirect(routes.auth.login.index.href(undefined, { returnTo }))
			}

			let user = await authenticateUser(
				result.value.email,
				result.value.password,
			)
			returnTo = result.value.return_to || routes.home.index.href()

			if (user == null) {
				let session = context.get(Session)
				session.flash("error", "Invalid email or password. Please try again.")
				return redirect(routes.auth.login.index.href(undefined, { returnTo }))
			}

			let session = completeAuth(context)
			session.set("auth", { userId: user.id })

			return redirect(getPostAuthRedirect(context.url))
		},

		async index({ get, url }) {
			let session = get(Session)
			let returnTo = url.searchParams.get("returnTo")
			let error = session.get("error")

			let user = getCurrentUserSafely()

			if (user) {
				return redirect(routes.home.index.href())
			}

			return render(
				<Document head={<title>Sign In</title>}>
					<div class="mx-auto mt-12 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_40px_oklch(0.2_0.03_250/0.08)]">
						<h1 class="text-2xl font-semibold text-slate-900">Sign in</h1>
						<p class="mt-1 text-sm text-slate-600">
							Welcome back. Enter your credentials to continue.
						</p>

						{typeof error === "string" ? (
							<div class="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
								{error}
							</div>
						) : null}

						<RestfulForm
							method="post"
							action={routes.auth.login.action.href()}
							class="mt-5 grid gap-4"
						>
							{returnTo ? (
								<input type="hidden" name="return_to" value={returnTo} />
							) : null}

							<label class="grid gap-1.5 text-sm text-slate-700" for="email">
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

							<label class="grid gap-1.5 text-sm text-slate-700" for="password">
								Password
								<input
									id="password"
									name="password"
									type="password"
									autoComplete="current-password"
									required
									class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
								/>
							</label>

							<button
								type="submit"
								class="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
							>
								Sign in
							</button>
						</RestfulForm>

						<p class="mt-4 text-sm text-slate-600">
							Need an account?{" "}
							<a
								href={routes.auth.register.index.href()}
								class="font-medium text-blue-700 no-underline hover:underline"
							>
								Create one
							</a>
						</p>
					</div>
				</Document>,
			)
		},
	},
} satisfies Controller<typeof routes.auth.login>
