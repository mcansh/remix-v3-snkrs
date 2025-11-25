import * as z from "zod/mini"
import type { RouteHandlers } from "@remix-run/fetch-router"
import { createRedirectResponse } from "@remix-run/response/redirect"
import { decode } from "decode-formdata"

import { Document } from "#src/components/document.tsx"
import { RestfulForm } from "#src/components/restful-form.tsx"
import { render } from "#src/lib/html.tsx"
import { authenticateUser, getUserById } from "#src/models/user.ts"
import { routes } from "#src/routes.ts"
import {
	getSession,
	getUserIdFromSession,
	login,
	setSessionCookie,
} from "#src/utils/session.ts"

export const loginHandlers = {
	async action({ formData, request }) {
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

		if (!user) {
			return render(
				<Document>
					<div class="card" style="max-width: 500px; margin: 2rem auto;">
						<div class="alert alert-error">
							Invalid email or password. Please try again.
						</div>
						<p>
							<a href={routes.auth.login.index.href()} class="btn">
								Back to Login
							</a>
						</p>
					</div>
				</Document>,
				{ status: 401 },
			)
		}

		let session = getSession(request)
		login(session.sessionId, user)

		let headers = new Headers()
		setSessionCookie(headers, session.sessionId)

		let returnTo = result.data.return_to || routes.home.index.href()

		return createRedirectResponse(returnTo, { headers })
	},

	async index({ request, url }) {
		let session = getSession(request)
		let userId = getUserIdFromSession(session.sessionId)
		let user = userId ? await getUserById(userId) : null
		if (user) return createRedirectResponse(routes.sneakers.index.href())

		let returnTo = url.searchParams.get("returnTo")
		return render(
			<Document>
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
} satisfies RouteHandlers<typeof routes.auth.login>
