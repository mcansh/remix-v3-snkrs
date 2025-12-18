import type { BuildAction } from "@remix-run/fetch-router"

import { Counter } from "#app/assets/counter.js"
import { renderDocument } from "#app/lib/html.js"
import { routes } from "#app/routes.js"
import { getCurrentUserSafely } from "#app/utils/context.js"
import { createRedirectResponse } from "@remix-run/response/redirect"
import { loadAuth } from "#app/middleware/auth.js"

export const homeHandlers = {
	middleware: [loadAuth()],
	action() {
		let currentUser = getCurrentUserSafely()

		if (!currentUser) {
			return createRedirectResponse(routes.auth.login.index.href())
		}

		return renderDocument(
			<>
				<title>Hello, World!</title>
				<h1>Hello, World!</h1>
				<Counter />
			</>,
		)
	},
} satisfies BuildAction<"GET", typeof routes.home>
