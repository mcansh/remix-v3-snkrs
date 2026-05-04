import type { Controller } from "remix/fetch-router"
import { redirect } from "remix/response/redirect"
import { Session } from "remix/session"

import { render } from "#app/lib/html.tsx"
import { requireAuth } from "#app/middleware/auth.ts"
import { routes } from "#app/routes.ts"

import { renderLogoutView } from "./logout-view.tsx"

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
				renderLogoutView({ error: typeof error === "string" ? error : undefined }),
			)
		},
	},
} satisfies Controller<typeof routes.auth.logout>
