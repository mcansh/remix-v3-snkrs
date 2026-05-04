import type { Controller } from "remix/fetch-router"
import { redirect } from "remix/response/redirect"

import { render } from "#app/lib/html.tsx"
import { routes } from "#app/routes.ts"
import { getCurrentUserSafely } from "#app/utils/context.ts"

import { HomeView } from "./home-view.tsx"

export const homeHandlers = {
	actions: {
		home() {
			return render(<HomeView />)
		},
		index() {
			let user = getCurrentUserSafely()
			if (user) {
				return redirect(routes.sneakers.index.href())
			}
			return render(<HomeView />)
		},
	},
} satisfies Controller<typeof routes.home>
