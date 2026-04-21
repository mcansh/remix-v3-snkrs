import * as z from "zod/mini"
import type { Controller } from "@remix-run/fetch-router"
import { createRedirectResponse } from "@remix-run/response/redirect"
import { decode } from "decode-formdata"

import { Document } from "#src/components/document.tsx"
import { RestfulForm } from "#src/components/restful-form.tsx"
import { render } from "#src/lib/html.tsx"
import { authenticateUser } from "#src/models/user.ts"
import { routes } from "#src/routes.ts"

export const loginHandlers = {
	middleware: [],
	async action({ formData, session }) {
		let loginSchema = z.object({
			email: z.email(),
			password: z.string(),
			return_to: z.optional(z.string()),
		})

		let decoded = decode(formData)

		let result = loginSchema.safeParse(decoded)

		if (!result.success) {
			console.error(result.error)
			return createRedirectResponse(routes.auth.login.index.href())
		}

		let user = await authenticateUser(result.data.email, result.data.password)
		let returnTo = result.data.return_to || routes.home.index.href()

		if (!user) {
			session.flash("error", "Invalid email or password. Please try again.")
			return createRedirectResponse(
				routes.auth.login.index.href(undefined, { returnTo }),
			)
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

		return createRedirectResponse(returnTo)
	},

	async index({ url, session }) {
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
					<input type="email" name="email" />
					<input type="password" name="password" />

					<button class="inline-flex" type="submit">
						Login
					</button>
				</RestfulForm>
			</Document>,
		)
	},
} satisfies Controller<typeof routes.auth.login>
