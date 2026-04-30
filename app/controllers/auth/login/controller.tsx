import * as s from "remix/data-schema"
import { email } from "remix/data-schema/checks"
import * as f from "remix/data-schema/form-data"
import type { Controller } from "remix/fetch-router"
import { redirect } from "remix/response/redirect"
import { Session } from "remix/session"

import { Document } from "#app/components/document.tsx"
import { RestfulForm } from "#app/components/restful-form.tsx"
import { render } from "#app/lib/html.tsx"
import { authenticateUser } from "#app/models/user.ts"
import { routes } from "#app/routes.ts"

export const loginHandlers = {
	middleware: [],
	actions: {
		async action({ get }) {
			let session = get(Session)
			let formData = get(FormData)

			let loginSchema = f.object({
				email: f.field(s.string().pipe(email())),
				password: f.field(s.string()),
				return_to: f.field(s.optional(s.string())),
			})

			let result = s.parseSafe(loginSchema, formData)

			if (result.success === false) {
				console.error(result.issues)
				return redirect(routes.auth.login.index.href())
			}

			let user = await authenticateUser(
				result.value.email,
				result.value.password,
			)
			let returnTo = result.value.return_to || routes.home.index.href()

			if (!user) {
				session.flash("error", "Invalid email or password. Please try again.")
				return redirect(routes.auth.login.index.href(undefined, { returnTo }))
			}

			session.set("userId", user.id)

			// if (!user) {
			// 	return render(
			// 		<Document>
			// 			<div class="card" style="max-width: 500px; margin: 2rem auto;">
			// 				<div class="alert alert-error">
			// 					Invalid email or password. Please try again.
			// 				</div>
			// 				<p>
			// 					<a href={routes.auth.login.index.href()} class="btn">
			// 						Back to Login
			// 					</a>
			// 				</p>
			// 			</div>
			// 		</Document>,
			// 		{ status: 401 },
			// 	)
			// }

			return redirect(returnTo)
		},

		async index({ get, url }) {
			let session = get(Session)
			let returnTo = url.searchParams.get("returnTo")
			let error = session.get("error")

			return render(
				<Document>
					{typeof error === "string" ? (
						<div class="alert alert-error" style="margin-bottom: 1.5rem;">
							{error}
						</div>
					) : null}

					<RestfulForm
						method="post"
						action={routes.auth.login.action.href()}
						class="flex flex-col"
					>
						{returnTo ? (
							<input type="hidden" name="return_to" value={returnTo} />
						) : null}
						<input type="email" name="email" value="logan@mcan.sh" />
						<input
							type="password"
							name="password"
							value="mypasswordisbetterthanyours"
						/>

						<button class="inline-flex" type="submit">
							Login
						</button>
					</RestfulForm>
				</Document>,
			)
		},
	},
} satisfies Controller<typeof routes.auth.login>
