import type { Controller } from "remix/fetch-router"
import { redirect } from "remix/response/redirect"
import { Session } from "remix/session"

import { Document } from "#app/components/document.tsx"
import { render } from "#app/lib/html.tsx"
import { requireAuth } from "#app/middleware/auth.ts"
import { routes } from "#app/routes.ts"

export const logout = {
	middleware: [requireAuth],
	actions: {
		async action(context) {
			let session = context.get(Session)
			session.destroy()
			return redirect(routes.home.index.href())
		},

		index({ get }) {
			let session = get(Session)
			let error = session.get("error")

			return render(
				<Document>
					{typeof error === "string" ? (
						<div class="alert alert-error" style="margin-bottom: 1.5rem;">
							{error}
						</div>
					) : null}

					<form method="post" action={routes.auth.logout.action.href()}>
						<button type="submit" class="inline-flex">
							Logout
						</button>
					</form>
				</Document>,
			)
		},
	},
} satisfies Controller<typeof routes.auth.logout>
